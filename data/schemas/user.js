var UserSchema, activationMsgMap, resetPasswordMsgMap,
  Schema                  = require('mongoose').Schema,
  async                   = require('async'),
  hash                    = require('../helpers/secure_pass').hash,
  sendgrid                = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD),
  randomString            = require('../helpers/random_string');

activationMsgMap = {
  "html": "<p>Chào {{username}}.</p><p>Cảm ơn bạn đã đăng ký tài khoản trên  {{url}}</p><p>Vui lòng click đường link sau để kích hoạt tài khoản <a href='{{activate_link}}'>activate</a></p>",
  "text": "Chào {{username}}. Cảm ơn bạn đã đăng ký tài khoản trên  {{url}}. Vui lòng click đường link sau để kích hoạt tài khoản {{activate_link}}",
  "subject": "Kích hoạt tài khoản",
  "from_email": process.env.NOTIFIER_EMAIL_ADD,
  "from_name": process.env.NOTIFIER_NAME
};

resetPasswordMsgMap = {
  "html": "<p>Chào {{username}}.</p><p>Chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản của bạn trên {{url}}. Để đổi mật khẩu vui lòng click đường link sau: <a href='{{reset_password_link}}'>reset</a></p>",
  "text": "Chào {{username}}. Chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản của bạn trên {{url}}. Để đổi mật khẩu vui lòng click đường link sau: {{reset_password_link}}",
  "subject": "Thay đổi mật khẩu",
  "from_email": process.env.NOTIFIER_EMAIL_ADD,
  "from_name": process.env.NOTIFIER_NAME
};
// ** End module scope variables

UserSchema = new Schema({
  // (1): registered, (2): [1] + activated, (3): [2] + followed topic, (4): [3] + followed users
  status    : { type: Number, required: true, default: 1},
  username  : { type: String, required: true, unique: true },
  full_name : { type: String, required: true },
  email     : { type: String, required: true, unique: true},
  picture   : String,

  following : {
    user_ids     : [{ type : Schema.Types.ObjectId, ref : 'User' }],
    topic_ids    : [{ type : Schema.Types.ObjectId, ref : 'Topic' }],
    question_ids : [{ type : Schema.Types.ObjectId, ref : 'Question' }]
  },

  activity_ids       : [{ type : Schema.Types.ObjectId, ref : 'Activity' }],
  notification_ids   : [{ type : Schema.Types.ObjectId, ref : 'Notification' }],

  password      : String,
  password_salt : String,

  token: { // activation token or reset password token
    activation      : {type: String, unique: true, sparse: true},
    reset_password  : {type: String, unique: true, sparse: true},
    oauth           : {type: String, sparse: true}
  },

  sign_up_type: { type : String,  enum: [ 'email', 'google', 'facebook' ] },

  reputation  : { type : Number,  required : true, default : 0 },
  created_at  : { type : Date,    required : true, default : Date.now },
  updated_at  : { type : Date,    required : true, default : Date.now }
});

UserSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

UserSchema.static('filterInputs', function (req_body) {
  delete req_body.activity_ids;
  delete req_body.following;
  delete req_body.notification_ids;
  delete req_body.sign_up_type;
  delete req_body.status;
  delete req_body.token;
  delete req_body.reputation;
  delete req_body.created_at;
  delete req_body.updated_at;
});

UserSchema.static('errorHandler', function (err, req, res, next) {
  var message, indexName, suffixes, suffix,
    error_msg_list = [];

  if ((err.name !== 'ValidationError') && (err.code !== 11000)) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    if (err.errors.full_name) {
      error_msg_list.push('invalid fullname');
    }
    if (err.errors.email) {
      error_msg_list.push('invalid email');
    }
  }

  if (err.code === 11000) {
    message = err.err;
    if (message.indexOf(req.body.email) !== -1) {
      error_msg_list.push('duplicate email');
    }
  }

  return res.json({msg: error_msg_list}, 400);
});

