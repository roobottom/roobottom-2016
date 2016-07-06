'use strict';

let Promise = require('bluebird'),
    path = require('path'),
    fs  = require('fs-extra'),
    _ = require('lodash'),
    frontmatter = require('front-matter'),
    recursiveReadDir = require('recursive-readdir');

let patternTypes = ['containers','grids','typography','modules','utilities'];
let patternsRoot = './templates/patterns/';


function getListOfPatternsForType(type) {
  return new Promise((resolve,reject) => {
    recursiveReadDir(patternsRoot+type, function (err, patterns) {
      if(!err) {
        patterns = _.remove(patterns, n => n.match(/^.*\.example$/));
        patterns.sort();
        let cleanList = [];
        let nameArray = '';
        patterns.map(item => {

          //get basic file data
          let name = path.basename(item, '.example');
          nameArray = item.split('/');
          let folder = nameArray[nameArray.length -2];

          //get associated `.md` file if available.
          let mdfile = path.dirname(item) + '/' + name + '.md';
          let hasmd = fs.statSync(mdfile);

          console.log(hasmd);

          cleanList.push({file: './' + item.substr(patternsRoot.length - 2), name: name, folder: folder, markdown: mdfile })
        });
        console.log(cleanList);
        resolve(cleanList);
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
