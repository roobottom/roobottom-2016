'use strict';

var express = require('express'),
    nunjucks = require('nunjucks'),
    nunjucksDate = require('nunjucks-date'),
    _ = require('lodash'),
    app = express(),

    posts = require('./posts.js'),
    patterns = require('./patterns.js'),
    tags = require('./tags.js'),
    settings = require('./settings.json'),
    nunjucks_renderPattern = require('./tags/renderPattern.tag.js'),
    nunjucks_markdown = require('nunjucks-markdown'),
    marked = require('marked');

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
.addFilter('jsonParse', require('./filters/jsonParse.filter.js'))
.addExtension('pattern', new nunjucks_renderPattern())
.addGlobal('site',settings);

nunjucks_markdown.register(env, marked);

//static files
app.use(express.static('assets'));

//homepage
app.get('/', function (req, res) {
    posts.getPosts(['articles','gallery','notes'])
    .then(function(posts){
      res.render('pages/home.html', {
        title: 'Homepage',
        active: 'homepage',
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


//articles homepage
app.get('/articles', function(req,res) {
    posts.getPosts(['articles'])
    .then(function(posts){
      res.render('pages/articles.html', {
        title: 'Articles',
        active: 'articles',
        posts: posts,
        site: settings
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});

//articles post
app.get('/articles/:id', function(req,res) {
  if(/^\d+$/.test(req.params.id)) {//only process main req
    posts.getPost('articles',req.params.id)
    .then(function(post){
      res.render('pages/article.html', {
        title: post.attributes.title,
        active: 'articles',
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

//articles redirection from old /diary url:
app.get('/diary', function(req,res) {
  res.writeHead(301, {'Location':'/articles'});
  res.end();
});
//articles redirection from old /diary/:id url:
app.get('/diary/:id', function(req,res) {
  res.writeHead(301, {'Location':'/articles/'+req.params.id});
  res.end();
});

//Galleries
app.get('/gallery', function(req,res) {
    posts.getPosts(['gallery'])
    .then(function(posts){
      res.render('pages/gallery.html', {
        title: 'Gallery',
        active: 'gallery',
        posts: posts,
        site: settings
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});

//notes
app.get('/notes', function(req,res) {
    posts.getPosts(['notes'])
    .then(function(posts){
      res.render('pages/notes.html', {
        title: 'Notes',
        active: 'notes',
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
    res.render('pages/patterns_overview.html', {
      title: 'Pattern Library',
      active: 'pattern-library',
      patterns: patterns,
      site: settings
    })
  })
});

app.get('/patterns/:category',function(req,res) {
  patterns.getPatternsList().then(patterns => {
    res.render('pages/patterns_category.html', {
      title: 'Patterns / ' + req.params.category,
      active: 'pattern-library',
      site: settings,
      patterns: patterns,
      category: req.params.category
    })
  })

});

app.use(function(req, res){
    res.sendStatus(404);
});
