var githubhook = require('githubhook');
var exec = require('child_process').exec;
var github = githubhook({
  host: '127.0.0.1',
  port: '3033',
  path: '/'
});

github.listen();

github.on('event', function (repo, ref, data) {

  pull();

});

function pull() {
  exec('git pull' , function (err, stdout, stderr) {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
        if (err) {
            console.log(err);
        }
    });
};
