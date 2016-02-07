var fs  = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    frontmatter = require('front-matter'),
    marked = require('marked'),
    smart_tags = require('./smart_tags.js');


function get_all_posts(folder,cb) {
    fs.readdir(folder,function(err,files) {
        if(err) throw err;
        
        var files = _.remove(files,function(n) {
            return n.match(/^\d*\.md$/);
        });

        var posts = [];
        var file = files.shift();

        get_file_contents(folder+file, function delta(data) {
            if(files.length > 0) {
                process_post(data,file,function(post) {
                    posts.push(post);
                    file = files.shift();
                    get_file_contents(folder+file,delta); 
                }); 
            } else {
                //cb(posts);
                console.log(posts);
            };
        });


    });
};

function get_post(file,cb) {
    get_file_contents(file,function(data) {
        process_post(data,file,function(post) {
            console.log(post);
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
    post.id = path.basename(file,'.md');
    post.html_body = marked(post.body);
    post.html_body = smart_tags.find_tags(post);
    cb(post);
}



get_all_posts('./posts/diary/');