var $ = require('jquery');
module.exports = function (content) {
  var $content;

  if (!content) { return; }

  $content = $('<div>' + content + '</div>');
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

  content = $content.html();

  content = content
    .replace(/&amp;nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;h1&gt;/g, '<h1>').replace(/&lt;\/h1&gt;/g, '</h1>')
    .replace(/&lt;p&gt;/g, '<p>').replace(/&lt;\/p&gt;/g, '</p>')
    .replace(/&lt;strong&gt;/g, '<strong>').replace(/&lt;\/strong&gt;/g, '</strong>')
    .replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>')
    .replace(/&lt;blockquote&gt;/g, '<blockquote>').replace(/&lt;\/blockquote&gt;/g, '</blockquote>')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  return content;
};
