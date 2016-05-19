function fixOrphans(str){
  'use strict';
  let words = str.split(/\W+/);
  let newStr = '';
  let len = words.length - 1;
  for(let i in words){
    if(len == i) {
      newStr += '&nbsp;' + words[i];
    }
    else{
      newStr += ' ' + words[i];
    }
  }
  return newStr;
};

module.exports = fixOrphans;
