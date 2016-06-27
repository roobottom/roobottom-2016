var _ = require('underscore');
document.addEventListener("DOMContentLoaded", function(event) {

  var folddowns = $(".js_folddown");

  /*folddowns*/
  function folddownsGo() {
    folddowns__init();
    folddowns__addUI();
    folddowns__listen();
  };

  function folddowns__init() {
    $(".js_folddown--target").each(function() {
      $(this).css({
        'display':'none'
      });
    });
  };

  function folddowns__addUI() {
    $(".js_folddown--trigger").each(function() {
      $(this).append('<span class="js_folddown--show-code-message">&lt;code&gt;</span>');
      this.classList.add('js_foldown--is-active');
    });
  };

  function folddowns__listen() {
    $('.js_folddown').each(function(folddown) {
      $('.js_folddown--trigger',folddown).each(function() {
        this.addEventListener('click',function() {

          $('.js_folddown--target',folddown).toggle('css',{
            'display':'block'
          });

        });
      });
    });
  };

  folddownsGo();

  /*galleries*/
  function buildGalleries(groupSize) {

    $('.js_gallery').each(function() {
      //override groupSize from data attr if one is set.
      if(this.dataset.groups) {groupSize = this.dataset.groups;}

      //get images object
      var images = $('.js_gallery__item',this);

      //create a new collection Array, read for the images.
      var collection = new Array;
      var count = 0;

      //calculate how many images overspill the groupSize.
      var remainder = images.length % groupSize;
      var overspill = 0;
      if(remainder >= 1) {overspill = images.length - 1;}

      //loop through each of the images in this gallery
      //and build the collection object
      images.each(function(e,i) {
        var currentGroup = i % groupSize;
        //only create a new "row" in collection when starting a new row
        //and (less than overspill OR there is no overspill)
        if(currentGroup === 0 && (i < overspill || overspill === 0)) {
          if(i > 0) {count++;}
          collection.push(count);
          collection[count] = new Array;

        }
        collection[count].push(e);
      });

      _.each(collection,function(images) {
        var ratios = [];
        var ratioSum = 0;
        //loop through images, and build rations array:
        _.each(images,function(image) {
          ratios.push(image.dataset.width/image.dataset.height);
          ratioSum += ratios[ratios.length - 1];
        })
        var ratioAverage = ratioSum / images.length;
        //loop through images and apply calculated widths:
        _.each(images,function(image,i) {
          var adjustedWidth = (((ratios[i] / ratioAverage ) * (1 / images.length)) * 100);
          image.style.width = adjustedWidth + '%';
          image.className += ' js_gallery__item--is-enabled';
        });
      });


    });

  };
  buildGalleries(3);

  /* gallery captions */
  function enhanceCaptions() {
    $('.js_caption').each(function() {
      this.classList.add('js_caption--is-enabled');
      this.addEventListener('mouseenter',function() {
        $('[data-captiontarget="'+this.dataset.captionfor+'"]').each(function() {
          this.classList.add('m_gallery__image--is-highlighted')
        });
      });
      this.addEventListener('mouseleave',function() {
        $('[data-captiontarget="'+this.dataset.captionfor+'"]').each(function() {
          this.classList.remove('m_gallery__image--is-highlighted')
        });
      });
    });
  };
  enhanceCaptions();



});
