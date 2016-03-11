'use strict';

var fs  = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    frontmatter = require('front-matter'),
    marked = require('marked'),
    mkdirp = require('mkdirp'),
    smart_tags = require('./smart_tags.js');

  let folders = ['diary','gallery','notes'];
  let postsRoot = './posts/';
  let cacheRoot = postsRoot + '.cache/';
  let caches = {};
  folders.map(folder => {
    let cache = '.' + cacheRoot + folder + '/' + 'posts.json';
    caches[folder] = require(cache);
  });

function getPosts(types) {
  return new Promise((resolve,reject) => {

  });
}

function getPost(type,id) {
  return new Promise((resolve,reject) => {
    
  });
}

function processAllPosts() {

  let all_posts = [];
  let n = 1;

  return new Promise((resolve,reject) => {

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

        //now write out some files on each pass
        return Promise.map(posts, post=> {
          return writeFile(cacheRoot + folder ,post.attributes.id + '.json',JSON.stringify(post));
        })
        .then(function() {
          return writeFile(cacheRoot + folder,'posts.json',JSON.stringify(posts));
        })
      })
      .catch(err => console.log('error: ', err))

    })
    .then(function() {
      return writeFile(cacheRoot,'posts.json',JSON.stringify(all_posts)).then(function() {return});
    })
    .then(function() {
      resolve(all_posts);
    })
    .catch(err => console.log('error: ', err));

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

function writeFile(folder,file,contents) {
  return new Promise((resolve,reject) => {
    mkdirp(folder, function (err) {
      if(!err) {
        fs.writeFile(folder+'/'+file,contents,'utf-8',function(err) {
          if(!err) { resolve(file); }
          else { reject(err); }
        });
      }
      else {
        console.log('mkdir error:',err);
      }
    });
  });
};

module.exports.processAllPosts = processAllPosts;
