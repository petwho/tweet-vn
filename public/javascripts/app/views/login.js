define(['backbone'], function (Backbone) {
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
      this.crsfToken          = $('meta[name="csrf-token"').attr('content');
    },

    clearForm : function () {
      this.$fullName.val('');
      this.$email.val('');
      this.$password.val('');
    },

    events    : {
      'submit .signup-form form'  : 'createUser',
      'submit .login form'        : 'login'
    },

    createUser: function (e) {
      var self = this;
      e.preventDefault();
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

          self.$message.fadeOut(50, function () {
            self.$message.empty().css({display : 'block'});
            self.$message.html('<div class="alert alert-info alert-dismissable">'
              + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
              + data.msg + '</div>');
          });
          window.location.hash = '#';
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
          self.$message.fadeOut(50, function () {
            self.$message.empty().css({display : 'block'});
            self.$message.html('<div class="alert alert-danger alert-dismissable">'
              + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
              + jqXHR.responseJSON.msg + '</div>');
          });
        },
        success : function (data, textStatus, jqXHR) {
          window.location.href = '/';
        }
      });
    }
  });

  return LoginView;
});
