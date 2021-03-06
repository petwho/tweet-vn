var UserSchema, activationMsgMap, resetPasswordMsgMap,
  Schema = require('mongoose').Schema,
  AWS = require('aws-sdk'),
  async = require('async'),
  fs = require('fs'),
  request = require('request'),
  hash = require('../helpers/secure_pass').hash,
  sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD),
  randomString = require('../helpers/random_string'),
  activationMsgMap = require('../helpers/mail_template').activation,
  resetPasswordMsgMap = require('../helpers/mail_template').resetPwd;
// ** End module scope variables

UserSchema = new Schema({
  // (1): registered, (2): [1] + activated, (3): [2] + followed topic, (4): [3] + followed users
  status    : { type: Number, required: true, default: 1},
  username  : { type: String, required: true, unique: true },
  first_name: { type: String, required: true},
  last_name : { type: String, required: true},
  email     : { type: String, required: true, unique: true},
  has_photo : { type: Boolean, default: false},

  following : {
    user_ids     : [{ type : Schema.Types.ObjectId, ref : 'User' }],
    topic_ids    : [{ type : Schema.Types.ObjectId, ref : 'Topic' }],
    question_ids : [{ type : Schema.Types.ObjectId, ref : 'Question' }]
  },

  notification_ids   : [{ type : Schema.Types.ObjectId, ref : 'Notification' }],

  password      : String,
  password_salt : String,

  token: { // activation token or reset password token
    activation      : {type: String, unique: true, sparse: true},
    reset_password  : {type: String, unique: true, sparse: true},
    oauth           : {type: String, sparse: true}
  },

  sign_up_type: { type : String,  enum: [ 'email', 'google', 'facebook' ] },

  credit      : { type : Number,  default : 0 },
  created_at  : { type : Date,    default : Date.now },
  updated_at  : { type : Date,    default : Date.now }
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
  delete req_body.credit;
  delete req_body.created_at;
  delete req_body.updated_at;
});

UserSchema.static('errorHandler', function (err, req, res, next) {
  var message, indexName, suffixes, suffix,
    error_msg = '';

  if ((err.name !== 'ValidationError') && (err.code !== 11000)) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    if (err.errors.email) {
      error_msg += 'Email is not valid<br>';
    }
  }

  if (err.code === 11000) {
    message = err.err;
    if (message.indexOf(req.body.email) !== -1) {
      error_msg += 'This email address is already in use<br>';
    }
  }

  return res.json({msg: error_msg}, 400);
});

UserSchema.static('newPassword', function (req, res, next) {
  var make_hash_password, update_user, password_salt, password_hash,
    self = this;

  if (!req.body.password || (req.body.password.length < 6)) {
    return res.json({msg: 'New password too short'}, 400);
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
        if (!user) { return req.session.destroy(); }
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

    req.session.message.info.push('Password reset successful');

    return res.json({msg: 'Password reset successful'}, 200);
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
    return res.json({msg: 'Please follow the link we sent to your email to reset password.'}, 200);
  });
});

UserSchema.static('updateDoc', function (config, req, res, next) {
  var  update_user,
    self = this;

  delete req.body.email;
  req.body.updated_at = new Date();

  update_user = function (next) {
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
        if (config.change_pwd) {
          delete req.session.user;
          req.session.message.success.push('Password updated successfully.')
        }
        return res.json({msg: 'Profile update success'}, 200);
      });
    });
  };

  self.filterInputs(req.body);

  // remove password inputs
  if (!config.change_pwd) {
    delete req.body.password;
    delete req.body.password_salt;
    update_user(next);
  } else {
    if (!req.body.password || (req.body.password.length < 6)) {
      return res.json({msg: 'Password too short'}, 400);
    }

    hash(req.body.old_password, req.user.password_salt, function (err, hashed_pwd) {
      if (err) { return next(err); }

      if (hashed_pwd !== req.user.password) {
        return res.json({msg: 'Old password does not match'}, 400);
      }

      hash(req.body.password, function (err, salt, hashed_pwd) {
        if (err) { return next(err); }

        req.body.password_salt = salt;
        req.body.password = hashed_pwd;
        update_user(next);
      });
    });
  }
});

UserSchema.static('oauthSignUp', function (req, res, next) {
  var auto_username, create_valid_user, new_user, create_session_and_send_respond,
    self    = this,
    counter = 0;

  create_valid_user = function (next) {
    if (counter === 0) {
      auto_username = req.body.first_name.toLowerCase() + req.body.last_name.toLowerCase();
    } else {
      auto_username = req.body.first_name.toLowerCase() + req.body.last_name.toLowerCase() + '-' + counter;
    }

    counter++;

    req.body.username = auto_username;
    req.body.status = 2;
    if (req.body.picture) {
      req.body.has_photo = true;
    }

    self.create(req.body, function (err, user) {
      var writer;
      if (err) {
        if (err.code === 11000) {
          if (err.err.indexOf(req.body.token) !== -1 || err.err.indexOf(req.body.username) !== -1) {
            return create_valid_user(next);
          }
        }
        return self.errorHandler(err, req, res, next);
      }

      new_user = user;

      request({uri: req.body.picture, encoding: 'binary'}, function (err, response, body) {
        var s3;

        AWS.config.update({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION
        });

        s3 = new AWS.S3();
        s3.client.putObject({
          ACL: 'public-read',
          Bucket: process.env.AWS_BUCKET_NAME,
          ContentType: 'image/jpeg',
          Key: 'pictures/users/' + user.username + '.jpg',
          Body: new Buffer(body, 'binary'),
        }, function (err, data) {
          if (err) { return next(err); }
          next();
        });
      });
    });
  };

  create_session_and_send_respond = function (user) {
    req.session.user = user;
    req.session.message.info.push('Enter your new password to begin.');

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

  if (!req.body.first_name) {
    return res.json({msg : ['invalid first name']}, 400);
  }

  if (!req.body.last_name) {
    return res.json({msg : ['invalid last name']}, 400);
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
      auto_username = req.body.first_name.toLowerCase() + req.body.last_name.toLowerCase() + '-' + counter;
    } else {
      auto_username = req.body.first_name.toLowerCase() + req.body.last_name.toLowerCase();
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
    });
  };

  async.series([
    make_hash_password, create_valid_user
  ], function (err, results) {
    var register_success_msg  = "Account registered successful.<br>Check your email to activate account.";

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

UserSchema.virtual('fullname').get(function () {
  return this.first_name + ' ' + this.last_name;
});

UserSchema.virtual('picture').get(function () {
  if (this.has_photo) {
    return 'https://s3-' + process.env.AWS_REGION + '.amazonaws.com/' + process.env.AWS_BUCKET_NAME + '/pictures/users/' + this.username + '.jpg';
  }
  return 'https://s3-' + process.env.AWS_REGION + '.amazonaws.com/' + process.env.AWS_BUCKET_NAME + '/pictures/users/' + 'default.jpg';
});

UserSchema.set('toJSON', { virtuals: true });

module.exports = UserSchema;
