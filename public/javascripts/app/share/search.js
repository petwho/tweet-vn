define([
  'jquery', 'backbone', 'spinner',
  'text!templates/search/list_question.html'
], function ($, Backbone, spinner, questionTpl) {
  var View = Backbone.View.extend({
    el: 'nav.navbar',

    events: {
      'keyup .search': 'search'
    },

    initialize: function () {
      var that = this;
      this.$searchInput = this.$('.search');
      this.$searchResults = this.$('.search-results');
      this.$ul = this.$('.search-results ul');
      $('html').click(function () {
        that.clearSearchResults();
      });
    },

    search: function (e) {
      if (this.timer) { clearTimeout(this.timer); }

      this.timer = setTimeout(this.searchCallback(this), 200);
    },

    clearSearchResults : function () {
      this.$searchResults.addClass('hidden').find('ul').empty();
    },

    searchCallback: function (self) {
      return function () {
        var that = self,
          term = that.$searchInput.val();
        if (!term.trim()) {
          that.clearSearchResults();
          return;
        }
        $.ajax({
          type: 'GET',
          url: '/search?term=' + term,
          error: function () {

          },
          success: function (questions) {
            var i;
            that.clearSearchResults();
            if (questions.length !== 0) {
              that.$searchResults.removeClass('hidden');
              that.$ul.append(_.template(questionTpl)({questions: questions}))
            }
          }
        });
      };
    }
  });

  return new View();
});
