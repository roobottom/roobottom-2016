var fs  = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    frontmatter = require('front-matter'),
    marked = require('marked'),
    smart_tags = require('./smart_tags.js'),
    trimHtml = require('trim-html'),
    string = require('string');

var __basename = _.trimEnd(__dirname,'src');
var all_posts = require(__basename + '/posts/posts.json');

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

function get_all_posts (cb) {
  cb(all_posts);
}

//make this function the global "write new posts to a file"
//and write a new function for getting of the data back from the file.
function process_all_posts (folders,cb) {
    if(!posts) var posts = [];
    if(!limit) var limit = 0;

    //call folders
    var folder = folders.pop();
    get_files_in_folder(folder, function folder_caller(files) {

        //call files:
        var file = files.pop();
        get_file_contents(folder+file, function file_caller(data) {

            process_post(data,file,folder,function(post) {
                posts.push(post);

                //check if we want to call files again:
                if(files.length > 0) {
                    file = files.pop();
                    get_file_contents(folder+file,file_caller);
                } else {
                    //check if we want to call folders again:
                    if(folders.length > 0) {
                        folder = folders.pop();
                        get_files_in_folder(folder,folder_caller);
                    } else {
                        posts.sort(function(a,b) {
                            a = a.attributes.date;
                            b = b.attributes.date;
                            return (a < b ? 1:-1);
                        });
                        write_file('./posts/posts.json',JSON.stringify(posts),function() {
                          cb(posts);
                        });
                    };
                };
            });
        });
    });
};

function get_post(file,cb) {
    get_file_contents(file,function(data) {
        var folder = path.dirname(file);
        process_post(data,file,folder,function(post) {
            cb(post);
        });
    });
};

//private functions

function get_files_in_folder(folder,cb) {
    fs.readdir(folder,function(err,files) {
        if(err) throw err;

        var files = _.remove(files,function(n) {
            return n.match(/^\d*\.md$/);
        });

        cb(files);
    });
};

function get_file_contents(file,cb) {
    fs.readFile(file, 'utf8', function(err,data) {
        if(err) throw err;
        cb(data);
    });
};

function process_post(data,file,folder,cb) {
    var post = frontmatter(data);
    var type = folder.split(path.sep);
    post.attributes.id = path.basename(file,'.md');
    post.attributes.type = type[2];
    post.html_body = marked(post.body);
    post.html_body = smart_tags.find_tags(post);
    cb(post);
};


function write_file(file,data,cb) {
  fs.writeFile(file,data,'utf-8',function(err) {
    if(!err) {
      cb();
    } else {
      console.log(err);
    }
  });
}


module.exports.get_all_posts = get_all_posts;
module.exports.get_post = get_post;
module.exports.process_all_posts = process_all_posts;
