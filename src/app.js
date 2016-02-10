var express = require('express'),
    nunjucks = require('nunjucks'),
    nunjucksDate = require('nunjucks-date'),
    app = express(),
    posts = require('./posts.js'),
    settings = require('./settings.json');

app.listen(3002, function () {
  console.log('Roobottom.com running at localhost:3002');
});

nunjucksDate.setDefaultFormat('MMMM Do YYYY');
nunjucks.configure( './templates/', {
    autoescape: false,
    cache: false,
    express: app,
})
.addFilter('date', require('nunjucks-date'));

//homepage
app.get('/', function (req, res) {
    posts.get_all_posts(['./posts/diary/','./posts/gallery/','./posts/notes/'], function(posts) {
        res.render('pages/home.html', {
            title: 'Homepage',
            posts: posts,
            site: settings
        });
    });
});

app.use(express.static('./assets/'));

app.use(function(req, res){
    res.sendStatus(404);
});
