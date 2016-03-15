module.exports = function() {
    this.tags = ['eval'];

    this.parse = function(parser, nodes, lexer) {
        var tok = parser.nextToken();
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);
        return new nodes.CallExtension(this, 'run', args);
    };

    this.run = function(context, args) {
        for (var arg in args) {
            if (arg !== '__keywords') {
                context.ctx[arg] = eval(args[arg]);
            }
        }
    };
}
