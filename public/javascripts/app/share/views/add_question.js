define(['jquery', 'backbone'], function ($, Backbone) {
  var AddQuestion = Backbone.View.extend({
    el: 'body',

    events: {
      'click #add-question': 'addQuestion',
      'click #question-modal .next' : 'next',
      'click #question-modal .prev' : 'prev',
      'keyup #question-modal .q-topics' : 'searchTopic'
    },

    initialize: function () {
      this.$modal           = $('#question-modal');
      this.$questionTitle   = $('#question-modal .q-title');
      this.$questionTopics  = $('#question-modal .q-topics');
      this.$notice          = $('#question-modal .notice');
      this.$sugestTopics    = $('#question-modal .suggest-topics');

      this.$cancel  = $('#question-modal .cancel');
      this.$prev    = $('#question-modal .prev');
      this.$prev    = $('#question-modal .prev');
      this.$next    = $('#question-modal .next');
      this.$submit  = $('#question-modal .submit');
      this.timer    = null;

      $('#question-modal form').on('submit', function (e) {
        e.preventDefault();
      });
    },

    setupView: function () {
      this.$questionTitle.hide();
      this.$questionTopics.hide();
      this.$sugestTopics.hide();
      this.$notice.hide();

      this.$cancel.hide();
      this.$prev.hide();
      this.$next.hide();
      this.$submit.hide();
    },

    addQuestion: function () {
      this.setupView();

      this.$cancel.show();
      this.$next.show();
      this.$questionTitle.show();

      this.$modal.modal();
      this.$questionTitle.focus();
      $('#question-modal .modal-dialog').css({ marginTop: ($(window).height() - $('#question-modal .modal-dialog').height()) / 2 + 'px'});
    },

    next : function () {
      if (!this.$questionTitle.val() || this.$questionTitle.val().length < 10) {
        this.$notice.html('<strong>This question needs more details.</strong>');
        this.$notice.show();
        return;
      }

      this.setupView();
      this.$prev.show();
      this.$submit.show();
      this.$questionTopics.show();
    },

    prev : function () {
      this.setupView();
      this.$cancel.show();
      this.$next.show();
      this.$questionTitle.show();
      this.$questionTitle.focus();
    },

    searchTopic : function () {
      if (this.timer) { clearTimeout(this.timer); }

      this.timer = setTimeout(this.searchTopicCallback(this), 100);
    },

    clearSuggestTopics : function () {
      this.$sugestTopics.hide().find('ul').empty();
    },

    searchTopicCallback : function (that) {
      var self = that,
        term = self.$questionTopics.val();

      self.clearSuggestTopics();

      if (!term.trim()) { return; }

      $.ajax({
        type  : 'GET',
        url   : '/topics/search?name=' + term,
        error : function (jqXHR, textStatus, errorThrow) {

        },
        success : function (topics, textStatus, jqXHR) {
          var i,
            length = topics.length;

          if (length !== 0) {
            for (i = 0; i < length; i++) {
              self.$sugestTopics.find('ul').append('<li>'
                + '<div class="picture"><img width="25", height="25", src="' + topics[i].picture + '"></div>'
                + '<span>' + topics[i].name + '</span><br>'
                + '<span class="followers">' + topics[i].follower_count + ' followers</span>');
            }
            self.$sugestTopics.show();
          }
        }
      });
    }
  });

  return AddQuestion;
});
