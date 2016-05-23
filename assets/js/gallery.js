window.onload = function() {

  var galleries = Sizzle(".m_figure--gallery");
  for(var g in galleries) {
    var images = Sizzle('img',galleries[g]);
    var ratios = [];
    var ratioSum = 0;

    for(var i in images) {
      ratios.push(images[i].dataset.width/images[i].dataset.height);
      ratioSum += ratios[ratios.length - 1];
    };
    var ratioAverage = ratioSum / images.length;
    for(var i in images) {
      var adjustedWidth = (((ratios[i] / ratioAverage ) * (1 / images.length)) * 100) - (images.length - 1);
      images[i].style.width = adjustedWidth + '%';
    };
  };
};
