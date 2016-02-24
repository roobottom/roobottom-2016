var express = require('express'),
    nunjucks = require('nunjucks'),
    nunjucksDate = require('nunjucks-date'),
    _ = require('lodash'),
    app = express(),

    posts = require('./posts.js'),
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
.addFilter('limitTo', require('./filters/limitTo.filter.js'));

//statics
app.use(express.static('assets'));

//homepage
app.get('/', function (req, res) {
    posts.get_all_posts(['./posts/diary/','./posts/gallery/','./posts/notes/'], function(posts) {
          res.render('pages/home.html', {
            title: 'Homepage',
            posts: posts,
            site: settings
          });
    });//end posts
});

//diary homepage
app.get('/diary', function(req,res) {
    posts.get_all_posts(['./posts/diary/'], function(posts) {
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
    var id = './posts/diary/' + req.params.id + '.md';
    posts.get_post(id,function(post) {
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
