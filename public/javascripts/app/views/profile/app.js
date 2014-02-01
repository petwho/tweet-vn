define([
  'sockets/connect_to_room', 'sockets/connect_view_profile',
  'jquery', 'backbone', 'spinner',
  'text!templates/profile/new_follower.html',
  'text!templates/profile/new_follower_activity.html'
], function (connectSI, profileSI, $, Backbone, spinner, newFollowerTpl, newFollowerActivityTpl) {
  var View = Backbone.View.extend({
    el: '#user-profile',

    events: {
      'click .follow-user': 'followUser',
      'click .unfollow-user': 'unfollowUser'
    },

    initialize: function () {
      var that = this;
      this.username = this.$el.data('username');
      this.sessionUserId = this.$el.data('session-userid');
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      profileSI.on('newFollow', function (activity) {
        that.socketNewFollow(that, activity);
      });
      profileSI.on('followed', function (activity) {
        that.socketFollowed(that, activity);
      });
      profileSI.on('unFollowed', function (activity) {
        that.socketUnfollowed(that, activity);
      });
      profileSI.on('unFollowedUser', function (activity) {
        that.socketUnfollowedUser(that, activity);
      });
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
        success: function (activity, textStatus, jqXHR) {
          spinner.stop();
          profileSI.emit('newFollow', activity);
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
        success: function (activity, textStatus, jqXHR) {
          spinner.stop();
          profileSI.emit('unFollowed', activity);
        }
      });
    },

    socketNewFollow: function (self, activity) {
      var that = self;
      that.$('.follower-count').text(parseInt(that.$('.follower-count').text()) + 1);
      that.$('.follower-user-link').append(_.template(newFollowerTpl)(activity.user_id));

      if (that.$('.follow-btn-switcher button').length !== 0) {
        that.$('.follow-btn-switcher').html('<button class="pull-right btn btn-sm unfollow-btn unfollow-user">Unfolllow</button>');
      }
    },

    socketUnfollowed: function (self, activity) {
      var that = self;
      that.$('.follower-count').text(parseInt(that.$('.follower-count').text()) - 1);
      that.$('.follower-user-link').find('a[data-username="' + activity.user_id.username + '"]').remove();

      if (that.$('.follow-btn-switcher button').length !== 0) {
        that.$('.follow-btn-switcher').html('<button class="pull-right btn btn-sm follow-btn follow-user">Folllow</button>');
      }
    },

    socketFollowed: function (self, activity) {
      var that = self;
      that.$('.following-count').text(parseInt(that.$('.following-count').text()) + 1);
      that.$('.following-user-link').append(_.template(newFollowerTpl)(activity.followed.user_id));

      that.$('.activities .pagelist-item:first').before(_.template(newFollowerActivityTpl)(activity));
      if (that.$('.follow-btn-switcher button').length !== 0) {
        that.$('.follow-btn-switcher').html('<button class="pull-right btn btn-sm unfollow-btn unfollow-user">Unfolllow</button>');
      }
    },

    socketUnfollowedUser: function (self, activity) {
      var that = self;
      that.$('.following-count').text(parseInt(that.$('.following-count').text()) - 1);
      that.$('.following-user-link').find('a[data-username="' + activity.followed.user_id.username + '"]').remove();
      that.$('.pagelist-item.following-user[data-username="' + activity.followed.user_id.username + '"]').remove();
      if (that.$('.follow-btn-switcher button').length !== 0) {
        that.$('.follow-btn-switcher').html('<button class="pull-right btn btn-sm follow-btn follow-user">Folllow</button>');
      }
    }

  });
  return View;
});
