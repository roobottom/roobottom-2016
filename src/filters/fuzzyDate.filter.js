function fuzzyDate(date,comparison){
	d1 = new Date(date*1000);
	d2 = new Date(comparison*1000);
	console.log(d1,d2);
  return 'test';
}

module.exports = fuzzyDate;
