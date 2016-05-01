'use strict';

var striptags = require('striptags');

function stripPatterns(input){
  return striptags(input, ['p']);
};

module.exports = stripPatterns;
