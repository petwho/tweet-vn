define(['jquery', 'backbone', 'spinner'], function ($, Backbone, spinner) {
  var View = Backbone.View.extend({
    el: '#user-profile',

    events: {
      'click .follow-user': 'followUser',
      'click .unfollow-user': 'unfollowUser'
    },

    initialize: function () {
      this.username = this.$el.data('username');
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
    },

    followUser: function () {
      spinner.start();
      $.ajax({
        method: 'POST',
        url: '/users/follow/' + this.username,
        data: { _csrf: this.csrfToken },
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
        }
      });
    },

    unfollowUser: function () {
      spinner.start();
      $.ajax({
        method: 'POST',
        url: '/users/unfollow/' + this.username,
        data: { _csrf: this.csrfToken },
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
        }
      });
    }
  });
  return View;
});
