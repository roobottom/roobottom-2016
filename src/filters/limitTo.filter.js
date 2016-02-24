function limitTo(input, limit){
	'use strict';
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
		if(limit >= 0){
			return input.splice(0, limit);
		} else {
			return input.splice(input.length + limit, input.length);
		}
	}
	return input;
}

module.exports = limitTo;
