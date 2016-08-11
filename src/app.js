'use strict';

var express = require('express'),
    nunjucks = require('nunjucks'),
    nunjucksDate = require('nunjucks-date'),
    _ = require('lodash'),
    app = express(),
    nconf = require('nconf'),

    posts = require('./posts.js'),
    patterns = require('./patterns.js'),
    tags = require('./tags.js'),
    nunjucks_renderPattern = require('./tags/renderPattern.tag.js'),
    nunjucks_markdown = require('nunjucks-markdown'),
    marked = require('marked');

    //settings
    nconf.env();
    if(nconf.get('settings')) {
      var settings = require(nconf.get('settings'));
      console.log('using settings file:',nconf.get('settings'));
    }
    else {
      var settings = require('./settings.json');
      console.log('using default settings');
    }


var __basename = _.trimEnd(__dirname,'src');

app.listen(3002, function () {
  console.log('Roobottom.com running at localhost:3002');
});

nunjucksDate.setDefaultFormat('dddd, Do MMMM YYYY');
let env = nunjucks.configure( __basename + 'templates/', {
    autoescape: false,
    cache: false,
    express: app,
})
.addFilter('date', require('nunjucks-date'))
.addFilter('limitTo', require('./filters/limitTo.filter.js'))
.addFilter('filterByType', require('./filters/filterByType.filter.js'))
.addFilter('jsonParse', require('./filters/jsonParse.filter.js'))
.addFilter('stripPatterns', require('./filters/stripPatterns.filter.js'))
.addFilter('singular', require('./filters/singular.filter.js'))
.addFilter('fixOrphans', require('./filters/fixOrphans.filter.js'))
.addFilter('arrayPush', require('./filters/arrayPush.filter.js'))
.addFilter('fuzzyDate', require('./filters/fuzzyDate.filter.js'))
.addExtension('pattern', new nunjucks_renderPattern())
.addGlobal('site',settings)

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});


nunjucks_markdown.register(env, marked);

//static files
app.use(express.static('./assets'));

function calculatePagination(totalItems,currentPage) {
  let pages = Math.ceil(totalItems/settings.postsPerPage);
  let obj = [];
  for(let i=1; i<=pages; i++) {
    let isCurrent = false;
    if(i == currentPage) { isCurrent = true; }
    obj.push({title: i, current: isCurrent, url: 'page-'+i});
  };
  return obj;
};

//homepage
app.get('/', function (req, res) {
    posts.getPosts('')
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

//------------------------------------------//
// caches
//------------------------------------------//
app.get('/u',function(req,res) {
  let allPosts;
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


//------------------------------------------//
// articles
//------------------------------------------//

//articles homepage
app.get('/articles', function(req,res) {
    posts.getPosts('articles')
    .then(function(posts){
      res.render('pages/articles.html', {
        title: 'Articles',
        active: 'articles',
        posts: posts,
        site: settings,
        pagination: calculatePagination(posts.length,1),
        currentPage: 1
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});
//articles page-1: has same content as /articles, so redirect there:
app.get('/articles/page-1', function(req,res) {
    res.writeHead(301, {'Location':'/articles'});
    res.end();
});
//articles pagination
app.get('/articles/page-:num', function(req,res) {
    posts.getPosts('articles')
    .then(function(posts){
      res.render('pages/articles.html', {
        title: 'Articles, page ' + req.params.num,
        active: 'articles',
        posts: posts,
        site: settings,
        pagination: calculatePagination(posts.length,req.params.num),
        currentPage: req.params.num
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

//------------------------------------------//
// galleries
//------------------------------------------//
app.get('/gallery', function(req,res) {
    posts.getPosts('gallery')
    .then(function(posts){
      res.render('pages/galleries.html', {
        title: 'Gallery',
        active: 'gallery',
        posts: posts,
        site: settings,
        pagination: calculatePagination(posts.length,1),
        currentPage: 1
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});
//galleries page-1: has same content as /gallery, so redirect there:
app.get('/gallery/page-1', function(req,res) {
    res.writeHead(301, {'Location':'/gallery'});
    res.end();
});
//galleries pagination
app.get('/gallery/page-:num', function(req,res) {
    posts.getPosts('gallery')
    .then(function(posts){
      res.render('pages/galleries.html', {
        title: 'Gallery, page ' + req.params.num,
        active: 'gallery',
        posts: posts,
        site: settings,
        pagination: calculatePagination(posts.length,req.params.num),
        currentPage: req.params.num
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});
app.get('/gallery/:id', function(req,res) {
  if(/^\d+$/.test(req.params.id)) {//only process main req
    posts.getPost('gallery',req.params.id)
    .then(function(post){
      res.render('pages/gallery.html', {
        title: post.attributes.title,
        active: 'gallery',
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


//------------------------------------------//
// notes
//------------------------------------------//
app.get('/notes', function(req,res) {
    posts.getPosts('notes')
    .then(function(posts){
      res.render('pages/notes.html', {
        title: 'Notes',
        active: 'notes',
        posts: posts,
        site: settings,
        pagination: calculatePagination(posts.length,1),
        currentPage: 1
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});
//notes page-1: has same content as /notes, so redirect there:
app.get('/notes/page-1', function(req,res) {
    res.writeHead(301, {'Location':'/notes'});
    res.end();
});
//notes pagination
app.get('/notes/page-:num', function(req,res) {
    posts.getPosts('notes')
    .then(function(posts){
      res.render('pages/notes.html', {
        title: 'Notes, page ' + req.params.num,
        active: 'notes',
        posts: posts,
        site: settings,
        pagination: calculatePagination(posts.length,req.params.num),
        currentPage: req.params.num
      })
    })
    .catch(err => {
      console.log('error: ', err);
      res.sendStatus(404);
    });
});
app.get('/notes/:id', function(req,res) {
  if(/^\d+$/.test(req.params.id)) {//only process main req
    posts.getPost('notes',req.params.id)
    .then(function(post){
      res.render('pages/note.html', {
        title: post.attributes.title,
        active: 'notes',
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

//------------------------------------------//
// webhooks
//------------------------------------------//

app.get('/webhook/:id', function(req,res) {
  res.send(req);
  res.end();
});


//------------------------------------------//
// portfolio
//------------------------------------------//
app.get('/portfolio', function(req,res) {
  res.render('pages/portfolio.html', {
    title: 'Portfolio',
    active: 'portfolio',
    site: settings
  })
});

//------------------------------------------//
// archives
//------------------------------------------//
app.get('/archives', function(req,res) {
  res.render('pages/archives.html', {
    title: 'Archives',
    active: 'archives',
    site: settings
  })
});

//------------------------------------------//
// pattern library
//------------------------------------------//
app.get('/patterns',function(req,res) {
  patterns.getPatternsList().then(patterns => {
    res.render('pages/patterns_overview.html', {
      title: 'Pattern Library',
      active: 'pattern-library',
      subActive: 'overview',
      patterns: patterns,
      site: settings
    })
  })
});

app.get('/patterns/:category',function(req,res) {
  patterns.getPatternsList().then(patterns => {
    res.render('pages/patterns_category.html', {
      title: req.params.category,
      active: 'pattern-library',
      subActive: req.params.category,
      site: settings,
      patterns: patterns,
      category: req.params.category
    })
  })

});

app.use(function(req, res){
    res.sendStatus(404);
});
