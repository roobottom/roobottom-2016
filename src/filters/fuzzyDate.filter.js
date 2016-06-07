/*
convert diff in dates to hours
if days => 365
	yearDiff = round(days / 365)
	yearRemainder = round((days % 365) /30)

	if yearRemainder != 0

	else
		::

*/

var moment = require('moment');

function fuzzyDate(date,comparison){

	//calculate diff
	var a = moment(date);
	var b = moment(comparison);
	var diff = a.from(b,true);

  return diff;
}

module.exports = fuzzyDate;
