'use strict';


module.exports = function () {

  let nunjucks = require('nunjucks');

  this.tags = ['pattern'];

  this.parse = function parse (parser, nodes) {

      var tok = parser.nextToken();
      var args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);
      return new nodes.CallExtension(this, 'run', args);
  };

  this.run = function run (context, args) {
      //console.log(args.name,args.data);
      return nunjucks.renderString('{{pattern.'+args.name+'}}',args.data);
  };
  
};
