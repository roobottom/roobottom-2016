'use strict';

const fs      = require('fs-extra');
const gm      = require('gm');
const path    = require('path');
const sizeOf  = require('image-size');
const _       = require('lodash');

const __basename = _.trimEnd(__dirname,'src');
const oRoot = __basename+'images/';
const dataFile = __basename+oRoot+'_cache/imageSizes.json';
const types = ['articles','gallery','notes'];

function getSize(image,cb) {
  let size = sizeOf(image);
  cb(size);
};

function go() {

  let sizeArray = [];
  let n = 0;

  types.map(type => {
    fs.readdir(oRoot+type,(err,files) => {

      if(!err) {
        files = _.remove(files, n => n.match(/^[\w\d]*\.jpg$/));
        files.map(file => {
          getSize(oRoot+type+'/'+file,size=>{
            sizeArray.push({file:file,type:type,width:size.width,height:size.height});
            console.log(n++);
          });
        });
      };

    });
  });
};

go();
