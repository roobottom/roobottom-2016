var fs  = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    frontmatter = require('front-matter'),
    marked = require('marked'),
    smart_tags = require('./smart_tags.js');

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true
});


function get_all_posts(folder,cb) {
    fs.readdir(folder,function(err,files) {
        if(err) throw err;
        
        var files = _.remove(files,function(n) {
            return n.match(/^\d*\.md$/);
        });

        var posts = [];
        var file = files.shift();

        get_file_contents(folder+file, function caller(data) {
            if(files.length > 0) {
                process_post(data,file,function(post) {
                    posts.push(post);
                    file = files.shift();
                    get_file_contents(folder+file,caller); 
                }); 
            } else {
                cb(posts);
            };
        });


    });
};

function get_post(file) {
    get_file_contents(file,function(data) {
        process_post(data,file,function(post) {
            return post;
        });
    });
}

function get_file_contents(file,cb) {
    fs.readFile(file, 'utf8', function(err,data) {
        if(err) throw err;
        cb(data);
    });
};

function process_post(data,file,cb) {
    var post = frontmatter(data);
    post.attributes.id = path.basename(file,'.md');
    post.html_body = marked(post.body);
    post.html_body = smart_tags.find_tags(post);
    cb(post);
}


module.exports.get_all_posts = get_all_posts;
module.exports.get_post = get_post;