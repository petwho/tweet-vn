define(['backbone', 'spinner'], function (Backbone, spinner) {
  var LoginView = Backbone.View.extend({
    el: 'body',

    initialize: function () {
      this.$fullNameSignup    = $('#full_name_signup');
      this.$emailSignup       = $('#email_signup');
      this.$passwordSignup    = $('#password_signup');
      this.$emailLogin        = $('#email_login');
      this.$passwordLogin     = $('#password_login');
      this.$emailForgotPwd    = $('#email_forgot_password');
      this.$message           = $('.message .router-msg');
      this.crsfToken          = $('meta[name="csrf-token"]').attr('content');
    },

    clearForm : function () {
      this.$fullNameSignup.val('');
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
        self.$message.html('<div class="alert alert-info alert-dismissable">'
          + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
          + data.msg + '</div>');
      });

      this.clearForm();
      window.location.hash = '#';
      spinner.stop();
    },

    errorCallback : function (jqXHR, textStatus, errorThrow) {
      var self = this;

      this.$message.fadeOut(50, function () {
        self.$message.empty().css({display : 'block'});
        self.$message.html('<div class="alert alert-danger alert-dismissable">'
          + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
          + jqXHR.responseJSON.msg + '</div>');
      });
      spinner.stop();
    },

    events    : {
      'submit .signup-form form'      : 'createUser',
      'submit .login form'            : 'login',
      'submit .forgot-password-form'  : 'forgotPassword'
    },

    createUser: function (e) {
      var self = this;
      e.preventDefault();
      spinner.start();
      $.ajax({
        type  : 'POST',
        url   : '/users',
        data  : {
          full_name : this.$fullNameSignup.val(),
          email     : this.$emailSignup.val(),
          password  : this.$passwordSignup.val(),
          _csrf     : this.crsfToken
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
            for (i = 0; i < length; i++) {
              html += '<div class="alert alert-danger alert-dismissable">'
                + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
                + jqXHR.responseJSON.msg[i] + '</div>';
              self.$message.html(html);
            }
          });
          spinner.stop();
        }
      });
    },

    login: function (e) {
      var self = this;

      e.preventDefault();

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
