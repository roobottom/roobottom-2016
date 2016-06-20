document.addEventListener("DOMContentLoaded", function(event) {

  function buildGalleries(groupSize) {

    var galleries = Sizzle(".js_gallery");
    for(var g in galleries) {
      var images = Sizzle('.js_gallery__item',galleries[g]);
      if(galleries[g].dataset.groups) {
        groupSize = galleries[g].dataset.groups;
      }


      //split images into a collection.
      var collection = new Array;
      var count = 0;

      //calculate how many images overspill the groupSize.
      var remainder = images.length % groupSize;
      var overspill = 0;
      if(remainder >= 1) {overspill = images.length - 1;}


      for(var i in images) {
        var currentGroup = i % groupSize;
        //only create a new "row" in collection when starting a new row
        //and (less than overspill OR there is no overspill)
        if(currentGroup === 0 && (i < overspill || overspill === 0)) {
          if(i > 0) {count++;}
          collection.push(count);
          collection[count] = new Array;

        }
        collection[count].push(images[i]);
      };

      //iterate over collection and set width based on each "row"
      for(var n in collection) {
        var images = collection[n];
        var ratios = [];
        var ratioSum = 0;
        for(var i in images) {
          ratios.push(images[i].dataset.width/images[i].dataset.height);
          ratioSum += ratios[ratios.length - 1];
        };
        var ratioAverage = ratioSum / images.length;
        for(var i in images) {
          var adjustedWidth = (((ratios[i] / ratioAverage ) * (1 / images.length)) * 100);
          images[i].style.width = adjustedWidth + '%';
          images[i].className += ' js_gallery__item--is-enabled';
        };
      };
    };
  };

  buildGalleries(4);
});
