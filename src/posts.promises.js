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

  let all_posts = {};
  let n = 1;

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
      sortPosts(posts);
      all_posts[folder] = posts;
      //we can do ALL the processing on the posts object here::
      posts.map(post => {
        //console.log(post.attributes.title,post.attributes.type);
      });
      // return Promise.map(posts,post => {
      //   return writeFile(post.attributes.id,folder,post);
      // })

      //IDEA: introduce a new sub-stream of promises here to process posts??

    })

    .then(function() {
      fs.writeFile('./posts/test.json',JSON.stringify(all_posts),'utf-8',function(err) {
        if(!err) { return all_posts; }
      });

    })

    .catch(err => console.log('error: ', err))

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
