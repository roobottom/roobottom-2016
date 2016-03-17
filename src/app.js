'use strict';

var express = require('express'),
    nunjucks = require('nunjucks'),
    nunjucksDate = require('nunjucks-date'),
    _ = require('lodash'),
    app = express(),

    posts = require('./posts.promises.js'),
    patterns = require('./patterns.js'),
    tags = require('./tags.js'),
    settings = require('./settings.json'),
    nunjucks_renderPattern = require('./tags/renderPattern.tag.js');

var __basename = _.trimEnd(__dirname,'src');

app.listen(3002, function () {
  console.log('Roobottom.com running at localhost:3002');
});

nunjucksDate.setDefaultFormat('MMMM Do YYYY');
let env = nunjucks.configure( __basename + 'templates/', {
    autoescape: false,
    cache: false,
    express: app,
})
.addFilter('date', require('nunjucks-date'))
.addFilter('limitTo', require('./filters/limitTo.filter.js'))
.addFilter('filterByType', require('./filters/filterByType.filter.js'))
.addExtension('pattern', new nunjucks_renderPattern())
.addGlobal('site',settings);

//statics
app.use(express.static('assets'));

//homepage
app.get('/', function (req, res) {
    posts.getPosts(['diary','gallery','notes'])
    .then(function(posts){
      res.render('pages/home.html', {
        title: 'Homepage',
        posts: posts,
        site: settings
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});


app.get('/u',function(req,res) {
  posts.processAllPosts()
  .then(function(posts){
    res.render('pages/u.html', {
      title: 'Caches refreshed',
      posts: posts
    })
  })
  .catch(err => {
    console.log('error: ', err);
    res.sendStatus(404);
  });
});


//diary homepage
app.get('/diary', function(req,res) {
    posts.getPosts(['diary'])
    .then(function(posts){
      res.render('pages/diary.html', {
        title: 'Diary',
        posts: posts,
        site: settings
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});

//diary post
app.get('/diary/:id', function(req,res) {
  if(/^\d+$/.test(req.params.id)) {//only process main req
    posts.getPost('diary',req.params.id)
    .then(function(post){
      res.render('pages/diary_post.html', {
        title: post.attributes.title,
        post: post,
        site: settings
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
  } else {
    res.end();
  };
});

//gallery homepage
app.get('/gallery', function(req,res) {
    posts.getPosts(['gallery'])
    .then(function(posts){
      res.render('pages/gallery.html', {
        title: 'Gallery',
        posts: posts,
        site: settings
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});

//patterns
app.get('/patterns',function(req,res) {
  patterns.getPatternsList().then(patterns => {
    res.render('pages/patterns.html', {
      title: 'Patterns',
      site: settings,
      patterns: patterns
    })
  })

});

app.get('/patterns/modules',function(req,res) {
  res.render('pages/patterns_modules.html', {
    title: 'Patterns / modules',
    site: settings
  })
});

app.use(function(req, res){
    res.sendStatus(404);
});
