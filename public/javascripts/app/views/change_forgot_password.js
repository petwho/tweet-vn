define(['backbone'], function (Backbone) {
  var ChangePwdView = Backbone.View.extend({
    el: 'body',

    initialize : function () {
      this.$message         = $('.message .router-msg');
      this.crsfToken        = $('meta[name="csrf-token"]').attr('content');
      this.reset_pwd_token  = $('input[name="reset-pwd-token"]');
      this.password         = $('#password');
      this.password_confirm = $('#password-confirm');
    },

    events: {
      'submit form' : 'changePwd'
    },

    checkConfirmPwd : function () {
      var self = this;

      if (this.password.val() !== this.password_confirm.val()) {
        this.$message.fadeOut(50, function () {
          self.$message.empty().css({display : 'block'});
          self.$message.html('<div class="alert alert-danger alert-dismissable">'
            + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
            + 'Password confirm does not match' + '</div>');
        });
        return false;
      }
      return true;
    },

    changePwd : function (e) {
      var self = this;
      e.preventDefault();

      if (!this.checkConfirmPwd()) {
        return;
      }

      $.ajax({
        method  : 'POST',
        url     : '/change-password',
        data    : {
          _csrf     : this.crsfToken,
          reset_pwd_token  : this.reset_pwd_token.val(),
          password  : this.password.val()
        },
        error   : function (jqXHR, textStatus, errorThrow) {
          self.$message.fadeOut(50, function () {
            self.$message.empty().css({display : 'block'});
            self.$message.html('<div class="alert alert-danger alert-dismissable">'
              + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
              + jqXHR.responseJSON.msg + '</div>');
          });
        },
        success : function (data, textStatus, jqXHR) {
          window.location.href = '/login';
        }
      });
    }

  });

  return ChangePwdView;
});
