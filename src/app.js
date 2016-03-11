'use strict';

var express = require('express'),
    nunjucks = require('nunjucks'),
    nunjucksDate = require('nunjucks-date'),
    _ = require('lodash'),
    app = express(),

    posts = require('./posts.js'),
    p_posts = require('./posts.promises.js'),
    tags = require('./tags.js'),
    settings = require('./settings.json');
var __basename = _.trimEnd(__dirname,'src');

app.listen(3002, function () {
  console.log('Roobottom.com running at localhost:3002');
});

nunjucksDate.setDefaultFormat('MMMM Do YYYY');
nunjucks.configure( __basename + 'templates/', {
    autoescape: false,
    cache: false,
    express: app,
})
.addFilter('date', require('nunjucks-date'))
.addFilter('limitTo', require('./filters/limitTo.filter.js'))
.addFilter('filterByType', require('./filters/filterByType.filter.js'))
.addGlobal('site','settings');

//statics
app.use(express.static('assets'));

//homepage
app.get('/', function (req, res) {
    posts.get_all_posts(function(posts) {
          res.render('pages/home.html', {
            title: 'Homepage',
            posts: posts
          });
    });//end posts
});

//update json cache files.
app.get('/u',function (req,res) {
  posts.process_all_posts(function(posts) {
    res.render('pages/u.html', {
      title: 'Refresh caches',
      posts: posts
    });
  });
});

app.get('/test',function(req,res) {
  p_posts.processAllPosts().then(function(posts){
    console.log('inside then in app.get');
    console.dir(posts);
    res.render('pages/test.html', {
      posts:posts
    })
  });
});


//diary homepage
app.get('/diary', function(req,res) {
    posts.get_all_posts(function(posts) {
      res.render('pages/diary.html', {
        title: 'Diary',
        posts: posts,
        site: settings
      });
    });
});

//diary post
app.get('/diary/:id', function(req,res) {
  if(/^\d+$/.test(req.params.id)) {//only process main req
    posts.get_post(req.params.id,'diary',function(post) {
      res.render('pages/diary_post.html', {
        title: post.attributes.title,
        post: post,
        site: settings
      });
    });
  } else {
    res.end();
  };
});

app.use(function(req, res){
    res.sendStatus(404);
});
