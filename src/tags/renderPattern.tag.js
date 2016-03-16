'use strict';


module.exports = function () {

  let nunjucks = require('nunjucks');

  nunjucks.configure({
      autoescape: false,
      cache: false
  })

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
