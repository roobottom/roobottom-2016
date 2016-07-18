'use strict';


module.exports = function () {

  let nunjucks = require('nunjucks'),
      nunjucks_markdown = require('nunjucks-markdown'),
      marked = require('marked'),
      eg_article = require('../../templates/patterns/_test_data/article.json'),
      eg_gallery = require('../../templates/patterns/_test_data/gallery.json'),
      eg_note = require('../../templates/patterns/_test_data/note.json'),
      nconf = require('nconf'),
      _ = require('lodash');

  //settings
  nconf.env();
  let settings;
  if(nconf.get('settings')) {
    settings = require('.'+nconf.get('settings'));
    console.log('using settings file:',nconf.get('settings'));
  }
  else {
    settings = require('../settings.json');
    console.log('using default settings');
  }

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
  .addFilter('fuzzyDate', require('../filters/fuzzyDate.filter.js'))
  .addGlobal('eg_article',eg_article)
  .addGlobal('eg_gallery',eg_gallery)
  .addGlobal('eg_note',eg_note)
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
