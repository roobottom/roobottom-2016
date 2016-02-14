var githubhook = require('githubhook');
var github = githubhook({
  host: '127.0.0.1',
  port: '3033'
});

github.listen();

github.on('event', function (repo, ref, data) {

  console.log(data);

});
