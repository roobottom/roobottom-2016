'use strict';

module.exports = function () {

  let nunjucks = require('nunjucks'),
      marked = require('marked');

  this.tags = ['markdown'];

  this.parse = function parse (parser, nodes) {
      var tok, args, body;

      tok = parser.nextToken();
      args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);
      body = parser.parseUntilBlocks('endmarkdown');
      parser.advanceAfterBlockEnd();
      var tabStart = new nodes.NodeList(0, 0, [new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, (tok.colno - 1))])]);
      console.log(tabStart);
      return new nodes.CallExtension(this, 'run', args, [body]);
  };

  this.run = function run (context, args, body) {
      //console.log(body);
      return 'y';
  };
};
