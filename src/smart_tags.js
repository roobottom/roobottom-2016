var _ = require('lodash');

var tags = [
    /<p>\s*\(gallery([^\)]+)?\)\s*<\/p>/g
];

function smart_tags(string,cb) {
    for(var i in tags) {

        var match;
        while(match = tags[i].exec(string)) {

            console.log(get_options(match[1]));

        }
    }
};

function get_options(match) {
    var terms = [];
    var items = _.trim(match).split(',');
    for(var i in items) {
        terms.push(items[i].split(':'));
        //terms = _.fromPairs(term);
    }
    return _.fromPairs(terms);

    terms += '{"'+items[0]+'":"'+items[1]+'"}';
}

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[i] = arr[i];
  return rv;
}

smart_tags(
    '<p>Hell this is a test</p><p>(gallery set:whatevs,class:poo)</p><p>(gallery set:two,class:wee)</p>',
    null
    );