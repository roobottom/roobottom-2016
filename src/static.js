'use strict';

let request = require('request'),
    posts = require('../posts/.cache/posts.json'),
    Promise = require('bluebird'),
    fs = require('fs-extra');

let folderRoot = './_site',
    siteRoot = 'http://localhost:3002',
    siteStructure = [
      '/',
      '/articles',
      '/gallery',
      '/notes',
      '/portfolio',
      '/archives',
      '/patterns',
      '/patterns/containers',
      '/patterns/grids',
      '/patterns/icons',
      '/patterns/modules',
      '/patterns/utilities'
    ];

//run this from the cmd line `node static.js`
createStaticPages()
.then(() => {createPosts()})
.then(() => {copyAssets()})
.then(() => {console.log('Site copied OK')})
.catch((err) => console.log(err));

function createStaticPages() {
  return new Promise((resolve,reject) => {
    //write out the basic site structure
    return Promise.map(siteStructure,(folder) => {
      return createFolder(folderRoot,folder)
    })
    .then((folders) => {
      return Promise.map(folders,(folder) => {
        return grabPage(folder)
        .then((data) => {
          return {folder:folder,data:data}
        })
      })
    })
    .then((objs) => {
      return Promise.map(objs,(obj) => {
        return writePage(folderRoot+obj.folder+'/index.html',obj.data);
      });
    })
    .then(() => resolve())
    .catch(err => reject(err));
  });
};

function createPosts() {
  return new Promise((resolve,reject) => {
    //write out the posts
    return Promise.map(posts,(post) => {
      return grabPage('/' + post.attributes.type + '/' + post.attributes.id)
      .then((data) => {
        return {folder:post.attributes.type,id:post.attributes.id,data:data};
      });
    })
    .then((objs) => {
      return Promise.map(objs,(obj) => {
        return writePage(folderRoot+'/'+obj.folder+'/'+obj.id+'/index.html',obj.data);
      });
    })
    .then(() => resolve())
    .catch(err => reject(err));
  });
};


function copyAssets() {
  return new Promise((resolve,reject) => {
      fs.copy('./assets',folderRoot,(err) => {
        if(!err) {resolve()}
        else {reject(err)}
      });
  });
};

function createFolder(root,folder) {
  return new Promise((resolve,reject) => {
    fs.ensureDir(root+folder,(err) => {
      if(!err) {resolve(folder);}
      else {reject(err);}
    })
  });
};

function grabPage(url) {
  return new Promise((resolve,reject) => {
    request(siteRoot+url, {timeout: 2500}, (err,response,body) => {
      if (!err && response.statusCode == 200) {resolve(body);}
      else {err.url=url;reject(err);}
    });
  });
};

function writePage(location,data) {
  return new Promise((resolve,reject) => {
    fs.outputFile(location,data,(err) => {
      if(!err) { resolve();}
      else {reject(err);}
    });
  });
};
