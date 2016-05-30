'use strict';

/*
get full list of photosets from flickr
  compare that list to a local copy
  call any that are new or have changed.
  save photosets.json file.

Call photoset from flickr
  check if we have a local copy of the photoset
  if not, save it
  save [photoset-id].json file
*/

const Settings = require("./flickr.settings.json");
const fs = require('fs-extra');
const path = require('path');
const cacheFile = '../cache/_data/photosets.json';
const request = require('request');

const Flickr = require("flickrapi"),
  flickrOptions = {
    api_key: Settings.key,
    secret: Settings.secret
  };

//process flow:
// try {
//   const cache = require(cacheFile);
//   let photosets = cache.photoset;
//   let photosetsIdList = [];
//   photosets.map(photoset => {
//     photosetsIdList.push(photoset.id);
//   });
//   console.log(photosetsIdList);
//   photosetsIdList.map(id => {
//     getPhotoset(id, function(result, err) {
//       if(!err) {
//         writeJSON('../cache/'+id+'.json',result,function(err) {
//           if(err) { console.log(err); }
//           console.log(result);
//         });
//       }
//       else {
//         console.log(err);
//       }
//     })
//   });
// }
// catch(e) {
//   console.log('error:',e);
// }

// createCache(function(e) {
//   if(e) { m(e); }
//   else { m('cache created OK'); }
// })

writeJSON('../cache/test.json','{"result":"yeah"}',function(err) {
  if(!err) { console.log("OK"); }
  else { console.log(err); }
});


/*
writing files to disk
*/



function getRemoteFile(file,cb) {
  request(file, function (err, response, body) {
    if (!err && response.statusCode == 200) { cb(null,body); }
    else { cb(err,null); }
  });
};

/*
  photoset FUNCTIONS
*/


function getPhotoset(id,cb) {
  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    flickr.photosets.getPhotos({
      api_key: Settings.key,
      user_id: Settings.id,
      photoset_id: id,
      page: 1,
      per_page: 500,
      extras: 'url_o,url_s'
    }, function(err, result) {
      if(!err) { cb(result,null); }
      else { cb(null,err); }
    });
  });
};

function temp() {
  fs.readFile(cacheFile,'utf8',function(err,data) {
    if (!err) {
      let photosets = JSON.parse(data);

    }
    else {
      cb(null,err);
    }
  })
}

/*
  photosetS FUNCTIONS
*/

function createCache(cb) {
  getPhotosets(function(photosets,err) {
    if(!err) {
      writeJSON(cacheFile,photosets,function(err) {
        if(!err) { cb(null); }
        else { cb(err); }
      });
    }
    else { cb(err); }
  });
};

function getPhotosets(cb) {
  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    flickr.photosets.getList({
      api_key: Settings.key,
      user_id: Settings.id,
      page: 1,
      per_page: 500
    }, function(err, result) {
      if(!err) { cb(result.photosets,null); }
      else { cb(null,err); }
    });
  });
};

function writeJSON(file,contents,cb) {
  fs.ensureDir(path.dirname(file), function(err) {
    if(!err) {
      fs.writeJson(file, contents, function (err) {
        if(!err) { console.log('written file'+file); cb(null); }
        else { cb(err); }
      });
    };
  });
};

function writeFile(file,contents,cb) {
  fs.ensureDir(path.dirname(file), function(err) {
    if(!err) {
      fs.writeFile(file, contents, function (err) {
        if(!err) { cb(null); }
        else { cb(err); }
      });
    };
  });
};

function m(message) {
  console.log("-----------" + message + "-----------");
}
