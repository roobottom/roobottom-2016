'use strict';
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

var folders = ['diary','gallery','notes'];
var postsRoot = './posts/';

function get_all_posts (cb) {
  cb(all_posts);
}


function processAllPosts(cb) {
  let posts = [];
  let folder = folders.pop();

  getFilesInFolder(folder, function filesCaller(err,files) {
    if(!err) {



      /* call any remaining folders recursivly*/
      if(folders.length > 0) {
        folder = folders.pop();
        getFilesInFolder(folder,filesCaller);
      }
    }
    else {console.log(err);}
  });//getFilesInFolder
}
function getFilesInFolder(folder,cb) {
    fs.readdir(postsRoot+folder,(err,files) => {
        if(err) { cb(err) }
        else {
          files = _.remove(files, n => n.match(/^\d*\.md$/));
          cb(null,files);
        }
    });
};
function getFileCOntent(file,cb) {
    fs.readFile(file, 'utf8', function(err,data) {
        if(err) throw err;
        cb(data);
    });
};

//processAllPosts();

//update this to process files for each folder.
function process_all_posts (cb) {
    var posts = [];

    //call folders
    var folder = './posts/'+folders.pop()+'/';
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
                        folder = './posts/'+folders.pop()+'/';
                        get_files_in_folder(folder,folder_caller);
                    } else {
                        posts.sort(function(a,b) {
                            a = a.attributes.date;
                            b = b.attributes.date;
                            return (a < b ? 1:-1);
                        });

                        //now add-in 2-way relational data for this set:
                        posts = calculate_post_relations(posts);

                        write_file('./posts/posts.json',JSON.stringify(posts),function() {
                          create_file_per_post(posts, function() {
                            cb(all_posts);
                          });

                        });
                    };
                };
            });
        });
    });
};

function processAllPostsCallbacks(cb) {
  let posts = [];
  let folder = './posts/'+folders.pop()+'/';
  get_files_in_folder(folder, function folder_caller(files) {

  });
};

function get_post(id,type,cb) {
  cb();
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

function calculate_post_relations(posts) {
  for (let key in posts) {
    var next = parseInt(key)+1;
    var prev = parseInt(key)-1;
    if(next in posts) {
      posts[key].next = {};
      posts[key].next.title = posts[next].attributes.title;
      posts[key].next.type = posts[next].attributes.type;
      posts[key].next.id = posts[next].attributes.id;
      posts[key].next.date = posts[next].attributes.date;
    }
    if(prev in posts) {
      posts[key].prev = {};
      posts[key].prev.title = posts[prev].attributes.title;
      posts[key].prev.type = posts[prev].attributes.type;
      posts[key].prev.id = posts[prev].attributes.id;
      posts[key].prev.date = posts[prev].attributes.date;
    }
  }
  return posts;
};

function write_file(file,data,cb) {
  fs.writeFile(file,data,'utf-8',function(err) {
    if(!err) {
      cb();
    } else {
      console.log(err);
    }
  });
};

function create_file_per_post(posts,cb) {
  var post = posts.pop();
  var file = __basename + 'posts/.cache/' + post.attributes.type + '/' + post.attributes.id + '.json';

  write_file(file, JSON.stringify(post), function write_caller(err) {
    if(!err) {
      post = posts.pop();
      file = __basename + 'posts/.cache/' + post.attributes.type + '/' + post.attributes.id + '.json';
      if(posts.length > 0) {
        write_file(file, JSON.stringify(post), write_caller);
      } else {
        cb()
      }
    }
  });

}


module.exports.get_all_posts = get_all_posts;
module.exports.get_post = get_post;
module.exports.process_all_posts = process_all_posts;