UserSchema.static('newPassword', function (req, res, next) {
  var make_hash_password, update_user, password_salt, password_hash,
    self = this;

  if (!req.body.password || (req.body.password.length < 6)) {
    return res.json({msg: 'new password too short'}, 400);
  }

  make_hash_password = function (next) {
    hash(req.body.password, function (err, salt, hash) {
      if (err) { return next(err); }

      password_salt = salt;
      password_hash = hash;
      next();
    });
  };

  update_user = function (next) {
    // initialize user for password after signup not using email
    if (req.session.user && (req.session.user.sign_up_type !== 'email')) {
      return self.findById(req.session.user._id, function (err, user) {
        user.password = password_hash;
        user.password_salt = password_salt;
        user.save(function (err) {
          if (err) { return next(err); }
          req.session.user = user;
          next();
        });
      });
    }
    // change user password
    self.findOne({'token.reset_password': req.body.reset_pwd_token}, function (err, user) {
      if (err) { return next(err); }

      if (!user) {
        return res.json({ msg: 'Invalid password reset token' }, 403);
      }

      delete user.token.reset_password;

      user.password       = password_hash;
      user.password_salt  = password_salt;

      user.save(function (err) {
        if (err) {
          return self.errorHandler(err, req, res, next);
        }
        next();
      });
    });
  };

  async.series([make_hash_password, update_user], function (err, results) {
    if (err) { return next(err); }

    req.session.message.info.push('Change password successful');

    return res.json({msg: 'Change password successful'}, 200);
  });
});

UserSchema.static('resetPassword', function (req, res, next) {
  var update_user, email_reset_link,
    url   = req.protocol + "://" + req.get('host');

  // check activation status
  if (req.user.status === 1) {
    return res.json({msg: 'user not activated'}, 403);
  }

  update_user = function (next) {
    req.user.token.reset_password = randomString(100, '#aA!');

    req.user.save(function (err) {
      if (err) {
        if (err.code === 11000 && (err.err.indexOf(req.user.token.reset_password) !== -1)) {
          return update_user(next);
        }
        return next(err);
      }
      next();
    });
  };

  email_reset_link = function (next) {
    sendgrid.send({
      to: req.user.email,
      from: resetPasswordMsgMap.from_email,
      subject: resetPasswordMsgMap.subject,
      text: resetPasswordMsgMap.text.replace("{{url}}", url).replace("{{reset_password_link}}", url + "/change-password/" + req.user.token.reset_password).replace("{{username}}", req.user.username),
      html: resetPasswordMsgMap.html.replace("{{url}}", url).replace("{{reset_password_link}}", url + "/change-password/" + req.user.token.reset_password).replace("{{username}}", req.user.username)
    }, function (err, json) {
      if (err) { return next(err); }
      console.log(json);
    });

    next();
  };

  async.series([update_user, email_reset_link], function (err, results) {
    if (err) { return next(err); }
    return res.json({msg: 'Please follow link to reset password we sent you to complete the process.'}, 200);
  });
});

UserSchema.static('updateDoc', function (config, req, res, next) {
  var  update_user,
    self = this;

  delete req.body.email;
  req.body.updated_at = new Date();

  update_user = function () {
    self.findOne({username: req.user.username}, function (err, user) {
      if (err) { return next(err); }

      Object.keys(req.body).map(function (key) {
        user[key] = req.body[key];
      });
      user.save(function (err, user) {
        if (err) {
          return self.errorHandler(err, req, res, next);
        }
        req.session.user = user;
        return res.json({msg: 'profile update success'}, 200);
      });
    });
  };

  self.filterInputs(req.body);

  // remove password inputs
  if (!config.change_pwd) {
    delete req.body.password;
    delete req.body.password_salt;
    update_user();
  } else {
    if (!req.body.password || (req.body.password.length < 6)) {
      return res.json({msg: 'password too short'}, 400);
    }

    hash(req.body.old_password, req.user.password_salt, function (err, hash) {
      if (err) { return next(err); }

      if (hash !== req.user.password) {
        return res.json({msg: 'old password does not match'}, 400);
      }

      hash(req.body.password, function (err, salt, hash) {
        if (err) { return next(err); }

        req.body.password_salt = salt;
        req.body.password = hash;
        update_user();
      });
    });
  }
});

