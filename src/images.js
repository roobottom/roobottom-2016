'use strict';

const fs      = require('fs-extra');
const gm      = require('gm');
const path    = require('path');
const sizeOf  = require('image-size');
const _       = require('lodash');

const __basename = _.trimEnd(__dirname,'src');
const oRoot = __basename+'images/';
const cacheRoot = __basename+'images/_cache/';
console.log(__basename);

const express = require('express');
const app = express();
app.use(express.static(cacheRoot));

const whitelist = [
  '^.*\/\/roo\.dev\/?.*$',
  '^.*\/\/roobottom\.com\/?.*$',
  '^.*\/\/localhost\/?.*$'
];
const whitelist_regex = new RegExp(whitelist.join("|"), "g");

/*
This script is written synchronously. It may be a _tad_ slower, but it works!
OK, so until we hit the gm lib — which forces us down the cb path.

User requests: [img server]/r/[h]/[w]/[type]/[img]
Script:
- checks the referer is on the whitelist / or script is locally called (if not => 403)
- check for the existance of the orriginal file (if none => 404)
- checks for the exsitance of the resized file
- creates the resized file if doesn't exist (if error => 500)
- serves the file via express
- catches any errors and response with the correct http header (404, 500 or 403)

User request: [img server]/i/[type]/[img]
Script:
- checks the referer is on the whitelist / or script is locally called (if not => 403)
- check for the exitstance of the the orriginal file (if none => 404)
- checks the w and h of the file
- serves a JSON object via express
- catches any errors and response with the correct http header (404, 500 or 403)
*/

function checkFile(file) {
  try {
    return {file:fs.statSync(file),err: null};
  }
  catch(e) {
    return {file: null, err: e};
  }

};


//`w` and `h` can be either an int or 'auto'
function calculateResize(file,w,h) {
    //should we resize the image exactly?
    w = (w === 'auto') ? null:w;
    h = (h === 'auto') ? null:h;
    let cropW=w,cropH=h;

    //requires crop
    if(w===h) {
      //get size of orriginal file:
      let size = sizeOf(file);
      //landscape:
      if(size.width > size.height) { w=null; }
      //resize by w first, then crop
      else { h=null; }
      return {w:w,h:h,cropW:cropW,cropH:cropH}
    }
    //no crop
    else {
      return {w:w,h:h}
    }
};





function resize(orriginal,target,size,cb) {
  if(size.cropW && size.cropH) {
    gm(orriginal)
    .resize(size.w,size.h)
    .crop(size.cropW,size.cropH)
    .noProfile()
    .write(target,function(err) {
      if (!err) {cb(null);}
      else {cb(err);}
    });
  }
  else {
    gm(orriginal)
    .resize(size.w,size.h)
    .noProfile()
    .write(target,function(err) {
      if (!err) {cb(null);}
      else {cb(err);}
    });
  }

}

function go(type,file,w,h,cb) {
  let targetDir = cacheRoot + type + '/' + w + 'x' + h + '/';
  let sourceFile = oRoot + type + '/' + file;

  //ensure that we don't already have a cached version of this file:
  let cacheStatus = checkFile(targetDir+file);
  if(!cacheStatus.err) {
    cb({file: targetDir+file, err: null, code: 200});
  } else {
    //ensure that there _is_ a file we can resize:
    let fileStatus = checkFile(sourceFile);
    if(!fileStatus.err) {
      fs.ensureDirSync(targetDir);
      resize(sourceFile,targetDir+file,calculateResize(sourceFile,w,h),function(err) {
        if(!err) {
          cb({file: targetDir+file, err: null, code: 200});
        }
        else {
          cb({err: fileStatus.err, code: 503});
        }
      });

    } else {
      cb({err: fileStatus.err+' /// '+targetDir+sourceFile, code: 404});
    }
  }
}

/*
webserver
*/

app.get('/r/:w/:h/:path/:img', function (req, res) {
    var referer = req.headers.referer;
    if(!referer) referer='//localhost';//if we call this script direct

    //check that the caller is on the whitelist.
    if(referer.match(whitelist_regex) === null) {
        res.sendStatus(403);
    } else {
      go(req.params.path,req.params.img,req.params.w,req.params.h, function(status) {
        if(!status.err) {
          res.sendFile(status.file, {
            root:'/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
          });
        }
        else {
          res.status(status.code).send('Error: '+status.err);
        }
      });
    }
});

app.use(function(req, res){
    res.sendStatus(404);
});

app.listen(3003, function () {
  console.log('Image server running on port 3003!');
});
