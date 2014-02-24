define([
  'sockets/connect_to_room', 'backbone', 'tinymce', 'spinner',
  'models/tweet',
  'text!templates/add_question/search_results.html',
  'text!templates/add_question/add_topic.html',
  'text!../../../vendor/tinymce/skins/lightgray/skin.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.inline.min.css'
], function (socket, Backbone, tinymce, spinner, Tweet, searchTemplate, addTemplate, skinCSS, contentCSS, contentInlineCSS) {
  var View = Backbone.View.extend({
    el: '#tweets',

    initialize: function () {
      var that = this;
      this.$searchInput = $('.search-area input');
      this.$searchResults = $('.tweet-search-results');
      this.$addedTopics = $('.tweet-added-topics');
      this.$form = $('form.edit-tweet');
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      this.initEditor();
    },

    events: {
      'keyup .search-area input': 'searchTopic',
      'click .tweet-search-results > ul > li' : 'addTopic',
      'submit form.edit-tweet': 'editTweet'
    },

    clearSearchResults : function () {
      this.$searchResults.addClass('hidden').find('ul').empty();
    },

    searchTopic : function () {
      if (this.timer) { clearTimeout(this.timer); }

      this.timer = setTimeout(this.searchTopicCallback(this), 150);
    },

    addTopic: function (e) {
      var topic = {}, $target = $(e.currentTarget);

      topic._id             = $target.data('topic-id');
      topic.name            = $target.find('.name').data('name');
      topic.follower_count  = $target.find('.followers').data('followers');

      this.$addedTopics.append(_.template(addTemplate)(topic));
    },

    searchTopicCallback : function (self) {
      return function () {
        var that = self,
          term = that.$searchInput.val();

        if (!term.trim()) {
          that.clearSearchResults();
          return;
        }

        spinner.start();

        $.ajax({
          type  : 'GET',
          url   : '/topics/search?name=' + term,
          error : function (jqXHR, textStatus, errorThrow) {
            spinner.stop();
          },
          success : function (topics, textStatus, jqXHR) {
            that.clearSearchResults();
            spinner.stop();
            if (topics.length !== 0) {
              that.$searchResults.find('ul').append(_.template(searchTemplate)({
                topics: topics
              }));
              that.$searchResults.removeClass('hidden');
            }
          }
        });
      };
    },

    initEditor: function () {
      var that = this;
      tinymce.init({
        setup: function (editor) {
          editor.addButton('h1', {
            title : 'Header 1', // tooltip text seen on mouseover
            icon: "header1",
            image : false,
            onclick : function () {
              editor.execCommand('FormatBlock', false, 'h1');
            }
          });

          editor.on('init', function () {
            that.onEditorInit(editor);
          });
        },
        selector: 'textarea.tweet-content',
        skin: false,
        plugins: "autolink, autoresize, lists, link, image, anchor, paste, youtube",
        toolbar1: "h1 bold italic underline strikethrough hr| bullist numlist | link image | youtube",
        extended_elements: "iframe[src|title|width|height|allowfullscreen|frameborder]",
        paste_as_text: true,
        menubar: false,
        statusbar: false,
        min_height: 300,
        autoresize_min_height: 300,
        autoresize_bottom_margin: 20
      });
    },

    onEditorInit: function (editor) {
      this.editor = editor;

      if ($('head style[name="tinymce"]').length === 0) {
        $('head').append('<style name="tinymce">' + skinCSS + '</style>');
      }

      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentCSS);
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentInlineCSS);

      $('.spinner-large').hide();
      this.$form.removeClass('hidden');
    },

    editTweet: function (e) {
      var tweet, title, content, topic_ids, that = this;
      title = this.$form.find('input#title').val();
      content = this.editor.getContent();
      topic_ids = this.$form.find('input:checkbox:checked[name="topics"]').map(function () { return $(this).val(); }).get();

      e.preventDefault();
      if (!title.trim()) {
        window.scrollTo(0, 0);
        return this.$('.notice').html('Title cannot be empty').removeClass('hidden');
      }

      if (!content.trim()) {
        window.scrollTo(0, 0);
        return this.$('.notice').html('Content cannot be empty').removeClass('hidden');
      }

      if (!topic_ids.length) {
        window.scrollTo(0, 0);
        return this.$('.notice').html('Topics cannot be empty').removeClass('hidden');
      }

      spinner.start();

      tweet = new Tweet({_id: this.$form.data('tweet-id')});

      tweet.save({
        _csrf     : this.csrfToken,
        title     : title,
        content   : content,
        topic_ids : topic_ids
      }, {
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          window.location.href = '/tweets/' + tweet.get('_id');
        },
        wait: true
      });
    }
  });

  return new View();
});