UserSchema.static('oauthSignUp', function (req, res, next) {
  var auto_username, create_valid_user, new_user, create_session_and_send_respond,
    self    = this,
    counter = 0;

  create_valid_user = function (next) {
    if (!counter) {
      auto_username = req.body.full_name.replace(' ', '-');
    } else {
      auto_username = req.body.full_name.replace(' ', '-') + '-' + counter;
      counter = 0;
    }

    counter++;

    req.body.username = auto_username;
    req.body.status = 2;

    self.create(req.body, function (err, user) {
      if (err) {
        if (err.code === 11000) {
          if (err.err.indexOf(req.body.token) !== -1 || err.err.indexOf(req.body.username) !== -1) {
            return create_valid_user(next);
          }
        }
        return self.errorHandler(err, req, res, next);
      }

      new_user = user;
      next();
    });
  };

  create_session_and_send_respond = function (user) {
    req.session.user = user;
    req.session.message.info.push('Sign up success.');

    return res.redirect('/');
  };

  self.findOne({email: req.body.email}, function (err, user) {
    if (err) { return next(err); }

    req.session.cookie.maxAge = 10 * 365 * 24 * 60 * 60;

    if (!user) {
      async.series([create_valid_user], function (err, results) {
        if (err) { return next(err); }
        create_session_and_send_respond(new_user);
      });
    } else {
      create_session_and_send_respond(user);
    }

  });
});

UserSchema.static('emailSignUp', function (req, res, next) {
  var auto_username,    random_token,   create_valid_user,  counter, input_map,
    make_hash_password, hash_password,  salt_password,      email_activation,
    self  = this;

  // ** Begin password validation
  if (!req.body.password || (req.body.password && (req.body.password.length < 6))) {
    return res.json({msg: ['Password must be at least 6 characters']}, 400);
  }

  if (!req.body.full_name) {
    return res.json({msg : ['invalid fullname']}, 400);
  }

  make_hash_password = function (next) {
    hash(req.body.password, function (err, salt, hash) {
      if (err) { return next(err); }

      hash_password = hash;
      salt_password = salt;
      next();
    });
  };

  create_valid_user = function (next) {
    random_token = randomString(100, '#aA!');

    if (counter) {
      auto_username = req.body.full_name.replace(' ', '-') + '-' + counter;
    } else {
      auto_username = req.body.full_name.replace(' ', '-');
      counter = 0;
    }
    counter++;

    self.filterInputs(req.body);

    req.body.username       = auto_username;
    req.body.status         = 1;
    req.body.password       = hash_password;
    req.body.password_salt  = salt_password;
    req.body.token          = { activation : random_token };
    req.body.sign_up_type   = 'email';

    self.create(req.body, function (err, user) {
      if (err) {
        if (err.code === 11000) {
          if (err.err.indexOf(req.body.token) !== -1 || err.err.indexOf(req.body.username) !== -1) {
            return create_valid_user(next);
          }
        }
        return self.errorHandler(err, req, res, next);
      }

      next();
    });
  };

  email_activation = function () {
    var url = req.protocol + "://" + req.get('host');

    sendgrid.send({
      to      : req.body.email,
      from    : activationMsgMap.from_email,
      subject : activationMsgMap.subject,
      text    : activationMsgMap.text.replace("{{url}}", url).replace("{{activate_link}}", url + "/activate/" + req.body.token.activation).replace("{{username}}", req.body.username),
      html    : activationMsgMap.html.replace("{{url}}", url).replace("{{activate_link}}", url + "/activate/" + req.body.token.activation).replace("{{username}}", req.body.username)
    }, function (err, json) {
      if (err) {
        // ** TODO 30-12-2013 trankhanh - implement send email error
      }
      console.log(json);
    });
  };

  async.series([
    make_hash_password, create_valid_user
  ], function (err, results) {
    var register_success_msg  = "Account registered successful. Please check your email to activate account";

    if (err) { return next(err); }

    email_activation();

    return res.json({msg: register_success_msg}, 200);
  });
});

UserSchema.static('getNotifications', function (username, req, res, next) {
  var self = this,
    i = 0;
  self.findOne({username: username}, function (err, user) {
    if (err) {
      return next(err);
    }
    if (user.notifications) {
      for (i = 0; i < user.notifications.length; i++) {
        user.notifications[i].status = 'read';
      }
      user.markModified('notifications');
      user.save(function (err, user) {
        if (err) {
          return next(err);
        }
      });
    }
    return res.json(user.notifications, 200);
  });
});

UserSchema.static('getUnreadNotifications', function (username, req, res, next) {
  var self    = this,
    container = [],
    i;
  self.findOne({username: username}, function (err, user) {
    if (err) {
      return next(err);
    }
    if (user.notifications) {
      for (i = 0; i < user.notifications.length; i++) {
        if (user.notifications[i].status === 'unread') {
          container.push(user.notifications[i]);
        }
      }
    }
    return res.json(container, 200);
  });
});

module.exports = UserSchema;
