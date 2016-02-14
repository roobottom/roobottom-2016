var _ = require('lodash');

function get_tags(posts,cb) {
  var tags_array = [];
  posts_array = [];
  for (i in posts) {
    posts_array[i] = posts[i]
  }
  //console.dir(posts);
  get_tags_from_post(posts_array.pop(),function caller(tags) {
    cb(tags);
    if(posts_array.length > 0) {
      get_tags_from_post(posts_array.pop(),caller);
    };
  });

};

function get_tags_from_post(post,cb) {
  var tags;
  if(post.attributes.tags) tags=post.attributes.tags;
  cb(tags)
}

module.exports.get_tags = get_tags;
