define([
  'backbone', 'spinner', 'views/topics/app',
  'text!templates/topics/link_button.html'
], function (Backbone, spinner, appView, linkText) {
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
      appView.$('.topic-list .col-xs-4').empty();
      appView.$('.related-topics .col-xs-6').empty();
      this.$headSteps.children().removeClass('current');
      this.$instSteps.hide();
      $('.spinner-large').remove();
      appView.$el.removeClass('hidden');
    },

    updateView: function (self) {
      // update clickable class
      self.$headSteps.removeClass('clickable');
      self.$instruction.find('.steps a').removeClass('clickable');
      self.$headline.find('.step-1').addClass('clickable');
      self.$instruction.find('.step-1 a').addClass('clickable');

      if (self.validateFollowingPrimaryTopic()) {
        self.$headline.find('.step-2').addClass('clickable');
        self.$headline.find('.step-3').addClass('clickable');

        self.$instruction.find('.step-2 a').addClass('clickable');
        self.$instruction.find('.step-3 a').addClass('clickable');
      }

      // update remain num
      self.$instruction.find('.step-1 a').text(self.template({
        primary_topic_remain: 5 - appView.topics.followingPrimaryCount().length
      }));

      self.$instruction.find('.step-3 a').text(self.template());
    },

    updateFollowing: function (self) {
      if (typeof self === 'undefined') {
        self = this;
      }

      appView.topics.fetch().then(function () {
        self.updateView(self);
      });
    },

    validateFollowingPrimaryTopic: function () {
      return (appView.topics.followingPrimaryCount().length >= 5) ? true : false;
    },

    step1: function () {
      var filter_callback,
        that = this;

      filter_callback = function (self) {
        var that = self;

        that.setupView();
        that.$headline.find('.step-1').children().addClass('current');
        that.$instruction.find('.step-1').show();

        that.updateFollowing(that);
        appView.topics.trigger('addPrimaryTopic', appView.topics);
      }

      // check collections length
      if (appView.topics.length !== 0) {
        return filter_callback(this);
      }

      appView.topics.fetch({
        success: function () {
          filter_callback(that);
        }
      });
    },

    step2: function () {
      var filter_callback,
        that = this;

      // ** validate user following topics
      filter_callback = function (self) {
        if (!self.validateFollowingPrimaryTopic()) {
          return self.navigate('#step-1', { trigger: true });
        }

        that.setupView();
        that.$headline.find('.step-2').children().addClass('current');
        that.$instruction.find('.step-2').show();
        appView.topics.trigger('addRelatedTopics', appView.topics);
        that.updateFollowing(that);
      };


      // check topics collection length
      if (appView.topics.length !== 0) {
        return filter_callback(that);
      }

      appView.topics.fetch({
        success: function () {
          filter_callback(that);
        }
      });
    },

    step3: function () {
      var filter_callback,
        that = this;

      filter_callback = function (self) {
        if (!self.validateFollowingPrimaryTopic()) {
          return self.navigate('#step-2', { trigger: true });
        }

        that.setupView();
        that.$headline.find('.step-3').children().addClass('current');
        that.$instruction.find('.step-3').show();
        that.updateFollowing(that);
      };

      // check topics collection length
      if (appView.topics.length !== 0) {
        return filter_callback(that);
      }

      appView.topics.fetch({
        success: function () {
          filter_callback(that);
        }
      });
    }

  });

  return new Router;
});
