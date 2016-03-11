'use strict';

var fs  = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    frontmatter = require('front-matter'),
    marked = require('marked'),
    smart_tags = require('./smart_tags.js');

  let folders = ['diary','gallery','notes'];
  let postsRoot = './posts/';

function processAllPosts() {

  let all_posts = [];
  let n = 1;

  return new Promise((resolve,reject) => {

    console.log(n,'outside promise');

    Promise.map(folders,folder => {

      return getFilesInFolder(folder)

      .then(files => {
        return Promise.map(files,(file) => {
          return getFileContents(folder,file)
        })
      })

      .then(dataObject => {
        return Promise.map(dataObject,(data) => {
          return processPostData(data,folder);
        })
      })

      .then(posts => {
        //synchronous processing of the posts object:
        sortPosts(posts);
        calculatePostRelationships(posts);
        all_posts = all_posts.concat(posts);
        //we can do ALL the processing on the posts object here::

        //IDEA: https://github.com/substack/node-mkdirp
        posts.map(post => {
          let fullPath = './posts/.cache/' + folder + '/' + post.attributes.id + '.json';
          fs.writeFile(fullPath,JSON.stringify(post),'utf-8',function(err) {
            if(!err) { return; }
            if(err) { console.log(err); }
          });
        });
      })

      .then(function() {
        fs.writeFile('./posts/.cache/posts.json',JSON.stringify(all_posts),'utf-8',function(err) {
          if(!err) { return; }
          if(err) { console.log(err); }
        });
        console.log(n++,'inside promise');
      })
      .catch(err => console.log('error: ', err))

    }).then(function() {
      console.log(n++,'promise then');
      resolve(all_posts);
    });

  });
}

function calculatePostRelationships(posts) {
  for (let key in posts) {
    let next = parseInt(key)+1;
    let prev = parseInt(key)-1;
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
}

function getFilesInFolder(folder) {
  return new Promise((resolve, reject) => {
    fs.readdir(postsRoot+folder,function(err,files) {
      if(!err) {
        files = _.remove(files, n => n.match(/^\d*\.md$/))
        resolve(files)
      } else {
        reject(err)
      }
    })
  })
}

function getFileContents(folder,file) {
  return new Promise((resolve,reject) => {
    fs.readFile(postsRoot+folder+'/'+file, 'utf8', function(err,data) {
        if(!err) {
          resolve({id:path.basename(file,'.md'),content:data})
        }
        else { reject(err) }
    })
  })
}

function processPostData(data,folder) {
  return new Promise((resolve,reject) => {
    let post = frontmatter(data.content);
    post.attributes.type = folder;
    post.attributes.id = data.id;
    post.html_body = marked(post.body);
    post.html_body = smart_tags.find_tags(post);
    resolve(post);
  });
};

function sortPosts(posts) {
  return posts.sort(function(a,b) {
      a = a.attributes.date;
      b = b.attributes.date;
      return (a < b ? 1:-1);
  });
}

//rewrite this as just a return function?
function writeFile(id,folder,post) {
  return new Promise((resolve,reject) => {
    post = JSON.stringify(post);
    let fullPath = './posts/.cache/' + folder + '/' + id + '.json';
    fs.writeFile(fullPath,post,'utf-8',function(err) {
      if(!err) { resolve(null); }
      else { reject(err); }
    });
  });
};

module.exports.processAllPosts = processAllPosts;
