define([
  'sockets/connect_to_room', 'jquery', 'backbone', 'spinner'
], function (socket, $, Backbone, spinner) {
  var View = Backbone.View.extend({
    initialize: function () {
      var that = this;
      this.userId = this.$el.data('user-id');
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      socket.on('voteTweet', function (options) {
        that.socketVoteTweet(that, options);
      });
    },

    el: '#tweets',

    events: {
      'click .vote-btns .upvote-with-number': 'upvoteTweet',
      'click .vote-btns .downvote': 'downvoteTweet'
    },

    upvoteTweet: function (e) {
      var $currentTarget = $(e.currentTarget),
        $opposite = $currentTarget.parent().find('.downvote'),
        tweetId = $currentTarget.data('tweet-id'),
        that = this;
      e.preventDefault();
      spinner.start();
      $.ajax({
        type: 'POST',
        url: '/tweets/' + tweetId + '/vote',
        data: {type: 'upvote', _csrf: that.csrfToken },
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          if ($currentTarget.hasClass('voted')) {
            socket.emit('voteTweet', {tweetId: tweetId, value: -1, userId: that.userId});
          } else {
            if ($opposite.hasClass('voted')) {
              socket.emit('voteTweet', {tweetId: tweetId, value: 2, userId: that.userId});
            } else {
              socket.emit('voteTweet', {tweetId: tweetId, value: 1, userId: that.userId});
            }
          }
        }
      });
    },

    downvoteTweet: function (e) {
      var $currentTarget = $(e.currentTarget),
        $opposite = $currentTarget.parent().find('.upvote-with-number'),
        tweetId = $currentTarget.data('tweet-id'),
        that = this;
      e.preventDefault();
      spinner.start();
      $.ajax({
        type: 'POST',
        url: '/tweets/' + tweetId + '/vote',
        data: {type: 'downvote', _csrf: that.csrfToken },
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          if ($currentTarget.hasClass('voted')) {
            socket.emit('voteTweet', {tweetId: tweetId, value: 1, userId: that.userId});
          } else {
            if ($opposite.hasClass('voted')) {
              socket.emit('voteTweet', {tweetId: tweetId, value: -2, userId: that.userId});
            } else {
              socket.emit('voteTweet', {tweetId: tweetId, value: -1, userId: that.userId});
            }
          }
        }
      });
    },

    socketVoteTweet: function (that, options) {
      var len, $voteText, $number;
      $voteText = that.$('.upvote-with-number[data-tweet-id="' + options.tweetId + '"]').parent();
      $number = $voteText.find('.number');
      $number.text(parseInt($number.text()) + options.value);

      if (that.userId === options.userId) {
        len = $voteText.find('.voted').length;
        $voteText.find('.voted').removeClass('voted');

        if (options.value === 1) {
          if (len === 0) {
            $voteText.find('.upvote-with-number').addClass('voted');
          } else {
            $voteText.find('.downvote').removeClass('voted');
          }
        }

        if (options.value === -1) {
          if (len === 0) {
            $voteText.find('.downvote').addClass('voted');
          } else {
            $voteText.find('.upvote-with-number').removeClass('voted');
          }
        }

        if (options.value === 2) {
          $voteText.find('.upvote-with-number').addClass('voted');
        }
        if (options.value === -2) {
          $voteText.find('.downvote').addClass('voted');
        }
      }
    }
  });

  return new View();
});
