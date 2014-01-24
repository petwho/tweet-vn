var $ = require('jquery');
module.exports = function (content) {
  var $content;

  if ((typeof content !== 'string') || !content.trim()) { return; }

  $content = $('<div>' + content + '</div>');
  $content.find(':not(p, span, h1, strong, em, ul, ol, li, a, img)').remove();
  $content.find('img').each(function () {
    var attr,
      attributes = this.attributes,
      i = attributes.length,
      whitelist = ["src", "alt"];
    while (i--) {
      attr = attributes[i];
      if (whitelist.indexOf(attr.name) === -1) {
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
      if (whitelist.indexOf(attr.name) === -1) {
        this.removeAttributeNode(attr);
      }
    }
  });

  $content.find('p, span, h1, strong, em, ul, ol, li').each(function () {
    var attr,
      attributes = this.attributes,
      i = attributes.length,
      whitelist = ["style"];
    while (i--) {
      attr = attributes[i];
      if (whitelist.indexOf(attr.name) === -1) {
        this.removeAttributeNode(attr);
      } else {
        if ($(this).css('textDecoration').indexOf('line-through') !== -1) {
          this.removeAttributeNode(attr);
          $(this).css('textDecoration', 'lineThrough');
        } else {
          this.removeAttributeNode(attr);
        }
      }
    }
  });

  content = $content.html();

  return content;
};
