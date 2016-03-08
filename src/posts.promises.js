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

  let n=1;
  let all_posts = [];

  return Promise.map(folders,folder => {

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
      return posts;
    })

  });
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

module.exports.processAllPosts = processAllPosts;
