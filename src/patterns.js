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

function getPatternData(pattern) {
  return new Promise((resolve,reject) => {
    resolve(frontmatter(pattern));
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

module.exports.getAllPatterns = getAllPatterns;
