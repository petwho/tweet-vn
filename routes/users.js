var oauth2Client, googleapis, Facebook,
  notLoggedIn = require('./middleware/not_logged_in'),
  loggedIn = require('./middleware/logged_in'),
  loadUser = require('./middleware/load_user'),
  User = require('../data/models/user'),
  Comment = require('../data/models/comment'),
  Activity = require('../data/models/activity'),
  async = require('async'),
  getHtml = require('./helpers/get_html'),
  request = require('request'),
  randomString = require('./middleware/random_string');

Facebook = require('facebook-node-sdk');

module.exports = function (app) {
  app.post('/users', notLoggedIn, function (req, res, next) {
    User.emailSignUp(req, res, next);
  });

  app.get('/activate/:token', notLoggedIn, function (req, res, next) {
    User.update({'token.activation' : req.params.token}, { $unset : { 'token.activation' : '' }, $set : { status: 2 } }).exec(function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        req.session.message.error.push('Account was already activated');
        return res.redirect('/login');
      }
      req.session.message.info.push('Account activated successfully');
      res.redirect('/login');
    });
  });

  app.post('/reset-password', loadUser.byRequestEmail, function (req, res, next) {
    User.resetPassword(req, res, next);
  });

  app.get('/change-password/:token', function (req, res, next) {
    User.findOne({ 'token.reset_password' : req.params.token }, function (err, user) {
      if (err) { return next(err); }

      if (!user) { return res.json({ msg: 'Invalid link' }); }

      return res.render('users/change_password', { reset_pwd_token: req.params.token, title: 'Reset password' });
    });
  });

  app.post('/new-password', function (req, res, next) {
    if (req.session.user && (req.session.user.sign_up_type !== 'email')) {
      return User.newPassword(req, res, next);
    }

    User.findOne({ 'token.reset_password' : req.body.reset_pwd_token }, function (err, user) {
      if (err) { return next(err); }

      if (!user) { return res.json({ msg: 'Invalid reset password token' }, 403); }

      User.newPassword(req, res, next);
    });
  });

  app.get('/users/google-oauth', function (req, res, next) {
    var client_id, client_secret, redirect_url, OAuth2Client;

    client_id     = process.env.GOOGLE_CLIENT_ID;
    client_secret = process.env.GOOGLE_CLIENT_SECRET;
    redirect_url  = process.env.GOOGLE_REDIRECT_URL;

    googleapis    = require('googleapis');
    OAuth2Client  = googleapis.OAuth2Client;
    oauth2Client  = new OAuth2Client(client_id, client_secret, redirect_url);

    googleapis.discover('oauth2', 'v2').execute(function (err, client) {
      var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
      });
      res.send(200, url);
    });
  });

  app.get('/google-oauth-redirect', function (req, res, next) {
    var client, get_token, get_user_info, access_token;

    if (!req.query.code) { return res.redirect('/'); }

    get_token = function (next) {
      googleapis.discover('oauth2', 'v2').execute(function (err, found_client) {
        if (err) { return next(err); }

        client = found_client;

        oauth2Client.getToken(req.query.code, function (err, tokens) {
          if (err) { return next(err); }

          oauth2Client.credentials = tokens;
          access_token = tokens.access_token;
          next();
        });
      });
    };

    get_user_info = function (next) {
      client.oauth2.userinfo.get()
        .withAuthClient(oauth2Client)
        .execute(function (err, profile) {
          if (err) { return next(err); }

          if (!profile.verified_email) {
            req.session.message.error.push('Your Gmail account is inactive.');
            return res.redirect('/');
          }

          req.body.email = profile.email;
          req.body.first_name = profile.given_name;
          req.body.last_name = profile.family_name;
          req.body.token = { oauth : access_token };
          req.body.sign_up_type = 'google';
          req.body.picture = profile.picture;

          next();
        });
    };

    async.series([get_token, get_user_info], function (err, resutl) {
      if (err) { return next(err); }
      return User.oauthSignUp(req, res, next);
    });
  });

  app.get('/users/facebook-oauth', [notLoggedIn, Facebook.loginRequired({scope: 'email'})], function (req, res, next) {
    var get_user_info, get_user_photo, user;

    get_user_info = function (next) {
      req.facebook.api('/me', function (err, user_obj) {
        if (err) { return next(err); }

        user = user_obj;
        req.body.email = user.email;
        req.body.sign_up_type = 'facebook';
        req.body.first_name = user.first_name;
        req.body.last_name = user.last_name;
        next();
      });
    };

    get_user_photo = function (next) {
      request('http://graph.facebook.com/' + user.username + '/picture?redirect=false&type=large', function (err, respond, body) {
        if (!err && respond.statusCode === 200) {
          req.body.picture = JSON.parse(body).data ? JSON.parse(body).data.url : undefined;
        }

        req.body.token = { oauth : req.facebook.accessToken };
        next();
      });
    };
    async.series([get_user_info, get_user_photo], function (err, result) {
      if (err) { return next(err); }
      return User.oauthSignUp(req, res, next);
    });
  });

  app.get('/users/:username', loggedIn, function (req, res, next) {
    var find_user, find_activity;
    find_user = function (next) {
      User.findOne({username: req.params.username}, function (err, user) {
        if (err) { return next(err); }
        if (!user) { return res.render('not_found'); }
        req.user = user; // this may not be current logged in user
        next();
      });
    };

    find_activity = function (next) {
      Activity.find({user_id: req.user._id})
        .sort({created_at: -1})
        .populate('posted.question_id posted.answer_id posted.comment_id followed.user_id followed.question_id followed.topic_id')
        .exec(function (err, activities) {
          var i;
          req.answerCount = req.questionCount = 0;

          if (err) { return next(err); }

          for (i = 0; i < activities.length; i++) {
            if (activities[i].type === 21) {
              req.questionCount++;
              activities[i].posted.answer_id.content = getHtml(activities[i].posted.answer_id.content);
            }
            if (activities[i].type === 20) {
              req.answerCount++;
              activities[i].posted.question_id.title = getHtml(activities[i].posted.question_id.title);
              activities[i].posted.question_id.details = getHtml(activities[i].posted.question_id.details);
            }
          }
          req.activities = activities;
          next();
        });
    };

    async.series([find_user, find_activity], function (err, results) {
      if (err) { return next(err); }
      return res.render('users/profile', {user: req.user, activities: req.activities, questionCount: req.questionCount, answerCount: req.answerCount});
    });
  });
};
