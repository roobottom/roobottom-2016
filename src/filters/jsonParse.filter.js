var _ = require('lodash');

function jsonParse(str){
	'use strict';
	str = _.replace(str, /\s/g, '');
  return JSON.parse(str);
}

module.exports = jsonParse;
