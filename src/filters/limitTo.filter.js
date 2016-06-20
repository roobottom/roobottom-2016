function limitTo(input, limit, offset, type){
	'use strict';

	const _ = require('lodash');

	if(!offset) { var offset = 0; }
	if(typeof limit !== 'number'){
		return input;
	}
	if(typeof input === 'string'){
		if(limit >= 0){
			return input.substring(0, limit);
		} else {
			return input.substr(limit);
		}
	}
	if(Array.isArray(input)){
		limit = Math.min(limit, input.length);
		console.log(type);
		//check type
		if(type) {
			var types = _.remove(input, function(n) {
				if(n.attributes.type != type) {
					return n;
				}
			});
		}

		if(limit >= 0){
			return input.slice(offset, limit+offset);
		} else {
			return input.slice(input.length + limit, input.length);
		}
	}
	return input;
}

module.exports = limitTo;
