'use strict';

let Promise = require('bluebird'),
    fs  = require('fs'),
    _ = require('lodash'),
    recursiveReadDir = require('recursive-readdir'),
    frontmatter = require('front-matter');

let patternTypes = ['containers','grids','icons','modules','utilities'];
let patternsRoot = './templates/patterns/';


function getPatternsForType(type) {
  return new Promise((resolve,reject) => {
    recursiveReadDir(patternsRoot+type, function (err, patterns) {
      if(!err) {
        patterns = _.remove(patterns, n => n.match(/^[\/\w]*\.md$/));
        resolve(patterns)
      } else {
        reject(err)
      }
    })
  });
};

function getListOfPatternsForType(type) {
  return new Promise((resolve,reject) => {
    recursiveReadDir(patternsRoot+type, function (err, patterns) {
      if(!err) {
        patterns = _.remove(patterns, n => n.match(/^[\/\w]*\.pattern$/));
        resolve(patterns)
      } else {
        reject(err)
      }
    })
  })
};

function getPatternData(pattern) {
  return new Promise((resolve,reject) => {
    resolve(frontmatter(pattern));
  });
}

function getPatternDataIfExists(pattern) {
  return new Promise((resolve,reject) => {
    pattern = pattern.replace(/.pattern$/g,'.md');
    console.log(pattern);
    let returnData ='';
    fs.stat(pattern,(err,stat) => {
      if(!err) {returnData = frontmatter(pattern)}
      resolve(returnData);
    })
  });
}

function getFileContents(file) {
  return new Promise((resolve,reject) => {
    fs.readFile(file, 'utf8', function(err,data) {
        if(!err) {
          resolve(data)
        }
        else { reject(err) }
    })
  })
}

function getFileContentsIfExists(file) {
  return new Promise((resolve,reject) => {

    file = file.replace(/.pattern$/g,'.md');
    let data = null;

    fs.stat(file,(err,stat) => {
      if(!err) {
        fs.readFile(file, 'utf8', function(err,data) {
            if(!err) {
              resolve(data)
            }
            else { reject(err) }
        })
      }
      else {
        resolve(data);
      }
    });
  })
}


/* get All Patterns */
function getAllPatterns() {
  let patternsList = [];

  return Promise.map(patternTypes,type => {
    return getPatternsForType(type)

    .then(patterns => {
      return Promise.map(patterns,pattern => {
        return getFileContents(pattern)
      })
    })

    .then(contents => {
      return Promise.map(contents,content => {
        return getPatternData(content);
      })
    })

    .then(data => {
      patternsList = _.concat(patternsList,data);
    })

  })
  .then(() => {
    return patternsList;
  })
  .catch(err => console.log(err));
}

/* simply return a list of all available `.pattern` files */
function getPatternsList() {

  let patternList = [];

  return Promise.map(patternTypes,type => {
    return getListOfPatternsForType(type)
    .then(list => {
      return {type: type, list: list};
    })

    .then(obj => {
      return Promise.map(obj.list,pattern => {
        return getFileContentsIfExists(pattern);
      })
      .then(contents => {
        return Promise.map(contents,content => {
          return getPatternData(content);
        })
      })
      .then(content => {
        return {type: obj.type, list: obj.list, content: content}
      })
    })


  })
  // .then(list => {
  //
  //   /* second stage, now loop through the list of patterns, and add-in any data. */
  //
  //   // return Promise.map(list,pattern => {
  //   //   return getFileContentsIfExists(pattern);
  //   // })
  //   // .then(contents => {
  //   //   return Promise.map(contents,content => {
  //   //     return getPatternData(content);
  //   //   })
  //   // })
  //
  //   return list;
  // })

}

module.exports.getAllPatterns = getAllPatterns;
module.exports.getPatternsList = getPatternsList;
