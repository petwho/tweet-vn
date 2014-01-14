define([ 'backbone' ], function (Backbone) {
  var Model = Backbone.Model.extend({
    contentGetHtml: function () {
      var $content,
        answer = this.get('posted').answer_id;
      if (answer !== undefined && answer !== null) {
        answer.content = answer.content
          .replace(/&amp;nbsp;/g, ' ')
          .replace(/&lt;p&gt;/g, '<p>').replace(/&lt;\/p&gt;/g, '<p>')
          .replace(/&lt;strong&gt;/g, '<strong>').replace(/&lt;\/strong&gt;/g, '<strong>')
          .replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '<em>')
          .replace(/&lt;h1&gt;/g, '<h1>').replace(/&lt;\/h1&gt;/g, '<h1>')
          .replace(/&lt;blockquote&gt;/g, '<blockquote>').replace(/&lt;\/blockquote&gt;/g, '<blockquote>');

        $content = $('<div>' + answer.content + '</div>');
        $content.find('img').each(function () {
          var attr,
            attributes = this.attributes,
            i = attributes.length,
            whitelist = ["src", "alt"];
          while (i--) {
            attr = attributes[i];
            if ($.inArray(attr.name, whitelist) === -1) {
              this.removeAttributeNode(attr);
            }
          }
        });

        $content.find('a').each(function () {
          var attr,
            attributes = this.attributes,
            i = attributes.length,
            whitelist = ["href", "target"];
          while (i--) {
            attr = attributes[i];
            if ($.inArray(attr.name, whitelist) === -1) {
              this.removeAttributeNode(attr);
            }
          }
        });

        answer.content = $content.html();
      }
    }
  });

  return Model;
});
