var express = require('express'),
    nunjucks = require('nunjucks'),
    app = express(),
    posts = require('./posts.js'),
    settings = require('./settings.json');

app.listen(3002, function () {
  console.log('Roobottom.com running at localhost:3002');
});

nunjucks.configure( './templates/', {
    autoescape: false,
    cache: false,
    express: app,
});

//routes
app.get('/', function (req, res) {
    posts.get_all_posts('./posts/diary/', function(posts) {
        res.render('pages/home.html', {
            title: 'Homepage',
            diary_posts: posts,
            site: settings
        });
    });
});

app.use(express.static('assets'));

app.use(function(req, res){
    res.sendStatus(404);
});

//console.log(posts.get_all_posts('./posts/diary/'));