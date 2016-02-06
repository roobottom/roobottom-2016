var smart_tags = [
    '/<p>\s*\(gallery([^\)]+)?\)\s*<\/p>/g/m'
];

module.exports = function smart_tags(string,cb,err) {
    for(i in smart_tags) {
        while(var match = smart_tags[i].exec(string)) {



        }
    }
};

function get_options(match) {
    var items = _.trim(match[1]).split(':');  
    terms += '{"'+items[0]+'":"'+items[1]+'"}';
    return JSON.parse(terms);
}