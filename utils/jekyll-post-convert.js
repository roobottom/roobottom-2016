/*
This file will read a bunch of Jekyll formatted `.md` posts in a folder,
grab the date from the filename and write it into the front-matter.

Files are copied to a new folder, rather than overwritten.

Requirements: `npm install lodash`, and that's it!
*/

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');


var source_folder = './_posts/';
var target_folder = './__posts/';

function get_files_in_folder(folder,cb) {
    fs.readdir(folder,function(err,files) {
        if(err) throw err;

        var files = _.remove(files,function(n) {
            return n.match(/[\d|-]*\.md/);
        });

        cb(folder,files);
    });
};

function process_file(folder,file,cb) {
  //get info from filename
  var match = file.match(/^\d{4}-\d{2}-\d{2}/);
  var date = 'date: '+match[0];

  var match = file.match(/\d*\.md$/);
  var filename =  match[0];

  //get file contents
  get_file_contents(folder+file,function(contents) {

    var needle = contents.match(/^-{3}/m);
    var replacement = '---\n' + date;
    var updated = _.replace(contents,needle[0],replacement);

    put_file_contents(target_folder,filename,updated,function(err) {
      if(!err) {
        cb('new file '+filename+' written OK');
      }
    });
  });
};

function get_file_contents(file,cb) {
  fs.readFile(file, 'utf8', function(err,data) {
      if(err) throw err;
      cb(data);
  });
};

function put_file_contents(folder,file,contents,cb) {
  fs.writeFile(folder+file, contents, (err) => {
    if (err) throw err;
    cb(err);
  });
};

/* caller script */
get_files_in_folder(source_folder,function(folder,files) {
  process_file(folder,files.pop(), function caller(ok) {
    console.log(ok);
    if(files.length > 0) {
      process_file(folder,files.pop(), caller);
    };
  });
});
