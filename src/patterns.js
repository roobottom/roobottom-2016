'use strict';

let Promise = require('bluebird'),
    fs  = require('fs'),
    _ = require('lodash'),
    recursiveReadDir = require('recursive-readdir');

let patternTypes = ['containers','grids','typography','modules','utilities'];
let patternsRoot = './templates/patterns/';


function getListOfPatternsForType(type) {
  return new Promise((resolve,reject) => {
    recursiveReadDir(patternsRoot+type, function (err, patterns) {
      if(!err) {
        patterns = _.remove(patterns, n => n.match(/^[\/\w]*\.example$/));
        resolve(patterns)
      } else {
        reject(err)
      }
    })
  })
};

/* simply return a list of all available `.example` files */
function getPatternsList() {

  return Promise.map(patternTypes,type => {
    return getListOfPatternsForType(type)
    .then(list => {
      return {type: type, list: list};
    })

  })
  .then(list => {
    return list;
  });
}

module.exports.getPatternsList = getPatternsList;
