var _ = require('lodash'),
    nunjucks = require('nunjucks');

var tags = [
    'gallery'
];

function find_tags(post) {
    for(var i in tags) {
        var regexp = new RegExp('<p>\\s*\\(' + tags[i] + '([^\\)]+)?\\)\\s*<\\/p>','igm');
        //var match;
        while(match = regexp.exec(post.html_body)) {
            //call the custom function for this tag.
            var compiled_tag = global['smart_tag_' + tags[i]](post,match[0],get_options(match[1]));
            //replace this occurance of the tag with the compiled_tag
            post.html_body = post.html_body.replace(match[0],compiled_tag);
        }

        return post.html_body;

    }
};

function get_options(match) {
    var terms = [];
    var items = _.trim(match).split(',');
    for(var i in items) {
        terms.push(items[i].split(':'));
    }
    return _.fromPairs(terms);
}



//smart tag definitions, what to do with a smart tag once it's been matched?
//Always defined as `smart_tag_[tag-name]`
smart_tag_gallery = function (post,string,opts) {

    var images_for_gallery = {"images":[]};

    //loop through the available images for this post
    //and see if any are to be used by this gallery
    for(var i in post.attributes.images) {
        if(post.attributes.images[i].set === opts.set) {
            images_for_gallery["images"].push(post.attributes.images[i]);
        }
    }
    gallery_rendered = nunjucks.render('patterns/modules/m_gallery/m_gallery.smartTag',images_for_gallery);
    return gallery_rendered;

}

module.exports.find_tags = find_tags;
