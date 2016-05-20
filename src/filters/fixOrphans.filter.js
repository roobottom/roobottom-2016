function fixOrphans(str){
  'use strict';
  let words = str.split(/\u0020/);
  let newStr = '';
  let len = words.length - 1;//zero based words in this string
  for(let i in words){
    if(len == 0) {
      newStr = words[i];
    }
    else if(len == i) {
      newStr += '&nbsp;' + words[i];
    }
    else{
      newStr += ' ' + words[i];
    }
  }
  return newStr;
};

module.exports = fixOrphans;
