'use strict';


module.exports = function () {

  let nunjucks = require('nunjucks'),
      nunjucks_markdown = require('nunjucks-markdown'),
      marked = require('marked'),
      eg_article = require('../../templates/patterns/_test_data/article.json'),
      eg_gallery = require('../../templates/patterns/_test_data/gallery.json'),
      settings = require('../settings.json'),
      _ = require('lodash');

  let __basename = __dirname.slice(0,-8);

  let env = nunjucks.configure(__basename+'templates/patterns/',{
      autoescape: false,
      cache: false
  })
  .addFilter('date', require('nunjucks-date'))
  .addFilter('limitTo', require('../filters/limitTo.filter.js'))
  .addFilter('stripPatterns', require('../filters/stripPatterns.filter.js'))
  .addFilter('singular', require('../filters/singular.filter.js'))
  .addFilter('fixOrphans', require('../filters/fixOrphans.filter.js'))
  .addGlobal('eg_article',eg_article)
  .addGlobal('eg_gallery',eg_gallery)
  .addGlobal('site',settings)


  nunjucks_markdown.register(env, marked);

  this.tags = ['pattern'];

  this.parse = function parse (parser, nodes) {

      var tok = parser.nextToken();
      var args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);
      return new nodes.CallExtension(this, 'run', args);
  };

  this.run = function run (context, args) {
      return nunjucks.render(args.name);
  };

};
