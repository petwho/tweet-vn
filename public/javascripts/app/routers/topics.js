define([
  'backbone', 'spinner', 'views/apps/topics',
  'text!templates/topics/link_button.html',
  'text!/stylesheets/topic.css'
], function (Backbone, spinner, appView, linkText, topicCSS) {
  var Router = Backbone.Router.extend({
    routes: {
      'step-1' : 'step1',
      'step-2' : 'step2',
      'step-3' : 'step3',
      '*other' : 'step1'
    },

    template: _.template(linkText),

    initialize: function () {
      this.$headline      = $('.headline');
      this.$instruction   = $('.instruction');
      this.$headSteps     = $('.headline .steps');
      this.$instSteps     = $('.instruction .steps');

      this.listenTo(appView, 'go-to-step1', function () {
        this.navigate('step-1', { trigger: true });
      });

      this.listenTo(appView, 'go-to-step2', function () {
        this.navigate('step-2', { trigger: true });
      });

      this.listenTo(appView, 'go-to-step3', function () {
        this.navigate('step-3', { trigger: true });
      });

      this.listenTo(appView, 'updateFollowing', this.updateFollowing);
    },

    setupView: function () {
      appView.$('.topic-list .col-sm-4').empty();
      this.$headSteps.children().removeClass('current');
      this.$instSteps.hide();
      $('.spinner-large').remove();
      appView.$el.removeClass('hidden');
    },

    updateFollowing: function (self) {
      if (typeof self === 'undefined') {
        self = this;
      }

      // update clickable class
      self.$headSteps.removeClass('clickable');
      self.$instruction.find('.steps a').removeClass('clickable');

      if (self.validateFollowingPrimaryTopic()) {
        self.$headline.find('.step-1').addClass('clickable');
        self.$headline.find('.step-2').addClass('clickable');

        self.$instruction.find('.step-1 a').addClass('clickable');

        if (self.validateFollowingSubTopic()) {
          self.$headline.find('.step-1').addClass('clickable');
          self.$headline.find('.step-2').addClass('clickable');
          self.$headline.find('.step-3').addClass('clickable');

          self.$instruction.find('.step-1 a').addClass('clickable');
          self.$instruction.find('.step-2 a').addClass('clickable');
          self.$instruction.find('.step-3 a').addClass('clickable');
        }
      }

      // update remain num
      self.$instruction.find('.step-1 a').text(self.template({
        primary_topic_remain: 5 - appView.topics.followingPrimaryCount().length
      }));

      self.$instruction.find('.step-2 a').text(self.template({
        sub_topic_remain: 5 - appView.topics.followingSubTopicCount().length
      }));

      self.$instruction.find('.step-3 a').text(self.template());
    },

    validateFollowingPrimaryTopic: function () {
      return (appView.topics.followingPrimaryCount().length >= 5) ? true : false;
    },

    validateFollowingSubTopic: function () {
      return (appView.topics.followingSubTopicCount().length >= 5) ? true : false;
    },

    step1: function () {
      var filter,
        that = this;

      filter = function (self) {
        var that = self;

        that.setupView();
        that.$headline.find('.step-1').children().addClass('current');
        that.$instruction.find('.step-1').show();

        that.updateFollowing(that);
        appView.topics.trigger('addPrimaryTopic', appView.topics);
      }

      // check collections length
      if (appView.topics.length !== 0) {
        return filter(this);
      }

      appView.topics.fetch({
        success: function () {
          filter(that);
        }
      });
    },

    step2: function () {
      var filter,
        that = this;

      // ** validate user following topics
      filter = function (self) {
        if (!self.validateFollowingPrimaryTopic()) {
          return self.navigate('#step-1', { trigger: true });
        }

        that.setupView();
        that.$headline.find('.step-2').children().addClass('current');
        that.$instruction.find('.step-2').show();
        appView.topics.trigger('addSubTopic', appView.topics);
        that.updateFollowing(that);
      };


      // check topics collection length
      if (appView.topics.length !== 0) {
        return filter(that);
      }

      appView.topics.fetch({
        success: function () {
          filter(that);
        }
      });
    },

    step3: function () {
      var filter,
        that = this;

      filter = function (self) {
        if (!self.validateFollowingSubTopic() || !self.validateFollowingPrimaryTopic()) {
          return self.navigate('#step-2', { trigger: true });
        }

        that.setupView();
        that.$headline.find('.step-3').children().addClass('current');
        that.$instruction.find('.step-3').show();
        that.updateFollowing(that);
      };

      // check topics collection length
      if (appView.topics.length !== 0) {
        return filter(that);
      }

      appView.topics.fetch({
        success: function () {
          if (!$('head style[name="topic"]').length) {
            $('head').append("<style name='topic'>" + topicCSS + "</style>");
          }
          filter(that);
        }
      });
    }

  });

  return new Router;
});
