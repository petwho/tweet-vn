define(['backbone'], function (Backbone) {
  var LoginView = Backbone.View.extend({
    el: 'body',

    initialize: function () {
      this.$fullName  = $('.signup-form input[name="full_name"]');
      this.$email     = $('.signup-form input[name="email"]');
      this.$password  = $('.signup-form input[name="password"]');
      this.$message   = $('.message');
      this.token      = $('meta[name="csrf-token"').attr('content');
    },

    events    : {
      'submit .signup-form form' : 'createUser'
    },

    createUser: function (e) {
      var self = this;
      e.preventDefault();
      $.ajax({
        type  : 'POST',
        url   : '/users',
        data  : {
          full_name : this.$fullName.val(),
          email     : this.$email.val(),
          password  : this.$password.val(),
          _csrf     : this.token
        },
        success : function (data, textStatus, jqXHR) {
          self.$message.fadeOut(20, function () {
            self.$message.empty().css({display : 'block'})
            self.$message.append('<div class="alert alert-info alert-dismissable">'
              + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
              + data.msg + '</div>');
          });
          window.location.hash = '#';
        },
        error   : function (jqXHR, textStatus, errorThrow) {
          var i, length;
          
          length = jqXHR.responseJSON.msg.length;

          self.$message.fadeOut(20, function () {
            self.$message.empty().css({display : 'block'})
            for (i = 0; i < length; i++) {
              self.$message.append('<div class="alert alert-danger alert-dismissable">'
                + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
                + jqXHR.responseJSON.msg[i] + '</div>');
            }
          });
        }
      });
    }
  });

  return LoginView;
});
