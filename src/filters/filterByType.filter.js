function filterByType(object, type){
	'use strict';
  object = object.filter(function( obj ) {
    return obj.attributes.type === type;
  });

  return object;
}

module.exports = filterByType;
