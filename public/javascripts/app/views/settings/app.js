define(['backbone', 'jquery', 'spinner'], function (Backbone, $, spinner) {
  var View = Backbone.View.extend({
    el: '#settings',

    events: {
      'submit form.change-password-form': 'updatePwd',
      'click .upload-btn': 'showDialog',
      'change .upload-input': 'savePicture'
    },

    initialize: function () {
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      this.username = this.$el.data('username');
      this.$changePasswordLn = this.$('.change-password-link');
      this.$changePasswordForm = this.$('.change-password-form');
      this.$old_password = this.$('#old-password');
      this.$pwd = this.$('#password');
      this.$pwdConfirm = this.$('#password-confirmation');
      this.$message = this.$('.message');
      this.on('setup', this.setup, this);
      this.on('changePassword', this.changePassword, this);
    },

    setup: function () {
      this.$changePasswordLn.removeClass('hidden');
      this.$changePasswordForm.addClass('hidden');
    },

    changePassword: function () {
      this.$changePasswordLn.addClass('hidden');
      this.$changePasswordForm.removeClass('hidden');
      this.$message.hide();
    },

    updatePwd: function (e) {
      var that = this;
      e.preventDefault();
      if (this.$pwd.val() !== this.$pwdConfirm.val()) {
        return this.$message.html('Password confirmation did not match').show();
      }
      spinner.start();
      $.ajax({
        type: 'PUT',
        url: '/@' + this.username + '/update-password',
        data: {
          _csrf: this.csrfToken,
          password: this.$pwd.val(),
          old_password: this.$old_password.val()
        },
        error: function (jqXHR, textStatus, errorThrown) {
          spinner.stop();
          return that.$message.html(jqXHR.responseJSON.msg).show();
        },
        success: function () {
          spinner.stop();
          window.location.href="/login";
        }
      });
    },

    showDialog: function (e) {
      $('.upload-input').trigger('click');
    },

    savePicture: function (e) {
      $('#submit-picture-btn').trigger('click');
    }
  });

  return new View();
});
