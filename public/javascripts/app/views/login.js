define(['backbone', 'spinner'], function (Backbone, spinner) {
  var LoginView = Backbone.View.extend({
    el: 'body',

    events    : {
      'submit .signup-form form'      : 'createUser',
      'submit .login form'            : 'login',
      'submit .forgot-password-form'  : 'forgotPassword',
      'click .google-signup-btn'      : 'googleOauth',
      'click .facebook-signup-btn'    : 'facebookOauth'
    },

    initialize: function () {
      this.$firstNameSignUp = $('#first_name_signup');
      this.$lastNameSignUp = $('#last_name_signup');
      this.$emailSignup = $('#email_signup');
      this.$passwordSignup = $('#password_signup');
      this.$emailLogin = $('#email_login');
      this.$passwordLogin = $('#password_login');
      this.$emailForgotPwd = $('#email_forgot_password');
      this.$message = $('.msg-wrapper');
      this.crsfToken = $('meta[name="csrf-token"]').attr('content');
    },

    clearForm : function () {
      this.$firstNameSignUp.val('');
      this.$lastNameSignUp.val('');
      this.$emailSignup.val('');
      this.$passwordSignup.val('');
      this.$emailLogin.val('');
      this.$passwordLogin.val('');
      this.$emailForgotPwd.val('');
    },

    successCallback :  function (data, textStatus, jqXHR) {
      var self = this;

      this.$message.fadeOut(50, function () {
        self.$message.empty().css({display : 'block'});
        self.$message.html('<div class="message">' + data.msg + '</div>');
      });

      this.clearForm();
      window.location.hash = '#';
      spinner.stop();
    },

    errorCallback : function (jqXHR, textStatus, errorThrow) {
      var self = this;

      this.$message.fadeOut(50, function () {
        self.$message.empty().css({display : 'block'});
        self.$message.html('<div class="message">' + jqXHR.responseJSON.msg + '</div>');
      });
      spinner.stop();
    },

    createUser: function (e) {
      var self = this;
      e.preventDefault();
      spinner.start();
      $.ajax({
        type  : 'POST',
        url   : '/users',
        data  : {
          first_name : this.$firstNameSignUp.val(),
          last_name : this.$lastNameSignUp.val(),
          email : this.$emailSignup.val(),
          password : this.$passwordSignup.val(),
          _csrf : this.crsfToken
        },
        success : function (data, textStatus, jqXHR) {
          self.successCallback(data, textStatus, jqXHR);
        },
        error   : function (jqXHR, textStatus, errorThrow) {
          var i, length,
            html = '';

          length = jqXHR.responseJSON.msg.length;

          self.$message.fadeOut(50, function () {
            self.$message.empty().css({display : 'block'});
            self.$message.html('<div class="message">' + jqXHR.responseJSON.msg + '</div>');
          });
          spinner.stop();
        }
      });
    },

    googleOauth: function () {
      spinner.start();

      $.ajax({
        type: 'GET',
        url: '/users/google-oauth',
        error : function (jqXHR, textStatus, errorThrow) {
          spinner.stop();
        },
        success : function (data, textStatus, jqXHR) {
          window.location.href = data;
        }
      });
    },

    facebookOauth : function () {
      spinner.start();
      window.location.href = '/users/facebook-oauth';
    },

    login: function (e) {
      var self = this;

      e.preventDefault();
      spinner.start();

      $.ajax({
        type: 'POST',
        url   : '/sessions',
        data  : {
          _csrf     : this.crsfToken,
          email     : this.$emailLogin.val(),
          password  : this.$passwordLogin.val()
        },
        error : function (jqXHR, textStatus, errorThrow) {
          self.errorCallback(jqXHR, textStatus, errorThrow);
        },
        success : function (data, textStatus, jqXHR) {
          window.location.href = '/';
        }
      });
    },

    forgotPassword : function (e) {
      var self = this;
      e.preventDefault();

      spinner.start();

      $.ajax({
        type  : 'POST',
        url   : '/reset-password',
        data  : {
          _csrf : this.crsfToken,
          email : this.$emailForgotPwd.val()
        },
        error : function (jqXHR, textStatus, errorThrow) {
          self.errorCallback(jqXHR, textStatus, errorThrow);
        },
        success : function (data, textStatus, jqXHR) {
          self.successCallback(data, textStatus, jqXHR);
        }
      });
    }
  });

  return LoginView;
});
