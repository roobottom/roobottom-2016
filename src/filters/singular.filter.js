function singular(str){
  'use strict';
  if(str.slice(-1) === 's') {
    return str.slice(0,-1);
  }
  else{
    return str;
  }
};

module.exports = singular;
