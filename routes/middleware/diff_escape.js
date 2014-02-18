var $ = require('jquery');

module.exports = function (content) {
  content = content.replace(/<p>/g, ' <p> ').replace(/<span>/g, ' <span> ').replace(/<h1>/g, ' <h1> ')
    .replace(/<strong>/g, ' <strong> ').replace(/<em>/g, ' <em> ').replace(/<ul>/g, ' <ul> ')
    .replace(/<ol>/g, ' <ol> ').replace(/<li>/g, ' <li> ').replace(/<a>/g, ' <a> ');

  content = content.replace(/<\/p>/g, ' </p> ').replace(/<\/span>/g, ' </span> ').replace(/<\/h1>/g, ' </h1> ')
    .replace(/<\/strong>/g, ' </strong> ').replace(/<\/em>/g, ' </em> ').replace(/<\/ul>/g, ' </ul> ')
    .replace(/<\/ol>/g, ' </ol> ').replace(/<\/li>/g, ' </li> ').replace(/<\/a>/g, ' </a> ');

  $content = $('<div>' + content + '</div>');
  $content.find('img').remove().find('iframe').remove();

  return $content.html();
};
