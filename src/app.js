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
.addFilter('date', require('nunjucks-date'));

//homepage
app.get('/', function (req, res) {
    posts.get_all_posts(['./posts/diary/','./posts/gallery/','./posts/notes/'],20, function(posts) {
          res.render('pages/home.html', {
            title: 'Homepage',
            posts: posts,
            site: settings
          });
    });//end posts
});

app.get('/diary', function(req,res) {
    posts.get_all_posts(['./posts/diary/'],null, function(posts) {
      res.render('pages/diary.html', {
        title: 'Diary',
        posts: posts,
        site: settings
      });
    });
});

app.use(express.static(__basename + 'assets'));

app.use(function(req, res){
    res.sendStatus(404);
});
