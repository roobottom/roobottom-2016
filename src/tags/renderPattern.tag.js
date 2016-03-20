'use strict';


module.exports = function () {

  let nunjucks = require('nunjucks'),
      nunjucks_markdown = require('nunjucks-markdown'),
      marked = require('marked');

  let env = nunjucks.configure({
      autoescape: false,
      cache: false
  })
  .addFilter('date', require('nunjucks-date'))
  .addFilter('limitTo', require('../filters/limitTo.filter.js'))

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
