/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://enderjs.com)
  * Build: ender build underscore sizzle bonzo
  * Packages: ender-core@2.0.0 ender-commonjs@1.0.8 underscore@1.8.3 sizzle@2.3.0 bonzo@2.0.0
  * =============================================================
  */

(function () {

  /*!
    * Ender: open module JavaScript framework (client-lib)
    * http://enderjs.com
    * License MIT
    */
  
  /**
   * @constructor
   * @param  {*=}      item      selector|node|collection|callback|anything
   * @param  {Object=} root      node(s) from which to base selector queries
   */
  function Ender(item, root) {
    var i
    this.length = 0 // Ensure that instance owns length
  
    if (typeof item == 'string')
      // start with strings so the result parlays into the other checks
      // the .selector prop only applies to strings
      item = ender._select(this['selector'] = item, root)
  
    if (null == item) return this // Do not wrap null|undefined
  
    if (typeof item == 'function') ender._closure(item, root)
  
    // DOM node | scalar | not array-like
    else if (typeof item != 'object' || item.nodeType || (i = item.length) !== +i || item == item.window)
      this[this.length++] = item
  
    // array-like - bitwise ensures integer length
    else for (this.length = i = (i > 0 ? ~~i : 0); i--;)
      this[i] = item[i]
  }
  
  /**
   * @param  {*=}      item   selector|node|collection|callback|anything
   * @param  {Object=} root   node(s) from which to base selector queries
   * @return {Ender}
   */
  function ender(item, root) {
    return new Ender(item, root)
  }
  
  
  /**
   * @expose
   * sync the prototypes for jQuery compatibility
   */
  ender.fn = ender.prototype = Ender.prototype
  
  /**
   * @enum {number}  protects local symbols from being overwritten
   */
  ender._reserved = {
    reserved: 1,
    ender: 1,
    expose: 1,
    noConflict: 1,
    fn: 1
  }
  
  /**
   * @expose
   * handy reference to self
   */
  Ender.prototype.$ = ender
  
  /**
   * @expose
   * make webkit dev tools pretty-print ender instances like arrays
   */
  Ender.prototype.splice = function () { throw new Error('Not implemented') }
  
  /**
   * @expose
   * @param   {function(*, number, Ender)}  fn
   * @param   {object=}                     scope
   * @return  {Ender}
   */
  Ender.prototype.forEach = function (fn, scope) {
    var i, l
    // opt out of native forEach so we can intentionally call our own scope
    // defaulting to the current item and be able to return self
    for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
    // return self for chaining
    return this
  }
  
  /**
   * @expose
   * @param {object|function} o
   * @param {boolean=}        chain
   */
  ender.ender = function (o, chain) {
    var o2 = chain ? Ender.prototype : ender
    for (var k in o) !(k in ender._reserved) && (o2[k] = o[k])
    return o2
  }
  
  /**
   * @expose
   * @param {string}  s
   * @param {Node=}   r
   */
  ender._select = function (s, r) {
    return s ? (r || document).querySelectorAll(s) : []
  }
  
  /**
   * @expose
   * @param {function} fn
   */
  ender._closure = function (fn) {
    fn.call(document, ender)
  }
  
  if (typeof module !== 'undefined' && module['exports']) module['exports'] = ender
  var $ = ender
  
  /**
   * @expose
   * @param {string} name
   * @param {*}      value
   */
  ender.expose = function (name, value) {
    ender.expose.old[name] = window[name]
    window[name] = value
  }
  
  /**
   * @expose
   */
  ender.expose.old = {}
  
  /**
   * @expose
   * @param {boolean} all   restore only $ or all ender globals
   */
  ender.noConflict = function (all) {
    window['$'] = ender.expose.old['$']
    if (all) for (var k in ender.expose.old) window[k] = ender.expose.old[k]
    return this
  }
  
  ender.expose('$', ender)
  ender.expose('ender', ender); // uglify needs this semi-colon between concating files
  
  /*!
    * Ender: open module JavaScript framework (module-lib)
    * http://enderjs.com
    * License MIT
    */
  
  var global = this
  
  /**
   * @param  {string}  id   module id to load
   * @return {object}
   */
  function require(id) {
    if ('$' + id in require._cache)
      return require._cache['$' + id]
    if ('$' + id in require._modules)
      return (require._cache['$' + id] = require._modules['$' + id]._load())
    if (id in window)
      return window[id]
  
    throw new Error('Requested module "' + id + '" has not been defined.')
  }
  
  /**
   * @param  {string}  id       module id to provide to require calls
   * @param  {object}  exports  the exports object to be returned
   */
  function provide(id, exports) {
    return (require._cache['$' + id] = exports)
  }
  
  /**
   * @expose
   * @dict
   */
  require._cache = {}
  
  /**
   * @expose
   * @dict
   */
  require._modules = {}
  
  /**
   * @constructor
   * @param  {string}                                          id   module id for this module
   * @param  {function(Module, object, function(id), object)}  fn   module definition
   */
  function Module(id, fn) {
    this.id = id
    this.fn = fn
    require._modules['$' + id] = this
  }
  
  /**
   * @expose
   * @param  {string}  id   module id to load from the local module context
   * @return {object}
   */
  Module.prototype.require = function (id) {
    var parts, i
  
    if (id.charAt(0) == '.') {
      parts = (this.id.replace(/\/.*?$/, '/') + id.replace(/\.js$/, '')).split('/')
  
      while (~(i = parts.indexOf('.')))
        parts.splice(i, 1)
  
      while ((i = parts.lastIndexOf('..')) > 0)
        parts.splice(i - 1, 2)
  
      id = parts.join('/')
    }
  
    return require(id)
  }
  
  /**
   * @expose
   * @return {object}
   */
   Module.prototype._load = function () {
     var m = this
     var dotdotslash = /^\.\.\//g
     var dotslash = /^\.\/[^\/]+$/g
     if (!m._loaded) {
       m._loaded = true
  
       /**
        * @expose
        */
       m.exports = {}
       m.fn.call(global, m, m.exports, function (id) {
         if (id.match(dotdotslash)) {
           id = m.id.replace(/[^\/]+\/[^\/]+$/, '') + id.replace(dotdotslash, '')
         }
         else if (id.match(dotslash)) {
           id = m.id.replace(/\/[^\/]+$/, '') + id.replace('.', '')
         }
         return m.require(id)
       }, global)
     }
  
     return m.exports
   }
  
  /**
   * @expose
   * @param  {string}                     id        main module id
   * @param  {Object.<string, function>}  modules   mapping of module ids to definitions
   * @param  {string}                     main      the id of the main module
   */
  Module.createPackage = function (id, modules, main) {
    var path, m
  
    for (path in modules) {
      new Module(id + '/' + path, modules[path])
      if (m = path.match(/^(.+)\/index$/)) new Module(id + '/' + m[1], modules[path])
    }
  
    if (main) require._modules['$' + id] = require._modules['$' + id + '/' + main]
  }
  
  if (ender && ender.expose) {
    /*global global,require,provide,Module */
    ender.expose('global', global)
    ender.expose('require', require)
    ender.expose('provide', provide)
    ender.expose('Module', Module)
  }
  
  Module.createPackage('underscore', {
    'underscore': function (module, exports, require, global) {
      //     Underscore.js 1.8.3
      //     http://underscorejs.org
      //     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
      //     Underscore may be freely distributed under the MIT license.
      
      (function() {
      
        // Baseline setup
        // --------------
      
        // Establish the root object, `window` in the browser, or `exports` on the server.
        var root = this;
      
        // Save the previous value of the `_` variable.
        var previousUnderscore = root._;
      
        // Save bytes in the minified (but not gzipped) version:
        var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
      
        // Create quick reference variables for speed access to core prototypes.
        var
          push             = ArrayProto.push,
          slice            = ArrayProto.slice,
          toString         = ObjProto.toString,
          hasOwnProperty   = ObjProto.hasOwnProperty;
      
        // All **ECMAScript 5** native function implementations that we hope to use
        // are declared here.
        var
          nativeIsArray      = Array.isArray,
          nativeKeys         = Object.keys,
          nativeBind         = FuncProto.bind,
          nativeCreate       = Object.create;
      
        // Naked function reference for surrogate-prototype-swapping.
        var Ctor = function(){};
      
        // Create a safe reference to the Underscore object for use below.
        var _ = function(obj) {
          if (obj instanceof _) return obj;
          if (!(this instanceof _)) return new _(obj);
          this._wrapped = obj;
        };
      
        // Export the Underscore object for **Node.js**, with
        // backwards-compatibility for the old `require()` API. If we're in
        // the browser, add `_` as a global object.
        if (typeof exports !== 'undefined') {
          if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
          }
          exports._ = _;
        } else {
          root._ = _;
        }
      
        // Current version.
        _.VERSION = '1.8.3';
      
        // Internal function that returns an efficient (for current engines) version
        // of the passed-in callback, to be repeatedly applied in other Underscore
        // functions.
        var optimizeCb = function(func, context, argCount) {
          if (context === void 0) return func;
          switch (argCount == null ? 3 : argCount) {
            case 1: return function(value) {
              return func.call(context, value);
            };
            case 2: return function(value, other) {
              return func.call(context, value, other);
            };
            case 3: return function(value, index, collection) {
              return func.call(context, value, index, collection);
            };
            case 4: return function(accumulator, value, index, collection) {
              return func.call(context, accumulator, value, index, collection);
            };
          }
          return function() {
            return func.apply(context, arguments);
          };
        };
      
        // A mostly-internal function to generate callbacks that can be applied
        // to each element in a collection, returning the desired result — either
        // identity, an arbitrary callback, a property matcher, or a property accessor.
        var cb = function(value, context, argCount) {
          if (value == null) return _.identity;
          if (_.isFunction(value)) return optimizeCb(value, context, argCount);
          if (_.isObject(value)) return _.matcher(value);
          return _.property(value);
        };
        _.iteratee = function(value, context) {
          return cb(value, context, Infinity);
        };
      
        // An internal function for creating assigner functions.
        var createAssigner = function(keysFunc, undefinedOnly) {
          return function(obj) {
            var length = arguments.length;
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
              var source = arguments[index],
                  keys = keysFunc(source),
                  l = keys.length;
              for (var i = 0; i < l; i++) {
                var key = keys[i];
                if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
              }
            }
            return obj;
          };
        };
      
        // An internal function for creating a new object that inherits from another.
        var baseCreate = function(prototype) {
          if (!_.isObject(prototype)) return {};
          if (nativeCreate) return nativeCreate(prototype);
          Ctor.prototype = prototype;
          var result = new Ctor;
          Ctor.prototype = null;
          return result;
        };
      
        var property = function(key) {
          return function(obj) {
            return obj == null ? void 0 : obj[key];
          };
        };
      
        // Helper for collection methods to determine whether a collection
        // should be iterated as an array or as an object
        // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
        // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
        var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
        var getLength = property('length');
        var isArrayLike = function(collection) {
          var length = getLength(collection);
          return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
        };
      
        // Collection Functions
        // --------------------
      
        // The cornerstone, an `each` implementation, aka `forEach`.
        // Handles raw objects in addition to array-likes. Treats all
        // sparse array-likes as if they were dense.
        _.each = _.forEach = function(obj, iteratee, context) {
          iteratee = optimizeCb(iteratee, context);
          var i, length;
          if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
              iteratee(obj[i], i, obj);
            }
          } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
              iteratee(obj[keys[i]], keys[i], obj);
            }
          }
          return obj;
        };
      
        // Return the results of applying the iteratee to each element.
        _.map = _.collect = function(obj, iteratee, context) {
          iteratee = cb(iteratee, context);
          var keys = !isArrayLike(obj) && _.keys(obj),
              length = (keys || obj).length,
              results = Array(length);
          for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            results[index] = iteratee(obj[currentKey], currentKey, obj);
          }
          return results;
        };
      
        // Create a reducing function iterating left or right.
        function createReduce(dir) {
          // Optimized iterator function as using arguments.length
          // in the main function will deoptimize the, see #1991.
          function iterator(obj, iteratee, memo, keys, index, length) {
            for (; index >= 0 && index < length; index += dir) {
              var currentKey = keys ? keys[index] : index;
              memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
          }
      
          return function(obj, iteratee, memo, context) {
            iteratee = optimizeCb(iteratee, context, 4);
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length,
                index = dir > 0 ? 0 : length - 1;
            // Determine the initial value if none is provided.
            if (arguments.length < 3) {
              memo = obj[keys ? keys[index] : index];
              index += dir;
            }
            return iterator(obj, iteratee, memo, keys, index, length);
          };
        }
      
        // **Reduce** builds up a single result from a list of values, aka `inject`,
        // or `foldl`.
        _.reduce = _.foldl = _.inject = createReduce(1);
      
        // The right-associative version of reduce, also known as `foldr`.
        _.reduceRight = _.foldr = createReduce(-1);
      
        // Return the first value which passes a truth test. Aliased as `detect`.
        _.find = _.detect = function(obj, predicate, context) {
          var key;
          if (isArrayLike(obj)) {
            key = _.findIndex(obj, predicate, context);
          } else {
            key = _.findKey(obj, predicate, context);
          }
          if (key !== void 0 && key !== -1) return obj[key];
        };
      
        // Return all the elements that pass a truth test.
        // Aliased as `select`.
        _.filter = _.select = function(obj, predicate, context) {
          var results = [];
          predicate = cb(predicate, context);
          _.each(obj, function(value, index, list) {
            if (predicate(value, index, list)) results.push(value);
          });
          return results;
        };
      
        // Return all the elements for which a truth test fails.
        _.reject = function(obj, predicate, context) {
          return _.filter(obj, _.negate(cb(predicate)), context);
        };
      
        // Determine whether all of the elements match a truth test.
        // Aliased as `all`.
        _.every = _.all = function(obj, predicate, context) {
          predicate = cb(predicate, context);
          var keys = !isArrayLike(obj) && _.keys(obj),
              length = (keys || obj).length;
          for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return false;
          }
          return true;
        };
      
        // Determine if at least one element in the object matches a truth test.
        // Aliased as `any`.
        _.some = _.any = function(obj, predicate, context) {
          predicate = cb(predicate, context);
          var keys = !isArrayLike(obj) && _.keys(obj),
              length = (keys || obj).length;
          for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return true;
          }
          return false;
        };
      
        // Determine if the array or object contains a given item (using `===`).
        // Aliased as `includes` and `include`.
        _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
          if (!isArrayLike(obj)) obj = _.values(obj);
          if (typeof fromIndex != 'number' || guard) fromIndex = 0;
          return _.indexOf(obj, item, fromIndex) >= 0;
        };
      
        // Invoke a method (with arguments) on every item in a collection.
        _.invoke = function(obj, method) {
          var args = slice.call(arguments, 2);
          var isFunc = _.isFunction(method);
          return _.map(obj, function(value) {
            var func = isFunc ? method : value[method];
            return func == null ? func : func.apply(value, args);
          });
        };
      
        // Convenience version of a common use case of `map`: fetching a property.
        _.pluck = function(obj, key) {
          return _.map(obj, _.property(key));
        };
      
        // Convenience version of a common use case of `filter`: selecting only objects
        // containing specific `key:value` pairs.
        _.where = function(obj, attrs) {
          return _.filter(obj, _.matcher(attrs));
        };
      
        // Convenience version of a common use case of `find`: getting the first object
        // containing specific `key:value` pairs.
        _.findWhere = function(obj, attrs) {
          return _.find(obj, _.matcher(attrs));
        };
      
        // Return the maximum element (or element-based computation).
        _.max = function(obj, iteratee, context) {
          var result = -Infinity, lastComputed = -Infinity,
              value, computed;
          if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
              value = obj[i];
              if (value > result) {
                result = value;
              }
            }
          } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function(value, index, list) {
              computed = iteratee(value, index, list);
              if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                result = value;
                lastComputed = computed;
              }
            });
          }
          return result;
        };
      
        // Return the minimum element (or element-based computation).
        _.min = function(obj, iteratee, context) {
          var result = Infinity, lastComputed = Infinity,
              value, computed;
          if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
              value = obj[i];
              if (value < result) {
                result = value;
              }
            }
          } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function(value, index, list) {
              computed = iteratee(value, index, list);
              if (computed < lastComputed || computed === Infinity && result === Infinity) {
                result = value;
                lastComputed = computed;
              }
            });
          }
          return result;
        };
      
        // Shuffle a collection, using the modern version of the
        // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
        _.shuffle = function(obj) {
          var set = isArrayLike(obj) ? obj : _.values(obj);
          var length = set.length;
          var shuffled = Array(length);
          for (var index = 0, rand; index < length; index++) {
            rand = _.random(0, index);
            if (rand !== index) shuffled[index] = shuffled[rand];
            shuffled[rand] = set[index];
          }
          return shuffled;
        };
      
        // Sample **n** random values from a collection.
        // If **n** is not specified, returns a single random element.
        // The internal `guard` argument allows it to work with `map`.
        _.sample = function(obj, n, guard) {
          if (n == null || guard) {
            if (!isArrayLike(obj)) obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
          }
          return _.shuffle(obj).slice(0, Math.max(0, n));
        };
      
        // Sort the object's values by a criterion produced by an iteratee.
        _.sortBy = function(obj, iteratee, context) {
          iteratee = cb(iteratee, context);
          return _.pluck(_.map(obj, function(value, index, list) {
            return {
              value: value,
              index: index,
              criteria: iteratee(value, index, list)
            };
          }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
              if (a > b || a === void 0) return 1;
              if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
          }), 'value');
        };
      
        // An internal function used for aggregate "group by" operations.
        var group = function(behavior) {
          return function(obj, iteratee, context) {
            var result = {};
            iteratee = cb(iteratee, context);
            _.each(obj, function(value, index) {
              var key = iteratee(value, index, obj);
              behavior(result, value, key);
            });
            return result;
          };
        };
      
        // Groups the object's values by a criterion. Pass either a string attribute
        // to group by, or a function that returns the criterion.
        _.groupBy = group(function(result, value, key) {
          if (_.has(result, key)) result[key].push(value); else result[key] = [value];
        });
      
        // Indexes the object's values by a criterion, similar to `groupBy`, but for
        // when you know that your index values will be unique.
        _.indexBy = group(function(result, value, key) {
          result[key] = value;
        });
      
        // Counts instances of an object that group by a certain criterion. Pass
        // either a string attribute to count by, or a function that returns the
        // criterion.
        _.countBy = group(function(result, value, key) {
          if (_.has(result, key)) result[key]++; else result[key] = 1;
        });
      
        // Safely create a real, live array from anything iterable.
        _.toArray = function(obj) {
          if (!obj) return [];
          if (_.isArray(obj)) return slice.call(obj);
          if (isArrayLike(obj)) return _.map(obj, _.identity);
          return _.values(obj);
        };
      
        // Return the number of elements in an object.
        _.size = function(obj) {
          if (obj == null) return 0;
          return isArrayLike(obj) ? obj.length : _.keys(obj).length;
        };
      
        // Split a collection into two arrays: one whose elements all satisfy the given
        // predicate, and one whose elements all do not satisfy the predicate.
        _.partition = function(obj, predicate, context) {
          predicate = cb(predicate, context);
          var pass = [], fail = [];
          _.each(obj, function(value, key, obj) {
            (predicate(value, key, obj) ? pass : fail).push(value);
          });
          return [pass, fail];
        };
      
        // Array Functions
        // ---------------
      
        // Get the first element of an array. Passing **n** will return the first N
        // values in the array. Aliased as `head` and `take`. The **guard** check
        // allows it to work with `_.map`.
        _.first = _.head = _.take = function(array, n, guard) {
          if (array == null) return void 0;
          if (n == null || guard) return array[0];
          return _.initial(array, array.length - n);
        };
      
        // Returns everything but the last entry of the array. Especially useful on
        // the arguments object. Passing **n** will return all the values in
        // the array, excluding the last N.
        _.initial = function(array, n, guard) {
          return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
        };
      
        // Get the last element of an array. Passing **n** will return the last N
        // values in the array.
        _.last = function(array, n, guard) {
          if (array == null) return void 0;
          if (n == null || guard) return array[array.length - 1];
          return _.rest(array, Math.max(0, array.length - n));
        };
      
        // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
        // Especially useful on the arguments object. Passing an **n** will return
        // the rest N values in the array.
        _.rest = _.tail = _.drop = function(array, n, guard) {
          return slice.call(array, n == null || guard ? 1 : n);
        };
      
        // Trim out all falsy values from an array.
        _.compact = function(array) {
          return _.filter(array, _.identity);
        };
      
        // Internal implementation of a recursive `flatten` function.
        var flatten = function(input, shallow, strict, startIndex) {
          var output = [], idx = 0;
          for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
            var value = input[i];
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
              //flatten current level of array or arguments object
              if (!shallow) value = flatten(value, shallow, strict);
              var j = 0, len = value.length;
              output.length += len;
              while (j < len) {
                output[idx++] = value[j++];
              }
            } else if (!strict) {
              output[idx++] = value;
            }
          }
          return output;
        };
      
        // Flatten out an array, either recursively (by default), or just one level.
        _.flatten = function(array, shallow) {
          return flatten(array, shallow, false);
        };
      
        // Return a version of the array that does not contain the specified value(s).
        _.without = function(array) {
          return _.difference(array, slice.call(arguments, 1));
        };
      
        // Produce a duplicate-free version of the array. If the array has already
        // been sorted, you have the option of using a faster algorithm.
        // Aliased as `unique`.
        _.uniq = _.unique = function(array, isSorted, iteratee, context) {
          if (!_.isBoolean(isSorted)) {
            context = iteratee;
            iteratee = isSorted;
            isSorted = false;
          }
          if (iteratee != null) iteratee = cb(iteratee, context);
          var result = [];
          var seen = [];
          for (var i = 0, length = getLength(array); i < length; i++) {
            var value = array[i],
                computed = iteratee ? iteratee(value, i, array) : value;
            if (isSorted) {
              if (!i || seen !== computed) result.push(value);
              seen = computed;
            } else if (iteratee) {
              if (!_.contains(seen, computed)) {
                seen.push(computed);
                result.push(value);
              }
            } else if (!_.contains(result, value)) {
              result.push(value);
            }
          }
          return result;
        };
      
        // Produce an array that contains the union: each distinct element from all of
        // the passed-in arrays.
        _.union = function() {
          return _.uniq(flatten(arguments, true, true));
        };
      
        // Produce an array that contains every item shared between all the
        // passed-in arrays.
        _.intersection = function(array) {
          var result = [];
          var argsLength = arguments.length;
          for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];
            if (_.contains(result, item)) continue;
            for (var j = 1; j < argsLength; j++) {
              if (!_.contains(arguments[j], item)) break;
            }
            if (j === argsLength) result.push(item);
          }
          return result;
        };
      
        // Take the difference between one array and a number of other arrays.
        // Only the elements present in just the first array will remain.
        _.difference = function(array) {
          var rest = flatten(arguments, true, true, 1);
          return _.filter(array, function(value){
            return !_.contains(rest, value);
          });
        };
      
        // Zip together multiple lists into a single array -- elements that share
        // an index go together.
        _.zip = function() {
          return _.unzip(arguments);
        };
      
        // Complement of _.zip. Unzip accepts an array of arrays and groups
        // each array's elements on shared indices
        _.unzip = function(array) {
          var length = array && _.max(array, getLength).length || 0;
          var result = Array(length);
      
          for (var index = 0; index < length; index++) {
            result[index] = _.pluck(array, index);
          }
          return result;
        };
      
        // Converts lists into objects. Pass either a single array of `[key, value]`
        // pairs, or two parallel arrays of the same length -- one of keys, and one of
        // the corresponding values.
        _.object = function(list, values) {
          var result = {};
          for (var i = 0, length = getLength(list); i < length; i++) {
            if (values) {
              result[list[i]] = values[i];
            } else {
              result[list[i][0]] = list[i][1];
            }
          }
          return result;
        };
      
        // Generator function to create the findIndex and findLastIndex functions
        function createPredicateIndexFinder(dir) {
          return function(array, predicate, context) {
            predicate = cb(predicate, context);
            var length = getLength(array);
            var index = dir > 0 ? 0 : length - 1;
            for (; index >= 0 && index < length; index += dir) {
              if (predicate(array[index], index, array)) return index;
            }
            return -1;
          };
        }
      
        // Returns the first index on an array-like that passes a predicate test
        _.findIndex = createPredicateIndexFinder(1);
        _.findLastIndex = createPredicateIndexFinder(-1);
      
        // Use a comparator function to figure out the smallest index at which
        // an object should be inserted so as to maintain order. Uses binary search.
        _.sortedIndex = function(array, obj, iteratee, context) {
          iteratee = cb(iteratee, context, 1);
          var value = iteratee(obj);
          var low = 0, high = getLength(array);
          while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
          }
          return low;
        };
      
        // Generator function to create the indexOf and lastIndexOf functions
        function createIndexFinder(dir, predicateFind, sortedIndex) {
          return function(array, item, idx) {
            var i = 0, length = getLength(array);
            if (typeof idx == 'number') {
              if (dir > 0) {
                  i = idx >= 0 ? idx : Math.max(idx + length, i);
              } else {
                  length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
              }
            } else if (sortedIndex && idx && length) {
              idx = sortedIndex(array, item);
              return array[idx] === item ? idx : -1;
            }
            if (item !== item) {
              idx = predicateFind(slice.call(array, i, length), _.isNaN);
              return idx >= 0 ? idx + i : -1;
            }
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
              if (array[idx] === item) return idx;
            }
            return -1;
          };
        }
      
        // Return the position of the first occurrence of an item in an array,
        // or -1 if the item is not included in the array.
        // If the array is large and already in sort order, pass `true`
        // for **isSorted** to use binary search.
        _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
        _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
      
        // Generate an integer Array containing an arithmetic progression. A port of
        // the native Python `range()` function. See
        // [the Python documentation](http://docs.python.org/library/functions.html#range).
        _.range = function(start, stop, step) {
          if (stop == null) {
            stop = start || 0;
            start = 0;
          }
          step = step || 1;
      
          var length = Math.max(Math.ceil((stop - start) / step), 0);
          var range = Array(length);
      
          for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
          }
      
          return range;
        };
      
        // Function (ahem) Functions
        // ------------------
      
        // Determines whether to execute a function as a constructor
        // or a normal function with the provided arguments
        var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
          if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
          var self = baseCreate(sourceFunc.prototype);
          var result = sourceFunc.apply(self, args);
          if (_.isObject(result)) return result;
          return self;
        };
      
        // Create a function bound to a given object (assigning `this`, and arguments,
        // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
        // available.
        _.bind = function(func, context) {
          if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
          if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
          var args = slice.call(arguments, 2);
          var bound = function() {
            return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
          };
          return bound;
        };
      
        // Partially apply a function by creating a version that has had some of its
        // arguments pre-filled, without changing its dynamic `this` context. _ acts
        // as a placeholder, allowing any combination of arguments to be pre-filled.
        _.partial = function(func) {
          var boundArgs = slice.call(arguments, 1);
          var bound = function() {
            var position = 0, length = boundArgs.length;
            var args = Array(length);
            for (var i = 0; i < length; i++) {
              args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
            }
            while (position < arguments.length) args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
          };
          return bound;
        };
      
        // Bind a number of an object's methods to that object. Remaining arguments
        // are the method names to be bound. Useful for ensuring that all callbacks
        // defined on an object belong to it.
        _.bindAll = function(obj) {
          var i, length = arguments.length, key;
          if (length <= 1) throw new Error('bindAll must be passed function names');
          for (i = 1; i < length; i++) {
            key = arguments[i];
            obj[key] = _.bind(obj[key], obj);
          }
          return obj;
        };
      
        // Memoize an expensive function by storing its results.
        _.memoize = function(func, hasher) {
          var memoize = function(key) {
            var cache = memoize.cache;
            var address = '' + (hasher ? hasher.apply(this, arguments) : key);
            if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
            return cache[address];
          };
          memoize.cache = {};
          return memoize;
        };
      
        // Delays a function for the given number of milliseconds, and then calls
        // it with the arguments supplied.
        _.delay = function(func, wait) {
          var args = slice.call(arguments, 2);
          return setTimeout(function(){
            return func.apply(null, args);
          }, wait);
        };
      
        // Defers a function, scheduling it to run after the current call stack has
        // cleared.
        _.defer = _.partial(_.delay, _, 1);
      
        // Returns a function, that, when invoked, will only be triggered at most once
        // during a given window of time. Normally, the throttled function will run
        // as much as it can, without ever going more than once per `wait` duration;
        // but if you'd like to disable the execution on the leading edge, pass
        // `{leading: false}`. To disable execution on the trailing edge, ditto.
        _.throttle = function(func, wait, options) {
          var context, args, result;
          var timeout = null;
          var previous = 0;
          if (!options) options = {};
          var later = function() {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          };
          return function() {
            var now = _.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
              if (timeout) {
                clearTimeout(timeout);
                timeout = null;
              }
              previous = now;
              result = func.apply(context, args);
              if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
              timeout = setTimeout(later, remaining);
            }
            return result;
          };
        };
      
        // Returns a function, that, as long as it continues to be invoked, will not
        // be triggered. The function will be called after it stops being called for
        // N milliseconds. If `immediate` is passed, trigger the function on the
        // leading edge, instead of the trailing.
        _.debounce = function(func, wait, immediate) {
          var timeout, args, context, timestamp, result;
      
          var later = function() {
            var last = _.now() - timestamp;
      
            if (last < wait && last >= 0) {
              timeout = setTimeout(later, wait - last);
            } else {
              timeout = null;
              if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
              }
            }
          };
      
          return function() {
            context = this;
            args = arguments;
            timestamp = _.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
              result = func.apply(context, args);
              context = args = null;
            }
      
            return result;
          };
        };
      
        // Returns the first function passed as an argument to the second,
        // allowing you to adjust arguments, run code before and after, and
        // conditionally execute the original function.
        _.wrap = function(func, wrapper) {
          return _.partial(wrapper, func);
        };
      
        // Returns a negated version of the passed-in predicate.
        _.negate = function(predicate) {
          return function() {
            return !predicate.apply(this, arguments);
          };
        };
      
        // Returns a function that is the composition of a list of functions, each
        // consuming the return value of the function that follows.
        _.compose = function() {
          var args = arguments;
          var start = args.length - 1;
          return function() {
            var i = start;
            var result = args[start].apply(this, arguments);
            while (i--) result = args[i].call(this, result);
            return result;
          };
        };
      
        // Returns a function that will only be executed on and after the Nth call.
        _.after = function(times, func) {
          return function() {
            if (--times < 1) {
              return func.apply(this, arguments);
            }
          };
        };
      
        // Returns a function that will only be executed up to (but not including) the Nth call.
        _.before = function(times, func) {
          var memo;
          return function() {
            if (--times > 0) {
              memo = func.apply(this, arguments);
            }
            if (times <= 1) func = null;
            return memo;
          };
        };
      
        // Returns a function that will be executed at most one time, no matter how
        // often you call it. Useful for lazy initialization.
        _.once = _.partial(_.before, 2);
      
        // Object Functions
        // ----------------
      
        // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
        var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
        var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                            'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
      
        function collectNonEnumProps(obj, keys) {
          var nonEnumIdx = nonEnumerableProps.length;
          var constructor = obj.constructor;
          var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;
      
          // Constructor is a special case.
          var prop = 'constructor';
          if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);
      
          while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
              keys.push(prop);
            }
          }
        }
      
        // Retrieve the names of an object's own properties.
        // Delegates to **ECMAScript 5**'s native `Object.keys`
        _.keys = function(obj) {
          if (!_.isObject(obj)) return [];
          if (nativeKeys) return nativeKeys(obj);
          var keys = [];
          for (var key in obj) if (_.has(obj, key)) keys.push(key);
          // Ahem, IE < 9.
          if (hasEnumBug) collectNonEnumProps(obj, keys);
          return keys;
        };
      
        // Retrieve all the property names of an object.
        _.allKeys = function(obj) {
          if (!_.isObject(obj)) return [];
          var keys = [];
          for (var key in obj) keys.push(key);
          // Ahem, IE < 9.
          if (hasEnumBug) collectNonEnumProps(obj, keys);
          return keys;
        };
      
        // Retrieve the values of an object's properties.
        _.values = function(obj) {
          var keys = _.keys(obj);
          var length = keys.length;
          var values = Array(length);
          for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
          }
          return values;
        };
      
        // Returns the results of applying the iteratee to each element of the object
        // In contrast to _.map it returns an object
        _.mapObject = function(obj, iteratee, context) {
          iteratee = cb(iteratee, context);
          var keys =  _.keys(obj),
                length = keys.length,
                results = {},
                currentKey;
            for (var index = 0; index < length; index++) {
              currentKey = keys[index];
              results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
            }
            return results;
        };
      
        // Convert an object into a list of `[key, value]` pairs.
        _.pairs = function(obj) {
          var keys = _.keys(obj);
          var length = keys.length;
          var pairs = Array(length);
          for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
          }
          return pairs;
        };
      
        // Invert the keys and values of an object. The values must be serializable.
        _.invert = function(obj) {
          var result = {};
          var keys = _.keys(obj);
          for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
          }
          return result;
        };
      
        // Return a sorted list of the function names available on the object.
        // Aliased as `methods`
        _.functions = _.methods = function(obj) {
          var names = [];
          for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
          }
          return names.sort();
        };
      
        // Extend a given object with all the properties in passed-in object(s).
        _.extend = createAssigner(_.allKeys);
      
        // Assigns a given object with all the own properties in the passed-in object(s)
        // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
        _.extendOwn = _.assign = createAssigner(_.keys);
      
        // Returns the first key on an object that passes a predicate test
        _.findKey = function(obj, predicate, context) {
          predicate = cb(predicate, context);
          var keys = _.keys(obj), key;
          for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj)) return key;
          }
        };
      
        // Return a copy of the object only containing the whitelisted properties.
        _.pick = function(object, oiteratee, context) {
          var result = {}, obj = object, iteratee, keys;
          if (obj == null) return result;
          if (_.isFunction(oiteratee)) {
            keys = _.allKeys(obj);
            iteratee = optimizeCb(oiteratee, context);
          } else {
            keys = flatten(arguments, false, false, 1);
            iteratee = function(value, key, obj) { return key in obj; };
            obj = Object(obj);
          }
          for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj)) result[key] = value;
          }
          return result;
        };
      
         // Return a copy of the object without the blacklisted properties.
        _.omit = function(obj, iteratee, context) {
          if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
          } else {
            var keys = _.map(flatten(arguments, false, false, 1), String);
            iteratee = function(value, key) {
              return !_.contains(keys, key);
            };
          }
          return _.pick(obj, iteratee, context);
        };
      
        // Fill in a given object with default properties.
        _.defaults = createAssigner(_.allKeys, true);
      
        // Creates an object that inherits from the given prototype object.
        // If additional properties are provided then they will be added to the
        // created object.
        _.create = function(prototype, props) {
          var result = baseCreate(prototype);
          if (props) _.extendOwn(result, props);
          return result;
        };
      
        // Create a (shallow-cloned) duplicate of an object.
        _.clone = function(obj) {
          if (!_.isObject(obj)) return obj;
          return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
        };
      
        // Invokes interceptor with the obj, and then returns obj.
        // The primary purpose of this method is to "tap into" a method chain, in
        // order to perform operations on intermediate results within the chain.
        _.tap = function(obj, interceptor) {
          interceptor(obj);
          return obj;
        };
      
        // Returns whether an object has a given set of `key:value` pairs.
        _.isMatch = function(object, attrs) {
          var keys = _.keys(attrs), length = keys.length;
          if (object == null) return !length;
          var obj = Object(object);
          for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
          }
          return true;
        };
      
      
        // Internal recursive comparison function for `isEqual`.
        var eq = function(a, b, aStack, bStack) {
          // Identical objects are equal. `0 === -0`, but they aren't identical.
          // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
          if (a === b) return a !== 0 || 1 / a === 1 / b;
          // A strict comparison is necessary because `null == undefined`.
          if (a == null || b == null) return a === b;
          // Unwrap any wrapped objects.
          if (a instanceof _) a = a._wrapped;
          if (b instanceof _) b = b._wrapped;
          // Compare `[[Class]]` names.
          var className = toString.call(a);
          if (className !== toString.call(b)) return false;
          switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
            // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
              // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
              // equivalent to `new String("5")`.
              return '' + a === '' + b;
            case '[object Number]':
              // `NaN`s are equivalent, but non-reflexive.
              // Object(NaN) is equivalent to NaN
              if (+a !== +a) return +b !== +b;
              // An `egal` comparison is performed for other numeric values.
              return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
              // Coerce dates and booleans to numeric primitive values. Dates are compared by their
              // millisecond representations. Note that invalid dates with millisecond representations
              // of `NaN` are not equivalent.
              return +a === +b;
          }
      
          var areArrays = className === '[object Array]';
          if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;
      
            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                                     _.isFunction(bCtor) && bCtor instanceof bCtor)
                                && ('constructor' in a && 'constructor' in b)) {
              return false;
            }
          }
          // Assume equality for cyclic structures. The algorithm for detecting cyclic
          // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
      
          // Initializing stack of traversed objects.
          // It's done here since we only need them for objects and arrays comparison.
          aStack = aStack || [];
          bStack = bStack || [];
          var length = aStack.length;
          while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
          }
      
          // Add the first object to the stack of traversed objects.
          aStack.push(a);
          bStack.push(b);
      
          // Recursively compare objects and arrays.
          if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
              if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
          } else {
            // Deep compare objects.
            var keys = _.keys(a), key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (_.keys(b).length !== length) return false;
            while (length--) {
              // Deep compare each member
              key = keys[length];
              if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
            }
          }
          // Remove the first object from the stack of traversed objects.
          aStack.pop();
          bStack.pop();
          return true;
        };
      
        // Perform a deep comparison to check if two objects are equal.
        _.isEqual = function(a, b) {
          return eq(a, b);
        };
      
        // Is a given array, string, or object empty?
        // An "empty" object has no enumerable own-properties.
        _.isEmpty = function(obj) {
          if (obj == null) return true;
          if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
          return _.keys(obj).length === 0;
        };
      
        // Is a given value a DOM element?
        _.isElement = function(obj) {
          return !!(obj && obj.nodeType === 1);
        };
      
        // Is a given value an array?
        // Delegates to ECMA5's native Array.isArray
        _.isArray = nativeIsArray || function(obj) {
          return toString.call(obj) === '[object Array]';
        };
      
        // Is a given variable an object?
        _.isObject = function(obj) {
          var type = typeof obj;
          return type === 'function' || type === 'object' && !!obj;
        };
      
        // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
        _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
          _['is' + name] = function(obj) {
            return toString.call(obj) === '[object ' + name + ']';
          };
        });
      
        // Define a fallback version of the method in browsers (ahem, IE < 9), where
        // there isn't any inspectable "Arguments" type.
        if (!_.isArguments(arguments)) {
          _.isArguments = function(obj) {
            return _.has(obj, 'callee');
          };
        }
      
        // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
        // IE 11 (#1621), and in Safari 8 (#1929).
        if (typeof /./ != 'function' && typeof Int8Array != 'object') {
          _.isFunction = function(obj) {
            return typeof obj == 'function' || false;
          };
        }
      
        // Is a given object a finite number?
        _.isFinite = function(obj) {
          return isFinite(obj) && !isNaN(parseFloat(obj));
        };
      
        // Is the given value `NaN`? (NaN is the only number which does not equal itself).
        _.isNaN = function(obj) {
          return _.isNumber(obj) && obj !== +obj;
        };
      
        // Is a given value a boolean?
        _.isBoolean = function(obj) {
          return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
        };
      
        // Is a given value equal to null?
        _.isNull = function(obj) {
          return obj === null;
        };
      
        // Is a given variable undefined?
        _.isUndefined = function(obj) {
          return obj === void 0;
        };
      
        // Shortcut function for checking if an object has a given property directly
        // on itself (in other words, not on a prototype).
        _.has = function(obj, key) {
          return obj != null && hasOwnProperty.call(obj, key);
        };
      
        // Utility Functions
        // -----------------
      
        // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
        // previous owner. Returns a reference to the Underscore object.
        _.noConflict = function() {
          root._ = previousUnderscore;
          return this;
        };
      
        // Keep the identity function around for default iteratees.
        _.identity = function(value) {
          return value;
        };
      
        // Predicate-generating functions. Often useful outside of Underscore.
        _.constant = function(value) {
          return function() {
            return value;
          };
        };
      
        _.noop = function(){};
      
        _.property = property;
      
        // Generates a function for a given object that returns a given property.
        _.propertyOf = function(obj) {
          return obj == null ? function(){} : function(key) {
            return obj[key];
          };
        };
      
        // Returns a predicate for checking whether an object has a given set of
        // `key:value` pairs.
        _.matcher = _.matches = function(attrs) {
          attrs = _.extendOwn({}, attrs);
          return function(obj) {
            return _.isMatch(obj, attrs);
          };
        };
      
        // Run a function **n** times.
        _.times = function(n, iteratee, context) {
          var accum = Array(Math.max(0, n));
          iteratee = optimizeCb(iteratee, context, 1);
          for (var i = 0; i < n; i++) accum[i] = iteratee(i);
          return accum;
        };
      
        // Return a random integer between min and max (inclusive).
        _.random = function(min, max) {
          if (max == null) {
            max = min;
            min = 0;
          }
          return min + Math.floor(Math.random() * (max - min + 1));
        };
      
        // A (possibly faster) way to get the current timestamp as an integer.
        _.now = Date.now || function() {
          return new Date().getTime();
        };
      
         // List of HTML entities for escaping.
        var escapeMap = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '`': '&#x60;'
        };
        var unescapeMap = _.invert(escapeMap);
      
        // Functions for escaping and unescaping strings to/from HTML interpolation.
        var createEscaper = function(map) {
          var escaper = function(match) {
            return map[match];
          };
          // Regexes for identifying a key that needs to be escaped
          var source = '(?:' + _.keys(map).join('|') + ')';
          var testRegexp = RegExp(source);
          var replaceRegexp = RegExp(source, 'g');
          return function(string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
          };
        };
        _.escape = createEscaper(escapeMap);
        _.unescape = createEscaper(unescapeMap);
      
        // If the value of the named `property` is a function then invoke it with the
        // `object` as context; otherwise, return it.
        _.result = function(object, property, fallback) {
          var value = object == null ? void 0 : object[property];
          if (value === void 0) {
            value = fallback;
          }
          return _.isFunction(value) ? value.call(object) : value;
        };
      
        // Generate a unique integer id (unique within the entire client session).
        // Useful for temporary DOM ids.
        var idCounter = 0;
        _.uniqueId = function(prefix) {
          var id = ++idCounter + '';
          return prefix ? prefix + id : id;
        };
      
        // By default, Underscore uses ERB-style template delimiters, change the
        // following template settings to use alternative delimiters.
        _.templateSettings = {
          evaluate    : /<%([\s\S]+?)%>/g,
          interpolate : /<%=([\s\S]+?)%>/g,
          escape      : /<%-([\s\S]+?)%>/g
        };
      
        // When customizing `templateSettings`, if you don't want to define an
        // interpolation, evaluation or escaping regex, we need one that is
        // guaranteed not to match.
        var noMatch = /(.)^/;
      
        // Certain characters need to be escaped so that they can be put into a
        // string literal.
        var escapes = {
          "'":      "'",
          '\\':     '\\',
          '\r':     'r',
          '\n':     'n',
          '\u2028': 'u2028',
          '\u2029': 'u2029'
        };
      
        var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
      
        var escapeChar = function(match) {
          return '\\' + escapes[match];
        };
      
        // JavaScript micro-templating, similar to John Resig's implementation.
        // Underscore templating handles arbitrary delimiters, preserves whitespace,
        // and correctly escapes quotes within interpolated code.
        // NB: `oldSettings` only exists for backwards compatibility.
        _.template = function(text, settings, oldSettings) {
          if (!settings && oldSettings) settings = oldSettings;
          settings = _.defaults({}, settings, _.templateSettings);
      
          // Combine delimiters into one regular expression via alternation.
          var matcher = RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
          ].join('|') + '|$', 'g');
      
          // Compile the template source, escaping string literals appropriately.
          var index = 0;
          var source = "__p+='";
          text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;
      
            if (escape) {
              source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
              source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
              source += "';\n" + evaluate + "\n__p+='";
            }
      
            // Adobe VMs need the match returned to produce the correct offest.
            return match;
          });
          source += "';\n";
      
          // If a variable is not specified, place data values in local scope.
          if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
      
          source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + 'return __p;\n';
      
          try {
            var render = new Function(settings.variable || 'obj', '_', source);
          } catch (e) {
            e.source = source;
            throw e;
          }
      
          var template = function(data) {
            return render.call(this, data, _);
          };
      
          // Provide the compiled source as a convenience for precompilation.
          var argument = settings.variable || 'obj';
          template.source = 'function(' + argument + '){\n' + source + '}';
      
          return template;
        };
      
        // Add a "chain" function. Start chaining a wrapped Underscore object.
        _.chain = function(obj) {
          var instance = _(obj);
          instance._chain = true;
          return instance;
        };
      
        // OOP
        // ---------------
        // If Underscore is called as a function, it returns a wrapped object that
        // can be used OO-style. This wrapper holds altered versions of all the
        // underscore functions. Wrapped objects may be chained.
      
        // Helper function to continue chaining intermediate results.
        var result = function(instance, obj) {
          return instance._chain ? _(obj).chain() : obj;
        };
      
        // Add your own custom functions to the Underscore object.
        _.mixin = function(obj) {
          _.each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
              var args = [this._wrapped];
              push.apply(args, arguments);
              return result(this, func.apply(_, args));
            };
          });
        };
      
        // Add all of the Underscore functions to the wrapper object.
        _.mixin(_);
      
        // Add all mutator Array functions to the wrapper.
        _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
          var method = ArrayProto[name];
          _.prototype[name] = function() {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
            return result(this, obj);
          };
        });
      
        // Add all accessor Array functions to the wrapper.
        _.each(['concat', 'join', 'slice'], function(name) {
          var method = ArrayProto[name];
          _.prototype[name] = function() {
            return result(this, method.apply(this._wrapped, arguments));
          };
        });
      
        // Extracts the result from a wrapped and chained object.
        _.prototype.value = function() {
          return this._wrapped;
        };
      
        // Provide unwrapping proxy for some methods used in engine operations
        // such as arithmetic and JSON stringification.
        _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
      
        _.prototype.toString = function() {
          return '' + this._wrapped;
        };
      
        // AMD registration happens at the end for compatibility with AMD loaders
        // that may not enforce next-turn semantics on modules. Even though general
        // practice for AMD registration is to be anonymous, underscore registers
        // as a named module because, like jQuery, it is a base library that is
        // popular enough to be bundled in a third party lib, but not be part of
        // an AMD load request. Those cases could generate an error when an
        // anonymous define() is called outside of a loader request.
        if (typeof define === 'function' && define.amd) {
          define('underscore', [], function() {
            return _;
          });
        }
      }.call(this));
      
    },
    'underscore-min': function (module, exports, require, global) {
      //     Underscore.js 1.8.3
      //     http://underscorejs.org
      //     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
      //     Underscore may be freely distributed under the MIT license.
      (function(){function n(n){function t(t,r,e,u,i,o){for(;i>=0&&o>i;i+=n){var a=u?u[i]:i;e=r(e,t[a],a,t)}return e}return function(r,e,u,i){e=b(e,i,4);var o=!k(r)&&m.keys(r),a=(o||r).length,c=n>0?0:a-1;return arguments.length<3&&(u=r[o?o[c]:c],c+=n),t(r,e,u,o,c,a)}}function t(n){return function(t,r,e){r=x(r,e);for(var u=O(t),i=n>0?0:u-1;i>=0&&u>i;i+=n)if(r(t[i],i,t))return i;return-1}}function r(n,t,r){return function(e,u,i){var o=0,a=O(e);if("number"==typeof i)n>0?o=i>=0?i:Math.max(i+a,o):a=i>=0?Math.min(i+1,a):i+a+1;else if(r&&i&&a)return i=r(e,u),e[i]===u?i:-1;if(u!==u)return i=t(l.call(e,o,a),m.isNaN),i>=0?i+o:-1;for(i=n>0?o:a-1;i>=0&&a>i;i+=n)if(e[i]===u)return i;return-1}}function e(n,t){var r=I.length,e=n.constructor,u=m.isFunction(e)&&e.prototype||a,i="constructor";for(m.has(n,i)&&!m.contains(t,i)&&t.push(i);r--;)i=I[r],i in n&&n[i]!==u[i]&&!m.contains(t,i)&&t.push(i)}var u=this,i=u._,o=Array.prototype,a=Object.prototype,c=Function.prototype,f=o.push,l=o.slice,s=a.toString,p=a.hasOwnProperty,h=Array.isArray,v=Object.keys,g=c.bind,y=Object.create,d=function(){},m=function(n){return n instanceof m?n:this instanceof m?void(this._wrapped=n):new m(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=m),exports._=m):u._=m,m.VERSION="1.8.3";var b=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}},x=function(n,t,r){return null==n?m.identity:m.isFunction(n)?b(n,t,r):m.isObject(n)?m.matcher(n):m.property(n)};m.iteratee=function(n,t){return x(n,t,1/0)};var _=function(n,t){return function(r){var e=arguments.length;if(2>e||null==r)return r;for(var u=1;e>u;u++)for(var i=arguments[u],o=n(i),a=o.length,c=0;a>c;c++){var f=o[c];t&&r[f]!==void 0||(r[f]=i[f])}return r}},j=function(n){if(!m.isObject(n))return{};if(y)return y(n);d.prototype=n;var t=new d;return d.prototype=null,t},w=function(n){return function(t){return null==t?void 0:t[n]}},A=Math.pow(2,53)-1,O=w("length"),k=function(n){var t=O(n);return"number"==typeof t&&t>=0&&A>=t};m.each=m.forEach=function(n,t,r){t=b(t,r);var e,u;if(k(n))for(e=0,u=n.length;u>e;e++)t(n[e],e,n);else{var i=m.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},m.map=m.collect=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=Array(u),o=0;u>o;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},m.reduce=m.foldl=m.inject=n(1),m.reduceRight=m.foldr=n(-1),m.find=m.detect=function(n,t,r){var e;return e=k(n)?m.findIndex(n,t,r):m.findKey(n,t,r),e!==void 0&&e!==-1?n[e]:void 0},m.filter=m.select=function(n,t,r){var e=[];return t=x(t,r),m.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e},m.reject=function(n,t,r){return m.filter(n,m.negate(x(t)),r)},m.every=m.all=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},m.some=m.any=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},m.contains=m.includes=m.include=function(n,t,r,e){return k(n)||(n=m.values(n)),("number"!=typeof r||e)&&(r=0),m.indexOf(n,t,r)>=0},m.invoke=function(n,t){var r=l.call(arguments,2),e=m.isFunction(t);return m.map(n,function(n){var u=e?t:n[t];return null==u?u:u.apply(n,r)})},m.pluck=function(n,t){return m.map(n,m.property(t))},m.where=function(n,t){return m.filter(n,m.matcher(t))},m.findWhere=function(n,t){return m.find(n,m.matcher(t))},m.max=function(n,t,r){var e,u,i=-1/0,o=-1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],e>i&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(u>o||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},m.min=function(n,t,r){var e,u,i=1/0,o=1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],i>e&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(o>u||1/0===u&&1/0===i)&&(i=n,o=u)});return i},m.shuffle=function(n){for(var t,r=k(n)?n:m.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=m.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},m.sample=function(n,t,r){return null==t||r?(k(n)||(n=m.values(n)),n[m.random(n.length-1)]):m.shuffle(n).slice(0,Math.max(0,t))},m.sortBy=function(n,t,r){return t=x(t,r),m.pluck(m.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=x(r,e),m.each(t,function(e,i){var o=r(e,i,t);n(u,e,o)}),u}};m.groupBy=F(function(n,t,r){m.has(n,r)?n[r].push(t):n[r]=[t]}),m.indexBy=F(function(n,t,r){n[r]=t}),m.countBy=F(function(n,t,r){m.has(n,r)?n[r]++:n[r]=1}),m.toArray=function(n){return n?m.isArray(n)?l.call(n):k(n)?m.map(n,m.identity):m.values(n):[]},m.size=function(n){return null==n?0:k(n)?n.length:m.keys(n).length},m.partition=function(n,t,r){t=x(t,r);var e=[],u=[];return m.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},m.first=m.head=m.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:m.initial(n,n.length-t)},m.initial=function(n,t,r){return l.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},m.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:m.rest(n,Math.max(0,n.length-t))},m.rest=m.tail=m.drop=function(n,t,r){return l.call(n,null==t||r?1:t)},m.compact=function(n){return m.filter(n,m.identity)};var S=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=O(n);a>o;o++){var c=n[o];if(k(c)&&(m.isArray(c)||m.isArguments(c))){t||(c=S(c,t,r));var f=0,l=c.length;for(u.length+=l;l>f;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};m.flatten=function(n,t){return S(n,t,!1)},m.without=function(n){return m.difference(n,l.call(arguments,1))},m.uniq=m.unique=function(n,t,r,e){m.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=x(r,e));for(var u=[],i=[],o=0,a=O(n);a>o;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?m.contains(i,f)||(i.push(f),u.push(c)):m.contains(u,c)||u.push(c)}return u},m.union=function(){return m.uniq(S(arguments,!0,!0))},m.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=O(n);u>e;e++){var i=n[e];if(!m.contains(t,i)){for(var o=1;r>o&&m.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},m.difference=function(n){var t=S(arguments,!0,!0,1);return m.filter(n,function(n){return!m.contains(t,n)})},m.zip=function(){return m.unzip(arguments)},m.unzip=function(n){for(var t=n&&m.max(n,O).length||0,r=Array(t),e=0;t>e;e++)r[e]=m.pluck(n,e);return r},m.object=function(n,t){for(var r={},e=0,u=O(n);u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},m.findIndex=t(1),m.findLastIndex=t(-1),m.sortedIndex=function(n,t,r,e){r=x(r,e,1);for(var u=r(t),i=0,o=O(n);o>i;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},m.indexOf=r(1,m.findIndex,m.sortedIndex),m.lastIndexOf=r(-1,m.findLastIndex),m.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var E=function(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=j(n.prototype),o=n.apply(i,u);return m.isObject(o)?o:i};m.bind=function(n,t){if(g&&n.bind===g)return g.apply(n,l.call(arguments,1));if(!m.isFunction(n))throw new TypeError("Bind must be called on a function");var r=l.call(arguments,2),e=function(){return E(n,e,t,this,r.concat(l.call(arguments)))};return e},m.partial=function(n){var t=l.call(arguments,1),r=function(){for(var e=0,u=t.length,i=Array(u),o=0;u>o;o++)i[o]=t[o]===m?arguments[e++]:t[o];for(;e<arguments.length;)i.push(arguments[e++]);return E(n,r,this,this,i)};return r},m.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=m.bind(n[r],n);return n},m.memoize=function(n,t){var r=function(e){var u=r.cache,i=""+(t?t.apply(this,arguments):e);return m.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},m.delay=function(n,t){var r=l.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},m.defer=m.partial(m.delay,m,1),m.throttle=function(n,t,r){var e,u,i,o=null,a=0;r||(r={});var c=function(){a=r.leading===!1?0:m.now(),o=null,i=n.apply(e,u),o||(e=u=null)};return function(){var f=m.now();a||r.leading!==!1||(a=f);var l=t-(f-a);return e=this,u=arguments,0>=l||l>t?(o&&(clearTimeout(o),o=null),a=f,i=n.apply(e,u),o||(e=u=null)):o||r.trailing===!1||(o=setTimeout(c,l)),i}},m.debounce=function(n,t,r){var e,u,i,o,a,c=function(){var f=m.now()-o;t>f&&f>=0?e=setTimeout(c,t-f):(e=null,r||(a=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,o=m.now();var f=r&&!e;return e||(e=setTimeout(c,t)),f&&(a=n.apply(i,u),i=u=null),a}},m.wrap=function(n,t){return m.partial(t,n)},m.negate=function(n){return function(){return!n.apply(this,arguments)}},m.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},m.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},m.before=function(n,t){var r;return function(){return--n>0&&(r=t.apply(this,arguments)),1>=n&&(t=null),r}},m.once=m.partial(m.before,2);var M=!{toString:null}.propertyIsEnumerable("toString"),I=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];m.keys=function(n){if(!m.isObject(n))return[];if(v)return v(n);var t=[];for(var r in n)m.has(n,r)&&t.push(r);return M&&e(n,t),t},m.allKeys=function(n){if(!m.isObject(n))return[];var t=[];for(var r in n)t.push(r);return M&&e(n,t),t},m.values=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},m.mapObject=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=u.length,o={},a=0;i>a;a++)e=u[a],o[e]=t(n[e],e,n);return o},m.pairs=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},m.invert=function(n){for(var t={},r=m.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},m.functions=m.methods=function(n){var t=[];for(var r in n)m.isFunction(n[r])&&t.push(r);return t.sort()},m.extend=_(m.allKeys),m.extendOwn=m.assign=_(m.keys),m.findKey=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=0,o=u.length;o>i;i++)if(e=u[i],t(n[e],e,n))return e},m.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;m.isFunction(t)?(u=m.allKeys(o),e=b(t,r)):(u=S(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;c>a;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},m.omit=function(n,t,r){if(m.isFunction(t))t=m.negate(t);else{var e=m.map(S(arguments,!1,!1,1),String);t=function(n,t){return!m.contains(e,t)}}return m.pick(n,t,r)},m.defaults=_(m.allKeys,!0),m.create=function(n,t){var r=j(n);return t&&m.extendOwn(r,t),r},m.clone=function(n){return m.isObject(n)?m.isArray(n)?n.slice():m.extend({},n):n},m.tap=function(n,t){return t(n),n},m.isMatch=function(n,t){var r=m.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;e>i;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof m&&(n=n._wrapped),t instanceof m&&(t=t._wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(m.isFunction(o)&&o instanceof o&&m.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}r=r||[],e=e||[];for(var c=r.length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if(c=n.length,c!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=m.keys(n);if(c=l.length,m.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!m.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};m.isEqual=function(n,t){return N(n,t)},m.isEmpty=function(n){return null==n?!0:k(n)&&(m.isArray(n)||m.isString(n)||m.isArguments(n))?0===n.length:0===m.keys(n).length},m.isElement=function(n){return!(!n||1!==n.nodeType)},m.isArray=h||function(n){return"[object Array]"===s.call(n)},m.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},m.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(n){m["is"+n]=function(t){return s.call(t)==="[object "+n+"]"}}),m.isArguments(arguments)||(m.isArguments=function(n){return m.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(m.isFunction=function(n){return"function"==typeof n||!1}),m.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},m.isNaN=function(n){return m.isNumber(n)&&n!==+n},m.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===s.call(n)},m.isNull=function(n){return null===n},m.isUndefined=function(n){return n===void 0},m.has=function(n,t){return null!=n&&p.call(n,t)},m.noConflict=function(){return u._=i,this},m.identity=function(n){return n},m.constant=function(n){return function(){return n}},m.noop=function(){},m.property=w,m.propertyOf=function(n){return null==n?function(){}:function(t){return n[t]}},m.matcher=m.matches=function(n){return n=m.extendOwn({},n),function(t){return m.isMatch(t,n)}},m.times=function(n,t,r){var e=Array(Math.max(0,n));t=b(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},m.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},m.now=Date.now||function(){return(new Date).getTime()};var B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=m.invert(B),R=function(n){var t=function(t){return n[t]},r="(?:"+m.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};m.escape=R(B),m.unescape=R(T),m.result=function(n,t,r){var e=null==n?void 0:n[t];return e===void 0&&(e=r),m.isFunction(e)?e.call(n):e};var q=0;m.uniqueId=function(n){var t=++q+"";return n?n+t:t},m.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var K=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\u2028|\u2029/g,L=function(n){return"\\"+z[n]};m.template=function(n,t,r){!t&&r&&(t=r),t=m.defaults({},t,m.templateSettings);var e=RegExp([(t.escape||K).source,(t.interpolate||K).source,(t.evaluate||K).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,o,a){return i+=n.slice(u,a).replace(D,L),u=a+t.length,r?i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":o&&(i+="';\n"+o+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var o=new Function(t.variable||"obj","_",i)}catch(a){throw a.source=i,a}var c=function(n){return o.call(this,n,m)},f=t.variable||"obj";return c.source="function("+f+"){\n"+i+"}",c},m.chain=function(n){var t=m(n);return t._chain=!0,t};var P=function(n,t){return n._chain?m(t).chain():t};m.mixin=function(n){m.each(m.functions(n),function(t){var r=m[t]=n[t];m.prototype[t]=function(){var n=[this._wrapped];return f.apply(n,arguments),P(this,r.apply(m,n))}})},m.mixin(m),m.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=o[n];m.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],P(this,r)}}),m.each(["concat","join","slice"],function(n){var t=o[n];m.prototype[n]=function(){return P(this,t.apply(this._wrapped,arguments))}}),m.prototype.value=function(){return this._wrapped},m.prototype.valueOf=m.prototype.toJSON=m.prototype.value,m.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return m})}).call(this);
      //# sourceMappingURL=underscore-min.map
    }
  }, 'underscore');

  Module.createPackage('sizzle', {
    'dist/sizzle': function (module, exports, require, global) {
      /*!
       * Sizzle CSS Selector Engine v2.3.0
       * https://sizzlejs.com/
       *
       * Copyright jQuery Foundation and other contributors
       * Released under the MIT license
       * http://jquery.org/license
       *
       * Date: 2016-01-04
       */
      (function( window ) {
      
      var i,
      	support,
      	Expr,
      	getText,
      	isXML,
      	tokenize,
      	compile,
      	select,
      	outermostContext,
      	sortInput,
      	hasDuplicate,
      
      	// Local document vars
      	setDocument,
      	document,
      	docElem,
      	documentIsHTML,
      	rbuggyQSA,
      	rbuggyMatches,
      	matches,
      	contains,
      
      	// Instance-specific data
      	expando = "sizzle" + 1 * new Date(),
      	preferredDoc = window.document,
      	dirruns = 0,
      	done = 0,
      	classCache = createCache(),
      	tokenCache = createCache(),
      	compilerCache = createCache(),
      	sortOrder = function( a, b ) {
      		if ( a === b ) {
      			hasDuplicate = true;
      		}
      		return 0;
      	},
      
      	// Instance methods
      	hasOwn = ({}).hasOwnProperty,
      	arr = [],
      	pop = arr.pop,
      	push_native = arr.push,
      	push = arr.push,
      	slice = arr.slice,
      	// Use a stripped-down indexOf as it's faster than native
      	// https://jsperf.com/thor-indexof-vs-for/5
      	indexOf = function( list, elem ) {
      		var i = 0,
      			len = list.length;
      		for ( ; i < len; i++ ) {
      			if ( list[i] === elem ) {
      				return i;
      			}
      		}
      		return -1;
      	},
      
      	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
      
      	// Regular expressions
      
      	// http://www.w3.org/TR/css3-selectors/#whitespace
      	whitespace = "[\\x20\\t\\r\\n\\f]",
      
      	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
      	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",
      
      	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
      	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
      		// Operator (capture 2)
      		"*([*^$|!~]?=)" + whitespace +
      		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
      		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
      		"*\\]",
      
      	pseudos = ":(" + identifier + ")(?:\\((" +
      		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
      		// 1. quoted (capture 3; capture 4 or capture 5)
      		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
      		// 2. simple (capture 6)
      		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
      		// 3. anything else (capture 2)
      		".*" +
      		")\\)|)",
      
      	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
      	rwhitespace = new RegExp( whitespace + "+", "g" ),
      	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),
      
      	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
      	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
      
      	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),
      
      	rpseudo = new RegExp( pseudos ),
      	ridentifier = new RegExp( "^" + identifier + "$" ),
      
      	matchExpr = {
      		"ID": new RegExp( "^#(" + identifier + ")" ),
      		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
      		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
      		"ATTR": new RegExp( "^" + attributes ),
      		"PSEUDO": new RegExp( "^" + pseudos ),
      		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
      			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
      			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
      		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
      		// For use in libraries implementing .is()
      		// We use this for POS matching in `select`
      		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
      			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
      	},
      
      	rinputs = /^(?:input|select|textarea|button)$/i,
      	rheader = /^h\d$/i,
      
      	rnative = /^[^{]+\{\s*\[native \w/,
      
      	// Easily-parseable/retrievable ID or TAG or CLASS selectors
      	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
      
      	rsibling = /[+~]/,
      
      	// CSS escapes
      	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
      	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
      	funescape = function( _, escaped, escapedWhitespace ) {
      		var high = "0x" + escaped - 0x10000;
      		// NaN means non-codepoint
      		// Support: Firefox<24
      		// Workaround erroneous numeric interpretation of +"0x"
      		return high !== high || escapedWhitespace ?
      			escaped :
      			high < 0 ?
      				// BMP codepoint
      				String.fromCharCode( high + 0x10000 ) :
      				// Supplemental Plane codepoint (surrogate pair)
      				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
      	},
      
      	// CSS string/identifier serialization
      	// https://drafts.csswg.org/cssom/#common-serializing-idioms
      	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g,
      	fcssescape = function( ch, asCodePoint ) {
      		if ( asCodePoint ) {
      
      			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
      			if ( ch === "\0" ) {
      				return "\uFFFD";
      			}
      
      			// Control characters and (dependent upon position) numbers get escaped as code points
      			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
      		}
      
      		// Other potentially-special ASCII characters get backslash-escaped
      		return "\\" + ch;
      	},
      
      	// Used for iframes
      	// See setDocument()
      	// Removing the function wrapper causes a "Permission Denied"
      	// error in IE
      	unloadHandler = function() {
      		setDocument();
      	},
      
      	disabledAncestor = addCombinator(
      		function( elem ) {
      			return elem.disabled === true;
      		},
      		{ dir: "parentNode", next: "legend" }
      	);
      
      // Optimize for push.apply( _, NodeList )
      try {
      	push.apply(
      		(arr = slice.call( preferredDoc.childNodes )),
      		preferredDoc.childNodes
      	);
      	// Support: Android<4.0
      	// Detect silently failing push.apply
      	arr[ preferredDoc.childNodes.length ].nodeType;
      } catch ( e ) {
      	push = { apply: arr.length ?
      
      		// Leverage slice if possible
      		function( target, els ) {
      			push_native.apply( target, slice.call(els) );
      		} :
      
      		// Support: IE<9
      		// Otherwise append directly
      		function( target, els ) {
      			var j = target.length,
      				i = 0;
      			// Can't trust NodeList.length
      			while ( (target[j++] = els[i++]) ) {}
      			target.length = j - 1;
      		}
      	};
      }
      
      function Sizzle( selector, context, results, seed ) {
      	var m, i, elem, nid, match, groups, newSelector,
      		newContext = context && context.ownerDocument,
      
      		// nodeType defaults to 9, since context defaults to document
      		nodeType = context ? context.nodeType : 9;
      
      	results = results || [];
      
      	// Return early from calls with invalid selector or context
      	if ( typeof selector !== "string" || !selector ||
      		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {
      
      		return results;
      	}
      
      	// Try to shortcut find operations (as opposed to filters) in HTML documents
      	if ( !seed ) {
      
      		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
      			setDocument( context );
      		}
      		context = context || document;
      
      		if ( documentIsHTML ) {
      
      			// If the selector is sufficiently simple, try using a "get*By*" DOM method
      			// (excepting DocumentFragment context, where the methods don't exist)
      			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
      
      				// ID selector
      				if ( (m = match[1]) ) {
      
      					// Document context
      					if ( nodeType === 9 ) {
      						if ( (elem = context.getElementById( m )) ) {
      
      							// Support: IE, Opera, Webkit
      							// TODO: identify versions
      							// getElementById can match elements by name instead of ID
      							if ( elem.id === m ) {
      								results.push( elem );
      								return results;
      							}
      						} else {
      							return results;
      						}
      
      					// Element context
      					} else {
      
      						// Support: IE, Opera, Webkit
      						// TODO: identify versions
      						// getElementById can match elements by name instead of ID
      						if ( newContext && (elem = newContext.getElementById( m )) &&
      							contains( context, elem ) &&
      							elem.id === m ) {
      
      							results.push( elem );
      							return results;
      						}
      					}
      
      				// Type selector
      				} else if ( match[2] ) {
      					push.apply( results, context.getElementsByTagName( selector ) );
      					return results;
      
      				// Class selector
      				} else if ( (m = match[3]) && support.getElementsByClassName &&
      					context.getElementsByClassName ) {
      
      					push.apply( results, context.getElementsByClassName( m ) );
      					return results;
      				}
      			}
      
      			// Take advantage of querySelectorAll
      			if ( support.qsa &&
      				!compilerCache[ selector + " " ] &&
      				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
      
      				if ( nodeType !== 1 ) {
      					newContext = context;
      					newSelector = selector;
      
      				// qSA looks outside Element context, which is not what we want
      				// Thanks to Andrew Dupont for this workaround technique
      				// Support: IE <=8
      				// Exclude object elements
      				} else if ( context.nodeName.toLowerCase() !== "object" ) {
      
      					// Capture the context ID, setting it first if necessary
      					if ( (nid = context.getAttribute( "id" )) ) {
      						nid = nid.replace( rcssescape, fcssescape );
      					} else {
      						context.setAttribute( "id", (nid = expando) );
      					}
      
      					// Prefix every selector in the list
      					groups = tokenize( selector );
      					i = groups.length;
      					while ( i-- ) {
      						groups[i] = "#" + nid + " " + toSelector( groups[i] );
      					}
      					newSelector = groups.join( "," );
      
      					// Expand context for sibling selectors
      					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
      						context;
      				}
      
      				if ( newSelector ) {
      					try {
      						push.apply( results,
      							newContext.querySelectorAll( newSelector )
      						);
      						return results;
      					} catch ( qsaError ) {
      					} finally {
      						if ( nid === expando ) {
      							context.removeAttribute( "id" );
      						}
      					}
      				}
      			}
      		}
      	}
      
      	// All others
      	return select( selector.replace( rtrim, "$1" ), context, results, seed );
      }
      
      /**
       * Create key-value caches of limited size
       * @returns {function(string, object)} Returns the Object data after storing it on itself with
       *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
       *	deleting the oldest entry
       */
      function createCache() {
      	var keys = [];
      
      	function cache( key, value ) {
      		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
      		if ( keys.push( key + " " ) > Expr.cacheLength ) {
      			// Only keep the most recent entries
      			delete cache[ keys.shift() ];
      		}
      		return (cache[ key + " " ] = value);
      	}
      	return cache;
      }
      
      /**
       * Mark a function for special use by Sizzle
       * @param {Function} fn The function to mark
       */
      function markFunction( fn ) {
      	fn[ expando ] = true;
      	return fn;
      }
      
      /**
       * Support testing using an element
       * @param {Function} fn Passed the created element and returns a boolean result
       */
      function assert( fn ) {
      	var el = document.createElement("fieldset");
      
      	try {
      		return !!fn( el );
      	} catch (e) {
      		return false;
      	} finally {
      		// Remove from its parent by default
      		if ( el.parentNode ) {
      			el.parentNode.removeChild( el );
      		}
      		// release memory in IE
      		el = null;
      	}
      }
      
      /**
       * Adds the same handler for all of the specified attrs
       * @param {String} attrs Pipe-separated list of attributes
       * @param {Function} handler The method that will be applied
       */
      function addHandle( attrs, handler ) {
      	var arr = attrs.split("|"),
      		i = arr.length;
      
      	while ( i-- ) {
      		Expr.attrHandle[ arr[i] ] = handler;
      	}
      }
      
      /**
       * Checks document order of two siblings
       * @param {Element} a
       * @param {Element} b
       * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
       */
      function siblingCheck( a, b ) {
      	var cur = b && a,
      		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
      			a.sourceIndex - b.sourceIndex;
      
      	// Use IE sourceIndex if available on both nodes
      	if ( diff ) {
      		return diff;
      	}
      
      	// Check if b follows a
      	if ( cur ) {
      		while ( (cur = cur.nextSibling) ) {
      			if ( cur === b ) {
      				return -1;
      			}
      		}
      	}
      
      	return a ? 1 : -1;
      }
      
      /**
       * Returns a function to use in pseudos for input types
       * @param {String} type
       */
      function createInputPseudo( type ) {
      	return function( elem ) {
      		var name = elem.nodeName.toLowerCase();
      		return name === "input" && elem.type === type;
      	};
      }
      
      /**
       * Returns a function to use in pseudos for buttons
       * @param {String} type
       */
      function createButtonPseudo( type ) {
      	return function( elem ) {
      		var name = elem.nodeName.toLowerCase();
      		return (name === "input" || name === "button") && elem.type === type;
      	};
      }
      
      /**
       * Returns a function to use in pseudos for :enabled/:disabled
       * @param {Boolean} disabled true for :disabled; false for :enabled
       */
      function createDisabledPseudo( disabled ) {
      	// Known :disabled false positives:
      	// IE: *[disabled]:not(button, input, select, textarea, optgroup, option, menuitem, fieldset)
      	// not IE: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
      	return function( elem ) {
      
      		// Check form elements and option elements for explicit disabling
      		return "label" in elem && elem.disabled === disabled ||
      			"form" in elem && elem.disabled === disabled ||
      
      			// Check non-disabled form elements for fieldset[disabled] ancestors
      			"form" in elem && elem.disabled === false && (
      				// Support: IE6-11+
      				// Ancestry is covered for us
      				elem.isDisabled === disabled ||
      
      				// Otherwise, assume any non-<option> under fieldset[disabled] is disabled
      				/* jshint -W018 */
      				elem.isDisabled !== !disabled &&
      					("label" in elem || !disabledAncestor( elem )) !== disabled
      			);
      	};
      }
      
      /**
       * Returns a function to use in pseudos for positionals
       * @param {Function} fn
       */
      function createPositionalPseudo( fn ) {
      	return markFunction(function( argument ) {
      		argument = +argument;
      		return markFunction(function( seed, matches ) {
      			var j,
      				matchIndexes = fn( [], seed.length, argument ),
      				i = matchIndexes.length;
      
      			// Match elements found at the specified indexes
      			while ( i-- ) {
      				if ( seed[ (j = matchIndexes[i]) ] ) {
      					seed[j] = !(matches[j] = seed[j]);
      				}
      			}
      		});
      	});
      }
      
      /**
       * Checks a node for validity as a Sizzle context
       * @param {Element|Object=} context
       * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
       */
      function testContext( context ) {
      	return context && typeof context.getElementsByTagName !== "undefined" && context;
      }
      
      // Expose support vars for convenience
      support = Sizzle.support = {};
      
      /**
       * Detects XML nodes
       * @param {Element|Object} elem An element or a document
       * @returns {Boolean} True iff elem is a non-HTML XML node
       */
      isXML = Sizzle.isXML = function( elem ) {
      	// documentElement is verified for cases where it doesn't yet exist
      	// (such as loading iframes in IE - #4833)
      	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
      	return documentElement ? documentElement.nodeName !== "HTML" : false;
      };
      
      /**
       * Sets document-related variables once based on the current document
       * @param {Element|Object} [doc] An element or document object to use to set the document
       * @returns {Object} Returns the current document
       */
      setDocument = Sizzle.setDocument = function( node ) {
      	var hasCompare, subWindow,
      		doc = node ? node.ownerDocument || node : preferredDoc;
      
      	// Return early if doc is invalid or already selected
      	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
      		return document;
      	}
      
      	// Update global variables
      	document = doc;
      	docElem = document.documentElement;
      	documentIsHTML = !isXML( document );
      
      	// Support: IE 9-11, Edge
      	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
      	if ( preferredDoc !== document &&
      		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {
      
      		// Support: IE 11, Edge
      		if ( subWindow.addEventListener ) {
      			subWindow.addEventListener( "unload", unloadHandler, false );
      
      		// Support: IE 9 - 10 only
      		} else if ( subWindow.attachEvent ) {
      			subWindow.attachEvent( "onunload", unloadHandler );
      		}
      	}
      
      	/* Attributes
      	---------------------------------------------------------------------- */
      
      	// Support: IE<8
      	// Verify that getAttribute really returns attributes and not properties
      	// (excepting IE8 booleans)
      	support.attributes = assert(function( el ) {
      		el.className = "i";
      		return !el.getAttribute("className");
      	});
      
      	/* getElement(s)By*
      	---------------------------------------------------------------------- */
      
      	// Check if getElementsByTagName("*") returns only elements
      	support.getElementsByTagName = assert(function( el ) {
      		el.appendChild( document.createComment("") );
      		return !el.getElementsByTagName("*").length;
      	});
      
      	// Support: IE<9
      	support.getElementsByClassName = rnative.test( document.getElementsByClassName );
      
      	// Support: IE<10
      	// Check if getElementById returns elements by name
      	// The broken getElementById methods don't pick up programmatically-set names,
      	// so use a roundabout getElementsByName test
      	support.getById = assert(function( el ) {
      		docElem.appendChild( el ).id = expando;
      		return !document.getElementsByName || !document.getElementsByName( expando ).length;
      	});
      
      	// ID find and filter
      	if ( support.getById ) {
      		Expr.find["ID"] = function( id, context ) {
      			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
      				var m = context.getElementById( id );
      				return m ? [ m ] : [];
      			}
      		};
      		Expr.filter["ID"] = function( id ) {
      			var attrId = id.replace( runescape, funescape );
      			return function( elem ) {
      				return elem.getAttribute("id") === attrId;
      			};
      		};
      	} else {
      		// Support: IE6/7
      		// getElementById is not reliable as a find shortcut
      		delete Expr.find["ID"];
      
      		Expr.filter["ID"] =  function( id ) {
      			var attrId = id.replace( runescape, funescape );
      			return function( elem ) {
      				var node = typeof elem.getAttributeNode !== "undefined" &&
      					elem.getAttributeNode("id");
      				return node && node.value === attrId;
      			};
      		};
      	}
      
      	// Tag
      	Expr.find["TAG"] = support.getElementsByTagName ?
      		function( tag, context ) {
      			if ( typeof context.getElementsByTagName !== "undefined" ) {
      				return context.getElementsByTagName( tag );
      
      			// DocumentFragment nodes don't have gEBTN
      			} else if ( support.qsa ) {
      				return context.querySelectorAll( tag );
      			}
      		} :
      
      		function( tag, context ) {
      			var elem,
      				tmp = [],
      				i = 0,
      				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
      				results = context.getElementsByTagName( tag );
      
      			// Filter out possible comments
      			if ( tag === "*" ) {
      				while ( (elem = results[i++]) ) {
      					if ( elem.nodeType === 1 ) {
      						tmp.push( elem );
      					}
      				}
      
      				return tmp;
      			}
      			return results;
      		};
      
      	// Class
      	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
      		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
      			return context.getElementsByClassName( className );
      		}
      	};
      
      	/* QSA/matchesSelector
      	---------------------------------------------------------------------- */
      
      	// QSA and matchesSelector support
      
      	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
      	rbuggyMatches = [];
      
      	// qSa(:focus) reports false when true (Chrome 21)
      	// We allow this because of a bug in IE8/9 that throws an error
      	// whenever `document.activeElement` is accessed on an iframe
      	// So, we allow :focus to pass through QSA all the time to avoid the IE error
      	// See https://bugs.jquery.com/ticket/13378
      	rbuggyQSA = [];
      
      	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
      		// Build QSA regex
      		// Regex strategy adopted from Diego Perini
      		assert(function( el ) {
      			// Select is set to empty string on purpose
      			// This is to test IE's treatment of not explicitly
      			// setting a boolean content attribute,
      			// since its presence should be enough
      			// https://bugs.jquery.com/ticket/12359
      			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
      				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
      				"<option selected=''></option></select>";
      
      			// Support: IE8, Opera 11-12.16
      			// Nothing should be selected when empty strings follow ^= or $= or *=
      			// The test attribute must be unknown in Opera but "safe" for WinRT
      			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
      			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
      				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
      			}
      
      			// Support: IE8
      			// Boolean attributes and "value" are not treated correctly
      			if ( !el.querySelectorAll("[selected]").length ) {
      				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
      			}
      
      			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
      			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
      				rbuggyQSA.push("~=");
      			}
      
      			// Webkit/Opera - :checked should return selected option elements
      			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      			// IE8 throws error here and will not see later tests
      			if ( !el.querySelectorAll(":checked").length ) {
      				rbuggyQSA.push(":checked");
      			}
      
      			// Support: Safari 8+, iOS 8+
      			// https://bugs.webkit.org/show_bug.cgi?id=136851
      			// In-page `selector#id sibling-combinator selector` fails
      			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
      				rbuggyQSA.push(".#.+[+~]");
      			}
      		});
      
      		assert(function( el ) {
      			el.innerHTML = "<a href='' disabled='disabled'></a>" +
      				"<select disabled='disabled'><option/></select>";
      
      			// Support: Windows 8 Native Apps
      			// The type and name attributes are restricted during .innerHTML assignment
      			var input = document.createElement("input");
      			input.setAttribute( "type", "hidden" );
      			el.appendChild( input ).setAttribute( "name", "D" );
      
      			// Support: IE8
      			// Enforce case-sensitivity of name attribute
      			if ( el.querySelectorAll("[name=d]").length ) {
      				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
      			}
      
      			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
      			// IE8 throws error here and will not see later tests
      			if ( el.querySelectorAll(":enabled").length !== 2 ) {
      				rbuggyQSA.push( ":enabled", ":disabled" );
      			}
      
      			// Support: IE9-11+
      			// IE's :disabled selector does not pick up the children of disabled fieldsets
      			docElem.appendChild( el ).disabled = true;
      			if ( el.querySelectorAll(":disabled").length !== 2 ) {
      				rbuggyQSA.push( ":enabled", ":disabled" );
      			}
      
      			// Opera 10-11 does not throw on post-comma invalid pseudos
      			el.querySelectorAll("*,:x");
      			rbuggyQSA.push(",.*:");
      		});
      	}
      
      	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
      		docElem.webkitMatchesSelector ||
      		docElem.mozMatchesSelector ||
      		docElem.oMatchesSelector ||
      		docElem.msMatchesSelector) )) ) {
      
      		assert(function( el ) {
      			// Check to see if it's possible to do matchesSelector
      			// on a disconnected node (IE 9)
      			support.disconnectedMatch = matches.call( el, "*" );
      
      			// This should fail with an exception
      			// Gecko does not error, returns false instead
      			matches.call( el, "[s!='']:x" );
      			rbuggyMatches.push( "!=", pseudos );
      		});
      	}
      
      	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
      	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );
      
      	/* Contains
      	---------------------------------------------------------------------- */
      	hasCompare = rnative.test( docElem.compareDocumentPosition );
      
      	// Element contains another
      	// Purposefully self-exclusive
      	// As in, an element does not contain itself
      	contains = hasCompare || rnative.test( docElem.contains ) ?
      		function( a, b ) {
      			var adown = a.nodeType === 9 ? a.documentElement : a,
      				bup = b && b.parentNode;
      			return a === bup || !!( bup && bup.nodeType === 1 && (
      				adown.contains ?
      					adown.contains( bup ) :
      					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
      			));
      		} :
      		function( a, b ) {
      			if ( b ) {
      				while ( (b = b.parentNode) ) {
      					if ( b === a ) {
      						return true;
      					}
      				}
      			}
      			return false;
      		};
      
      	/* Sorting
      	---------------------------------------------------------------------- */
      
      	// Document order sorting
      	sortOrder = hasCompare ?
      	function( a, b ) {
      
      		// Flag for duplicate removal
      		if ( a === b ) {
      			hasDuplicate = true;
      			return 0;
      		}
      
      		// Sort on method existence if only one input has compareDocumentPosition
      		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
      		if ( compare ) {
      			return compare;
      		}
      
      		// Calculate position if both inputs belong to the same document
      		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
      			a.compareDocumentPosition( b ) :
      
      			// Otherwise we know they are disconnected
      			1;
      
      		// Disconnected nodes
      		if ( compare & 1 ||
      			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {
      
      			// Choose the first element that is related to our preferred document
      			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
      				return -1;
      			}
      			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
      				return 1;
      			}
      
      			// Maintain original order
      			return sortInput ?
      				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
      				0;
      		}
      
      		return compare & 4 ? -1 : 1;
      	} :
      	function( a, b ) {
      		// Exit early if the nodes are identical
      		if ( a === b ) {
      			hasDuplicate = true;
      			return 0;
      		}
      
      		var cur,
      			i = 0,
      			aup = a.parentNode,
      			bup = b.parentNode,
      			ap = [ a ],
      			bp = [ b ];
      
      		// Parentless nodes are either documents or disconnected
      		if ( !aup || !bup ) {
      			return a === document ? -1 :
      				b === document ? 1 :
      				aup ? -1 :
      				bup ? 1 :
      				sortInput ?
      				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
      				0;
      
      		// If the nodes are siblings, we can do a quick check
      		} else if ( aup === bup ) {
      			return siblingCheck( a, b );
      		}
      
      		// Otherwise we need full lists of their ancestors for comparison
      		cur = a;
      		while ( (cur = cur.parentNode) ) {
      			ap.unshift( cur );
      		}
      		cur = b;
      		while ( (cur = cur.parentNode) ) {
      			bp.unshift( cur );
      		}
      
      		// Walk down the tree looking for a discrepancy
      		while ( ap[i] === bp[i] ) {
      			i++;
      		}
      
      		return i ?
      			// Do a sibling check if the nodes have a common ancestor
      			siblingCheck( ap[i], bp[i] ) :
      
      			// Otherwise nodes in our document sort first
      			ap[i] === preferredDoc ? -1 :
      			bp[i] === preferredDoc ? 1 :
      			0;
      	};
      
      	return document;
      };
      
      Sizzle.matches = function( expr, elements ) {
      	return Sizzle( expr, null, null, elements );
      };
      
      Sizzle.matchesSelector = function( elem, expr ) {
      	// Set document vars if needed
      	if ( ( elem.ownerDocument || elem ) !== document ) {
      		setDocument( elem );
      	}
      
      	// Make sure that attribute selectors are quoted
      	expr = expr.replace( rattributeQuotes, "='$1']" );
      
      	if ( support.matchesSelector && documentIsHTML &&
      		!compilerCache[ expr + " " ] &&
      		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
      		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {
      
      		try {
      			var ret = matches.call( elem, expr );
      
      			// IE 9's matchesSelector returns false on disconnected nodes
      			if ( ret || support.disconnectedMatch ||
      					// As well, disconnected nodes are said to be in a document
      					// fragment in IE 9
      					elem.document && elem.document.nodeType !== 11 ) {
      				return ret;
      			}
      		} catch (e) {}
      	}
      
      	return Sizzle( expr, document, null, [ elem ] ).length > 0;
      };
      
      Sizzle.contains = function( context, elem ) {
      	// Set document vars if needed
      	if ( ( context.ownerDocument || context ) !== document ) {
      		setDocument( context );
      	}
      	return contains( context, elem );
      };
      
      Sizzle.attr = function( elem, name ) {
      	// Set document vars if needed
      	if ( ( elem.ownerDocument || elem ) !== document ) {
      		setDocument( elem );
      	}
      
      	var fn = Expr.attrHandle[ name.toLowerCase() ],
      		// Don't get fooled by Object.prototype properties (jQuery #13807)
      		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
      			fn( elem, name, !documentIsHTML ) :
      			undefined;
      
      	return val !== undefined ?
      		val :
      		support.attributes || !documentIsHTML ?
      			elem.getAttribute( name ) :
      			(val = elem.getAttributeNode(name)) && val.specified ?
      				val.value :
      				null;
      };
      
      Sizzle.escape = function( sel ) {
      	return (sel + "").replace( rcssescape, fcssescape );
      };
      
      Sizzle.error = function( msg ) {
      	throw new Error( "Syntax error, unrecognized expression: " + msg );
      };
      
      /**
       * Document sorting and removing duplicates
       * @param {ArrayLike} results
       */
      Sizzle.uniqueSort = function( results ) {
      	var elem,
      		duplicates = [],
      		j = 0,
      		i = 0;
      
      	// Unless we *know* we can detect duplicates, assume their presence
      	hasDuplicate = !support.detectDuplicates;
      	sortInput = !support.sortStable && results.slice( 0 );
      	results.sort( sortOrder );
      
      	if ( hasDuplicate ) {
      		while ( (elem = results[i++]) ) {
      			if ( elem === results[ i ] ) {
      				j = duplicates.push( i );
      			}
      		}
      		while ( j-- ) {
      			results.splice( duplicates[ j ], 1 );
      		}
      	}
      
      	// Clear input after sorting to release objects
      	// See https://github.com/jquery/sizzle/pull/225
      	sortInput = null;
      
      	return results;
      };
      
      /**
       * Utility function for retrieving the text value of an array of DOM nodes
       * @param {Array|Element} elem
       */
      getText = Sizzle.getText = function( elem ) {
      	var node,
      		ret = "",
      		i = 0,
      		nodeType = elem.nodeType;
      
      	if ( !nodeType ) {
      		// If no nodeType, this is expected to be an array
      		while ( (node = elem[i++]) ) {
      			// Do not traverse comment nodes
      			ret += getText( node );
      		}
      	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
      		// Use textContent for elements
      		// innerText usage removed for consistency of new lines (jQuery #11153)
      		if ( typeof elem.textContent === "string" ) {
      			return elem.textContent;
      		} else {
      			// Traverse its children
      			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
      				ret += getText( elem );
      			}
      		}
      	} else if ( nodeType === 3 || nodeType === 4 ) {
      		return elem.nodeValue;
      	}
      	// Do not include comment or processing instruction nodes
      
      	return ret;
      };
      
      Expr = Sizzle.selectors = {
      
      	// Can be adjusted by the user
      	cacheLength: 50,
      
      	createPseudo: markFunction,
      
      	match: matchExpr,
      
      	attrHandle: {},
      
      	find: {},
      
      	relative: {
      		">": { dir: "parentNode", first: true },
      		" ": { dir: "parentNode" },
      		"+": { dir: "previousSibling", first: true },
      		"~": { dir: "previousSibling" }
      	},
      
      	preFilter: {
      		"ATTR": function( match ) {
      			match[1] = match[1].replace( runescape, funescape );
      
      			// Move the given value to match[3] whether quoted or unquoted
      			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );
      
      			if ( match[2] === "~=" ) {
      				match[3] = " " + match[3] + " ";
      			}
      
      			return match.slice( 0, 4 );
      		},
      
      		"CHILD": function( match ) {
      			/* matches from matchExpr["CHILD"]
      				1 type (only|nth|...)
      				2 what (child|of-type)
      				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
      				4 xn-component of xn+y argument ([+-]?\d*n|)
      				5 sign of xn-component
      				6 x of xn-component
      				7 sign of y-component
      				8 y of y-component
      			*/
      			match[1] = match[1].toLowerCase();
      
      			if ( match[1].slice( 0, 3 ) === "nth" ) {
      				// nth-* requires argument
      				if ( !match[3] ) {
      					Sizzle.error( match[0] );
      				}
      
      				// numeric x and y parameters for Expr.filter.CHILD
      				// remember that false/true cast respectively to 0/1
      				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
      				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );
      
      			// other types prohibit arguments
      			} else if ( match[3] ) {
      				Sizzle.error( match[0] );
      			}
      
      			return match;
      		},
      
      		"PSEUDO": function( match ) {
      			var excess,
      				unquoted = !match[6] && match[2];
      
      			if ( matchExpr["CHILD"].test( match[0] ) ) {
      				return null;
      			}
      
      			// Accept quoted arguments as-is
      			if ( match[3] ) {
      				match[2] = match[4] || match[5] || "";
      
      			// Strip excess characters from unquoted arguments
      			} else if ( unquoted && rpseudo.test( unquoted ) &&
      				// Get excess from tokenize (recursively)
      				(excess = tokenize( unquoted, true )) &&
      				// advance to the next closing parenthesis
      				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {
      
      				// excess is a negative index
      				match[0] = match[0].slice( 0, excess );
      				match[2] = unquoted.slice( 0, excess );
      			}
      
      			// Return only captures needed by the pseudo filter method (type and argument)
      			return match.slice( 0, 3 );
      		}
      	},
      
      	filter: {
      
      		"TAG": function( nodeNameSelector ) {
      			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
      			return nodeNameSelector === "*" ?
      				function() { return true; } :
      				function( elem ) {
      					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
      				};
      		},
      
      		"CLASS": function( className ) {
      			var pattern = classCache[ className + " " ];
      
      			return pattern ||
      				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
      				classCache( className, function( elem ) {
      					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
      				});
      		},
      
      		"ATTR": function( name, operator, check ) {
      			return function( elem ) {
      				var result = Sizzle.attr( elem, name );
      
      				if ( result == null ) {
      					return operator === "!=";
      				}
      				if ( !operator ) {
      					return true;
      				}
      
      				result += "";
      
      				return operator === "=" ? result === check :
      					operator === "!=" ? result !== check :
      					operator === "^=" ? check && result.indexOf( check ) === 0 :
      					operator === "*=" ? check && result.indexOf( check ) > -1 :
      					operator === "$=" ? check && result.slice( -check.length ) === check :
      					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
      					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
      					false;
      			};
      		},
      
      		"CHILD": function( type, what, argument, first, last ) {
      			var simple = type.slice( 0, 3 ) !== "nth",
      				forward = type.slice( -4 ) !== "last",
      				ofType = what === "of-type";
      
      			return first === 1 && last === 0 ?
      
      				// Shortcut for :nth-*(n)
      				function( elem ) {
      					return !!elem.parentNode;
      				} :
      
      				function( elem, context, xml ) {
      					var cache, uniqueCache, outerCache, node, nodeIndex, start,
      						dir = simple !== forward ? "nextSibling" : "previousSibling",
      						parent = elem.parentNode,
      						name = ofType && elem.nodeName.toLowerCase(),
      						useCache = !xml && !ofType,
      						diff = false;
      
      					if ( parent ) {
      
      						// :(first|last|only)-(child|of-type)
      						if ( simple ) {
      							while ( dir ) {
      								node = elem;
      								while ( (node = node[ dir ]) ) {
      									if ( ofType ?
      										node.nodeName.toLowerCase() === name :
      										node.nodeType === 1 ) {
      
      										return false;
      									}
      								}
      								// Reverse direction for :only-* (if we haven't yet done so)
      								start = dir = type === "only" && !start && "nextSibling";
      							}
      							return true;
      						}
      
      						start = [ forward ? parent.firstChild : parent.lastChild ];
      
      						// non-xml :nth-child(...) stores cache data on `parent`
      						if ( forward && useCache ) {
      
      							// Seek `elem` from a previously-cached index
      
      							// ...in a gzip-friendly way
      							node = parent;
      							outerCache = node[ expando ] || (node[ expando ] = {});
      
      							// Support: IE <9 only
      							// Defend against cloned attroperties (jQuery gh-1709)
      							uniqueCache = outerCache[ node.uniqueID ] ||
      								(outerCache[ node.uniqueID ] = {});
      
      							cache = uniqueCache[ type ] || [];
      							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
      							diff = nodeIndex && cache[ 2 ];
      							node = nodeIndex && parent.childNodes[ nodeIndex ];
      
      							while ( (node = ++nodeIndex && node && node[ dir ] ||
      
      								// Fallback to seeking `elem` from the start
      								(diff = nodeIndex = 0) || start.pop()) ) {
      
      								// When found, cache indexes on `parent` and break
      								if ( node.nodeType === 1 && ++diff && node === elem ) {
      									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
      									break;
      								}
      							}
      
      						} else {
      							// Use previously-cached element index if available
      							if ( useCache ) {
      								// ...in a gzip-friendly way
      								node = elem;
      								outerCache = node[ expando ] || (node[ expando ] = {});
      
      								// Support: IE <9 only
      								// Defend against cloned attroperties (jQuery gh-1709)
      								uniqueCache = outerCache[ node.uniqueID ] ||
      									(outerCache[ node.uniqueID ] = {});
      
      								cache = uniqueCache[ type ] || [];
      								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
      								diff = nodeIndex;
      							}
      
      							// xml :nth-child(...)
      							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
      							if ( diff === false ) {
      								// Use the same loop as above to seek `elem` from the start
      								while ( (node = ++nodeIndex && node && node[ dir ] ||
      									(diff = nodeIndex = 0) || start.pop()) ) {
      
      									if ( ( ofType ?
      										node.nodeName.toLowerCase() === name :
      										node.nodeType === 1 ) &&
      										++diff ) {
      
      										// Cache the index of each encountered element
      										if ( useCache ) {
      											outerCache = node[ expando ] || (node[ expando ] = {});
      
      											// Support: IE <9 only
      											// Defend against cloned attroperties (jQuery gh-1709)
      											uniqueCache = outerCache[ node.uniqueID ] ||
      												(outerCache[ node.uniqueID ] = {});
      
      											uniqueCache[ type ] = [ dirruns, diff ];
      										}
      
      										if ( node === elem ) {
      											break;
      										}
      									}
      								}
      							}
      						}
      
      						// Incorporate the offset, then check against cycle size
      						diff -= last;
      						return diff === first || ( diff % first === 0 && diff / first >= 0 );
      					}
      				};
      		},
      
      		"PSEUDO": function( pseudo, argument ) {
      			// pseudo-class names are case-insensitive
      			// http://www.w3.org/TR/selectors/#pseudo-classes
      			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
      			// Remember that setFilters inherits from pseudos
      			var args,
      				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
      					Sizzle.error( "unsupported pseudo: " + pseudo );
      
      			// The user may use createPseudo to indicate that
      			// arguments are needed to create the filter function
      			// just as Sizzle does
      			if ( fn[ expando ] ) {
      				return fn( argument );
      			}
      
      			// But maintain support for old signatures
      			if ( fn.length > 1 ) {
      				args = [ pseudo, pseudo, "", argument ];
      				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
      					markFunction(function( seed, matches ) {
      						var idx,
      							matched = fn( seed, argument ),
      							i = matched.length;
      						while ( i-- ) {
      							idx = indexOf( seed, matched[i] );
      							seed[ idx ] = !( matches[ idx ] = matched[i] );
      						}
      					}) :
      					function( elem ) {
      						return fn( elem, 0, args );
      					};
      			}
      
      			return fn;
      		}
      	},
      
      	pseudos: {
      		// Potentially complex pseudos
      		"not": markFunction(function( selector ) {
      			// Trim the selector passed to compile
      			// to avoid treating leading and trailing
      			// spaces as combinators
      			var input = [],
      				results = [],
      				matcher = compile( selector.replace( rtrim, "$1" ) );
      
      			return matcher[ expando ] ?
      				markFunction(function( seed, matches, context, xml ) {
      					var elem,
      						unmatched = matcher( seed, null, xml, [] ),
      						i = seed.length;
      
      					// Match elements unmatched by `matcher`
      					while ( i-- ) {
      						if ( (elem = unmatched[i]) ) {
      							seed[i] = !(matches[i] = elem);
      						}
      					}
      				}) :
      				function( elem, context, xml ) {
      					input[0] = elem;
      					matcher( input, null, xml, results );
      					// Don't keep the element (issue #299)
      					input[0] = null;
      					return !results.pop();
      				};
      		}),
      
      		"has": markFunction(function( selector ) {
      			return function( elem ) {
      				return Sizzle( selector, elem ).length > 0;
      			};
      		}),
      
      		"contains": markFunction(function( text ) {
      			text = text.replace( runescape, funescape );
      			return function( elem ) {
      				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
      			};
      		}),
      
      		// "Whether an element is represented by a :lang() selector
      		// is based solely on the element's language value
      		// being equal to the identifier C,
      		// or beginning with the identifier C immediately followed by "-".
      		// The matching of C against the element's language value is performed case-insensitively.
      		// The identifier C does not have to be a valid language name."
      		// http://www.w3.org/TR/selectors/#lang-pseudo
      		"lang": markFunction( function( lang ) {
      			// lang value must be a valid identifier
      			if ( !ridentifier.test(lang || "") ) {
      				Sizzle.error( "unsupported lang: " + lang );
      			}
      			lang = lang.replace( runescape, funescape ).toLowerCase();
      			return function( elem ) {
      				var elemLang;
      				do {
      					if ( (elemLang = documentIsHTML ?
      						elem.lang :
      						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {
      
      						elemLang = elemLang.toLowerCase();
      						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
      					}
      				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
      				return false;
      			};
      		}),
      
      		// Miscellaneous
      		"target": function( elem ) {
      			var hash = window.location && window.location.hash;
      			return hash && hash.slice( 1 ) === elem.id;
      		},
      
      		"root": function( elem ) {
      			return elem === docElem;
      		},
      
      		"focus": function( elem ) {
      			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
      		},
      
      		// Boolean properties
      		"enabled": createDisabledPseudo( false ),
      		"disabled": createDisabledPseudo( true ),
      
      		"checked": function( elem ) {
      			// In CSS3, :checked should return both checked and selected elements
      			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      			var nodeName = elem.nodeName.toLowerCase();
      			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
      		},
      
      		"selected": function( elem ) {
      			// Accessing this property makes selected-by-default
      			// options in Safari work properly
      			if ( elem.parentNode ) {
      				elem.parentNode.selectedIndex;
      			}
      
      			return elem.selected === true;
      		},
      
      		// Contents
      		"empty": function( elem ) {
      			// http://www.w3.org/TR/selectors/#empty-pseudo
      			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
      			//   but not by others (comment: 8; processing instruction: 7; etc.)
      			// nodeType < 6 works because attributes (2) do not appear as children
      			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
      				if ( elem.nodeType < 6 ) {
      					return false;
      				}
      			}
      			return true;
      		},
      
      		"parent": function( elem ) {
      			return !Expr.pseudos["empty"]( elem );
      		},
      
      		// Element/input types
      		"header": function( elem ) {
      			return rheader.test( elem.nodeName );
      		},
      
      		"input": function( elem ) {
      			return rinputs.test( elem.nodeName );
      		},
      
      		"button": function( elem ) {
      			var name = elem.nodeName.toLowerCase();
      			return name === "input" && elem.type === "button" || name === "button";
      		},
      
      		"text": function( elem ) {
      			var attr;
      			return elem.nodeName.toLowerCase() === "input" &&
      				elem.type === "text" &&
      
      				// Support: IE<8
      				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
      				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
      		},
      
      		// Position-in-collection
      		"first": createPositionalPseudo(function() {
      			return [ 0 ];
      		}),
      
      		"last": createPositionalPseudo(function( matchIndexes, length ) {
      			return [ length - 1 ];
      		}),
      
      		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
      			return [ argument < 0 ? argument + length : argument ];
      		}),
      
      		"even": createPositionalPseudo(function( matchIndexes, length ) {
      			var i = 0;
      			for ( ; i < length; i += 2 ) {
      				matchIndexes.push( i );
      			}
      			return matchIndexes;
      		}),
      
      		"odd": createPositionalPseudo(function( matchIndexes, length ) {
      			var i = 1;
      			for ( ; i < length; i += 2 ) {
      				matchIndexes.push( i );
      			}
      			return matchIndexes;
      		}),
      
      		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      			var i = argument < 0 ? argument + length : argument;
      			for ( ; --i >= 0; ) {
      				matchIndexes.push( i );
      			}
      			return matchIndexes;
      		}),
      
      		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      			var i = argument < 0 ? argument + length : argument;
      			for ( ; ++i < length; ) {
      				matchIndexes.push( i );
      			}
      			return matchIndexes;
      		})
      	}
      };
      
      Expr.pseudos["nth"] = Expr.pseudos["eq"];
      
      // Add button/input type pseudos
      for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
      	Expr.pseudos[ i ] = createInputPseudo( i );
      }
      for ( i in { submit: true, reset: true } ) {
      	Expr.pseudos[ i ] = createButtonPseudo( i );
      }
      
      // Easy API for creating new setFilters
      function setFilters() {}
      setFilters.prototype = Expr.filters = Expr.pseudos;
      Expr.setFilters = new setFilters();
      
      tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
      	var matched, match, tokens, type,
      		soFar, groups, preFilters,
      		cached = tokenCache[ selector + " " ];
      
      	if ( cached ) {
      		return parseOnly ? 0 : cached.slice( 0 );
      	}
      
      	soFar = selector;
      	groups = [];
      	preFilters = Expr.preFilter;
      
      	while ( soFar ) {
      
      		// Comma and first run
      		if ( !matched || (match = rcomma.exec( soFar )) ) {
      			if ( match ) {
      				// Don't consume trailing commas as valid
      				soFar = soFar.slice( match[0].length ) || soFar;
      			}
      			groups.push( (tokens = []) );
      		}
      
      		matched = false;
      
      		// Combinators
      		if ( (match = rcombinators.exec( soFar )) ) {
      			matched = match.shift();
      			tokens.push({
      				value: matched,
      				// Cast descendant combinators to space
      				type: match[0].replace( rtrim, " " )
      			});
      			soFar = soFar.slice( matched.length );
      		}
      
      		// Filters
      		for ( type in Expr.filter ) {
      			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
      				(match = preFilters[ type ]( match ))) ) {
      				matched = match.shift();
      				tokens.push({
      					value: matched,
      					type: type,
      					matches: match
      				});
      				soFar = soFar.slice( matched.length );
      			}
      		}
      
      		if ( !matched ) {
      			break;
      		}
      	}
      
      	// Return the length of the invalid excess
      	// if we're just parsing
      	// Otherwise, throw an error or return tokens
      	return parseOnly ?
      		soFar.length :
      		soFar ?
      			Sizzle.error( selector ) :
      			// Cache the tokens
      			tokenCache( selector, groups ).slice( 0 );
      };
      
      function toSelector( tokens ) {
      	var i = 0,
      		len = tokens.length,
      		selector = "";
      	for ( ; i < len; i++ ) {
      		selector += tokens[i].value;
      	}
      	return selector;
      }
      
      function addCombinator( matcher, combinator, base ) {
      	var dir = combinator.dir,
      		skip = combinator.next,
      		key = skip || dir,
      		checkNonElements = base && key === "parentNode",
      		doneName = done++;
      
      	return combinator.first ?
      		// Check against closest ancestor/preceding element
      		function( elem, context, xml ) {
      			while ( (elem = elem[ dir ]) ) {
      				if ( elem.nodeType === 1 || checkNonElements ) {
      					return matcher( elem, context, xml );
      				}
      			}
      		} :
      
      		// Check against all ancestor/preceding elements
      		function( elem, context, xml ) {
      			var oldCache, uniqueCache, outerCache,
      				newCache = [ dirruns, doneName ];
      
      			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
      			if ( xml ) {
      				while ( (elem = elem[ dir ]) ) {
      					if ( elem.nodeType === 1 || checkNonElements ) {
      						if ( matcher( elem, context, xml ) ) {
      							return true;
      						}
      					}
      				}
      			} else {
      				while ( (elem = elem[ dir ]) ) {
      					if ( elem.nodeType === 1 || checkNonElements ) {
      						outerCache = elem[ expando ] || (elem[ expando ] = {});
      
      						// Support: IE <9 only
      						// Defend against cloned attroperties (jQuery gh-1709)
      						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});
      
      						if ( skip && skip === elem.nodeName.toLowerCase() ) {
      							elem = elem[ dir ] || elem;
      						} else if ( (oldCache = uniqueCache[ key ]) &&
      							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {
      
      							// Assign to newCache so results back-propagate to previous elements
      							return (newCache[ 2 ] = oldCache[ 2 ]);
      						} else {
      							// Reuse newcache so results back-propagate to previous elements
      							uniqueCache[ key ] = newCache;
      
      							// A match means we're done; a fail means we have to keep checking
      							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
      								return true;
      							}
      						}
      					}
      				}
      			}
      		};
      }
      
      function elementMatcher( matchers ) {
      	return matchers.length > 1 ?
      		function( elem, context, xml ) {
      			var i = matchers.length;
      			while ( i-- ) {
      				if ( !matchers[i]( elem, context, xml ) ) {
      					return false;
      				}
      			}
      			return true;
      		} :
      		matchers[0];
      }
      
      function multipleContexts( selector, contexts, results ) {
      	var i = 0,
      		len = contexts.length;
      	for ( ; i < len; i++ ) {
      		Sizzle( selector, contexts[i], results );
      	}
      	return results;
      }
      
      function condense( unmatched, map, filter, context, xml ) {
      	var elem,
      		newUnmatched = [],
      		i = 0,
      		len = unmatched.length,
      		mapped = map != null;
      
      	for ( ; i < len; i++ ) {
      		if ( (elem = unmatched[i]) ) {
      			if ( !filter || filter( elem, context, xml ) ) {
      				newUnmatched.push( elem );
      				if ( mapped ) {
      					map.push( i );
      				}
      			}
      		}
      	}
      
      	return newUnmatched;
      }
      
      function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
      	if ( postFilter && !postFilter[ expando ] ) {
      		postFilter = setMatcher( postFilter );
      	}
      	if ( postFinder && !postFinder[ expando ] ) {
      		postFinder = setMatcher( postFinder, postSelector );
      	}
      	return markFunction(function( seed, results, context, xml ) {
      		var temp, i, elem,
      			preMap = [],
      			postMap = [],
      			preexisting = results.length,
      
      			// Get initial elements from seed or context
      			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),
      
      			// Prefilter to get matcher input, preserving a map for seed-results synchronization
      			matcherIn = preFilter && ( seed || !selector ) ?
      				condense( elems, preMap, preFilter, context, xml ) :
      				elems,
      
      			matcherOut = matcher ?
      				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
      				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?
      
      					// ...intermediate processing is necessary
      					[] :
      
      					// ...otherwise use results directly
      					results :
      				matcherIn;
      
      		// Find primary matches
      		if ( matcher ) {
      			matcher( matcherIn, matcherOut, context, xml );
      		}
      
      		// Apply postFilter
      		if ( postFilter ) {
      			temp = condense( matcherOut, postMap );
      			postFilter( temp, [], context, xml );
      
      			// Un-match failing elements by moving them back to matcherIn
      			i = temp.length;
      			while ( i-- ) {
      				if ( (elem = temp[i]) ) {
      					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
      				}
      			}
      		}
      
      		if ( seed ) {
      			if ( postFinder || preFilter ) {
      				if ( postFinder ) {
      					// Get the final matcherOut by condensing this intermediate into postFinder contexts
      					temp = [];
      					i = matcherOut.length;
      					while ( i-- ) {
      						if ( (elem = matcherOut[i]) ) {
      							// Restore matcherIn since elem is not yet a final match
      							temp.push( (matcherIn[i] = elem) );
      						}
      					}
      					postFinder( null, (matcherOut = []), temp, xml );
      				}
      
      				// Move matched elements from seed to results to keep them synchronized
      				i = matcherOut.length;
      				while ( i-- ) {
      					if ( (elem = matcherOut[i]) &&
      						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {
      
      						seed[temp] = !(results[temp] = elem);
      					}
      				}
      			}
      
      		// Add elements to results, through postFinder if defined
      		} else {
      			matcherOut = condense(
      				matcherOut === results ?
      					matcherOut.splice( preexisting, matcherOut.length ) :
      					matcherOut
      			);
      			if ( postFinder ) {
      				postFinder( null, results, matcherOut, xml );
      			} else {
      				push.apply( results, matcherOut );
      			}
      		}
      	});
      }
      
      function matcherFromTokens( tokens ) {
      	var checkContext, matcher, j,
      		len = tokens.length,
      		leadingRelative = Expr.relative[ tokens[0].type ],
      		implicitRelative = leadingRelative || Expr.relative[" "],
      		i = leadingRelative ? 1 : 0,
      
      		// The foundational matcher ensures that elements are reachable from top-level context(s)
      		matchContext = addCombinator( function( elem ) {
      			return elem === checkContext;
      		}, implicitRelative, true ),
      		matchAnyContext = addCombinator( function( elem ) {
      			return indexOf( checkContext, elem ) > -1;
      		}, implicitRelative, true ),
      		matchers = [ function( elem, context, xml ) {
      			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
      				(checkContext = context).nodeType ?
      					matchContext( elem, context, xml ) :
      					matchAnyContext( elem, context, xml ) );
      			// Avoid hanging onto element (issue #299)
      			checkContext = null;
      			return ret;
      		} ];
      
      	for ( ; i < len; i++ ) {
      		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
      			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
      		} else {
      			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );
      
      			// Return special upon seeing a positional matcher
      			if ( matcher[ expando ] ) {
      				// Find the next relative operator (if any) for proper handling
      				j = ++i;
      				for ( ; j < len; j++ ) {
      					if ( Expr.relative[ tokens[j].type ] ) {
      						break;
      					}
      				}
      				return setMatcher(
      					i > 1 && elementMatcher( matchers ),
      					i > 1 && toSelector(
      						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
      						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
      					).replace( rtrim, "$1" ),
      					matcher,
      					i < j && matcherFromTokens( tokens.slice( i, j ) ),
      					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
      					j < len && toSelector( tokens )
      				);
      			}
      			matchers.push( matcher );
      		}
      	}
      
      	return elementMatcher( matchers );
      }
      
      function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
      	var bySet = setMatchers.length > 0,
      		byElement = elementMatchers.length > 0,
      		superMatcher = function( seed, context, xml, results, outermost ) {
      			var elem, j, matcher,
      				matchedCount = 0,
      				i = "0",
      				unmatched = seed && [],
      				setMatched = [],
      				contextBackup = outermostContext,
      				// We must always have either seed elements or outermost context
      				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
      				// Use integer dirruns iff this is the outermost matcher
      				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
      				len = elems.length;
      
      			if ( outermost ) {
      				outermostContext = context === document || context || outermost;
      			}
      
      			// Add elements passing elementMatchers directly to results
      			// Support: IE<9, Safari
      			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
      			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
      				if ( byElement && elem ) {
      					j = 0;
      					if ( !context && elem.ownerDocument !== document ) {
      						setDocument( elem );
      						xml = !documentIsHTML;
      					}
      					while ( (matcher = elementMatchers[j++]) ) {
      						if ( matcher( elem, context || document, xml) ) {
      							results.push( elem );
      							break;
      						}
      					}
      					if ( outermost ) {
      						dirruns = dirrunsUnique;
      					}
      				}
      
      				// Track unmatched elements for set filters
      				if ( bySet ) {
      					// They will have gone through all possible matchers
      					if ( (elem = !matcher && elem) ) {
      						matchedCount--;
      					}
      
      					// Lengthen the array for every element, matched or not
      					if ( seed ) {
      						unmatched.push( elem );
      					}
      				}
      			}
      
      			// `i` is now the count of elements visited above, and adding it to `matchedCount`
      			// makes the latter nonnegative.
      			matchedCount += i;
      
      			// Apply set filters to unmatched elements
      			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
      			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
      			// no element matchers and no seed.
      			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
      			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
      			// numerically zero.
      			if ( bySet && i !== matchedCount ) {
      				j = 0;
      				while ( (matcher = setMatchers[j++]) ) {
      					matcher( unmatched, setMatched, context, xml );
      				}
      
      				if ( seed ) {
      					// Reintegrate element matches to eliminate the need for sorting
      					if ( matchedCount > 0 ) {
      						while ( i-- ) {
      							if ( !(unmatched[i] || setMatched[i]) ) {
      								setMatched[i] = pop.call( results );
      							}
      						}
      					}
      
      					// Discard index placeholder values to get only actual matches
      					setMatched = condense( setMatched );
      				}
      
      				// Add matches to results
      				push.apply( results, setMatched );
      
      				// Seedless set matches succeeding multiple successful matchers stipulate sorting
      				if ( outermost && !seed && setMatched.length > 0 &&
      					( matchedCount + setMatchers.length ) > 1 ) {
      
      					Sizzle.uniqueSort( results );
      				}
      			}
      
      			// Override manipulation of globals by nested matchers
      			if ( outermost ) {
      				dirruns = dirrunsUnique;
      				outermostContext = contextBackup;
      			}
      
      			return unmatched;
      		};
      
      	return bySet ?
      		markFunction( superMatcher ) :
      		superMatcher;
      }
      
      compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
      	var i,
      		setMatchers = [],
      		elementMatchers = [],
      		cached = compilerCache[ selector + " " ];
      
      	if ( !cached ) {
      		// Generate a function of recursive functions that can be used to check each element
      		if ( !match ) {
      			match = tokenize( selector );
      		}
      		i = match.length;
      		while ( i-- ) {
      			cached = matcherFromTokens( match[i] );
      			if ( cached[ expando ] ) {
      				setMatchers.push( cached );
      			} else {
      				elementMatchers.push( cached );
      			}
      		}
      
      		// Cache the compiled function
      		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
      
      		// Save selector and tokenization
      		cached.selector = selector;
      	}
      	return cached;
      };
      
      /**
       * A low-level selection function that works with Sizzle's compiled
       *  selector functions
       * @param {String|Function} selector A selector or a pre-compiled
       *  selector function built with Sizzle.compile
       * @param {Element} context
       * @param {Array} [results]
       * @param {Array} [seed] A set of elements to match against
       */
      select = Sizzle.select = function( selector, context, results, seed ) {
      	var i, tokens, token, type, find,
      		compiled = typeof selector === "function" && selector,
      		match = !seed && tokenize( (selector = compiled.selector || selector) );
      
      	results = results || [];
      
      	// Try to minimize operations if there is only one selector in the list and no seed
      	// (the latter of which guarantees us context)
      	if ( match.length === 1 ) {
      
      		// Reduce context if the leading compound selector is an ID
      		tokens = match[0] = match[0].slice( 0 );
      		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
      				support.getById && context.nodeType === 9 && documentIsHTML &&
      				Expr.relative[ tokens[1].type ] ) {
      
      			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
      			if ( !context ) {
      				return results;
      
      			// Precompiled matchers will still verify ancestry, so step up a level
      			} else if ( compiled ) {
      				context = context.parentNode;
      			}
      
      			selector = selector.slice( tokens.shift().value.length );
      		}
      
      		// Fetch a seed set for right-to-left matching
      		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
      		while ( i-- ) {
      			token = tokens[i];
      
      			// Abort if we hit a combinator
      			if ( Expr.relative[ (type = token.type) ] ) {
      				break;
      			}
      			if ( (find = Expr.find[ type ]) ) {
      				// Search, expanding context for leading sibling combinators
      				if ( (seed = find(
      					token.matches[0].replace( runescape, funescape ),
      					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
      				)) ) {
      
      					// If seed is empty or no tokens remain, we can return early
      					tokens.splice( i, 1 );
      					selector = seed.length && toSelector( tokens );
      					if ( !selector ) {
      						push.apply( results, seed );
      						return results;
      					}
      
      					break;
      				}
      			}
      		}
      	}
      
      	// Compile and execute a filtering function if one is not provided
      	// Provide `match` to avoid retokenization if we modified the selector above
      	( compiled || compile( selector, match ) )(
      		seed,
      		context,
      		!documentIsHTML,
      		results,
      		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
      	);
      	return results;
      };
      
      // One-time assignments
      
      // Sort stability
      support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;
      
      // Support: Chrome 14-35+
      // Always assume duplicates if they aren't passed to the comparison function
      support.detectDuplicates = !!hasDuplicate;
      
      // Initialize against the default document
      setDocument();
      
      // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
      // Detached nodes confoundingly follow *each other*
      support.sortDetached = assert(function( el ) {
      	// Should return 1, but returns 4 (following)
      	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
      });
      
      // Support: IE<8
      // Prevent attribute/property "interpolation"
      // https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
      if ( !assert(function( el ) {
      	el.innerHTML = "<a href='#'></a>";
      	return el.firstChild.getAttribute("href") === "#" ;
      }) ) {
      	addHandle( "type|href|height|width", function( elem, name, isXML ) {
      		if ( !isXML ) {
      			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
      		}
      	});
      }
      
      // Support: IE<9
      // Use defaultValue in place of getAttribute("value")
      if ( !support.attributes || !assert(function( el ) {
      	el.innerHTML = "<input/>";
      	el.firstChild.setAttribute( "value", "" );
      	return el.firstChild.getAttribute( "value" ) === "";
      }) ) {
      	addHandle( "value", function( elem, name, isXML ) {
      		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
      			return elem.defaultValue;
      		}
      	});
      }
      
      // Support: IE<9
      // Use getAttributeNode to fetch booleans when getAttribute lies
      if ( !assert(function( el ) {
      	return el.getAttribute("disabled") == null;
      }) ) {
      	addHandle( booleans, function( elem, name, isXML ) {
      		var val;
      		if ( !isXML ) {
      			return elem[ name ] === true ? name.toLowerCase() :
      					(val = elem.getAttributeNode( name )) && val.specified ?
      					val.value :
      				null;
      		}
      	});
      }
      
      // EXPOSE
      var _sizzle = window.Sizzle;
      
      Sizzle.noConflict = function() {
      	if ( window.Sizzle === Sizzle ) {
      		window.Sizzle = _sizzle;
      	}
      
      	return Sizzle;
      };
      
      if ( typeof define === "function" && define.amd ) {
      	define(function() { return Sizzle; });
      // Sizzle requires that there be a global window in Common-JS like environments
      } else if ( typeof module !== "undefined" && module.exports ) {
      	module.exports = Sizzle;
      } else {
      	window.Sizzle = Sizzle;
      }
      // EXPOSE
      
      })( window );
      
    },
    'dist/sizzle.min': function (module, exports, require, global) {
      /*! Sizzle v2.3.0 | (c) jQuery Foundation, Inc. | jquery.org/license */
      !function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C={}.hasOwnProperty,D=[],E=D.pop,F=D.push,G=D.push,H=D.slice,I=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},J="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",K="[\\x20\\t\\r\\n\\f]",L="(?:\\\\.|[\\w-]|[^\x00-\\xa0])+",M="\\["+K+"*("+L+")(?:"+K+"*([*^$|!~]?=)"+K+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+L+"))|)"+K+"*\\]",N=":("+L+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+M+")*)|.*)\\)|)",O=new RegExp(K+"+","g"),P=new RegExp("^"+K+"+|((?:^|[^\\\\])(?:\\\\.)*)"+K+"+$","g"),Q=new RegExp("^"+K+"*,"+K+"*"),R=new RegExp("^"+K+"*([>+~]|"+K+")"+K+"*"),S=new RegExp("="+K+"*([^\\]'\"]*?)"+K+"*\\]","g"),T=new RegExp(N),U=new RegExp("^"+L+"$"),V={ID:new RegExp("^#("+L+")"),CLASS:new RegExp("^\\.("+L+")"),TAG:new RegExp("^("+L+"|[*])"),ATTR:new RegExp("^"+M),PSEUDO:new RegExp("^"+N),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+K+"*(even|odd|(([+-]|)(\\d*)n|)"+K+"*(?:([+-]|)"+K+"*(\\d+)|))"+K+"*\\)|)","i"),bool:new RegExp("^(?:"+J+")$","i"),needsContext:new RegExp("^"+K+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+K+"*((?:-\\d)?\\d*)"+K+"*\\)|)(?=[^-]|$)","i")},W=/^(?:input|select|textarea|button)$/i,X=/^h\d$/i,Y=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,$=/[+~]/,_=new RegExp("\\\\([\\da-f]{1,6}"+K+"?|("+K+")|.)","ig"),aa=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ba=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g,ca=function(a,b){return b?"\x00"===a?"�":a.slice(0,-1)+"\\"+a.charCodeAt(a.length-1).toString(16)+" ":"\\"+a},da=function(){m()},ea=ta(function(a){return a.disabled===!0},{dir:"parentNode",next:"legend"});try{G.apply(D=H.call(v.childNodes),v.childNodes),D[v.childNodes.length].nodeType}catch(fa){G={apply:D.length?function(a,b){F.apply(a,H.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s=b&&b.ownerDocument,w=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==w&&9!==w&&11!==w)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==w&&(l=Z.exec(a)))if(f=l[1]){if(9===w){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(s&&(j=s.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(l[2])return G.apply(d,b.getElementsByTagName(a)),d;if((f=l[3])&&c.getElementsByClassName&&b.getElementsByClassName)return G.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==w)s=b,r=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(ba,ca):b.setAttribute("id",k=u),o=g(a),h=o.length;while(h--)o[h]="#"+k+" "+sa(o[h]);r=o.join(","),s=$.test(a)&&qa(b.parentNode)||b}if(r)try{return G.apply(d,s.querySelectorAll(r)),d}catch(x){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(P,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("fieldset");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&a.sourceIndex-b.sourceIndex;if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return function(b){return"label"in b&&b.disabled===a||"form"in b&&b.disabled===a||"form"in b&&b.disabled===!1&&(b.isDisabled===a||b.isDisabled!==!a&&("label"in b||!ea(b))!==a)}}function pa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function qa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),v!==n&&(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Y.test(n.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(_,aa);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(_,aa);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return"undefined"!=typeof b.getElementsByClassName&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=Y.test(n.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+K+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+K+"*(?:value|"+J+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){a.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+K+"*[*^$|!~]?="),2!==a.querySelectorAll(":enabled").length&&q.push(":enabled",":disabled"),o.appendChild(a).disabled=!0,2!==a.querySelectorAll(":disabled").length&&q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Y.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"*"),s.call(a,"[s!='']:x"),r.push("!=",N)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Y.test(o.compareDocumentPosition),t=b||Y.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?I(k,a)-I(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?I(k,a)-I(k,b):0;if(e===f)return la(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?la(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(S,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&C.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.escape=function(a){return(a+"").replace(ba,ca)},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(_,aa),a[3]=(a[3]||a[4]||a[5]||"").replace(_,aa),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return V.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&T.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(_,aa).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+K+")"+a+"("+K+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(O," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=I(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(P,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(_,aa),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return U.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(_,aa).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:oa(!1),disabled:oa(!0),checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return X.test(a.nodeName)},input:function(a){return W.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:pa(function(){return[0]}),last:pa(function(a,b){return[b-1]}),eq:pa(function(a,b,c){return[0>c?c+b:c]}),even:pa(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:pa(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:pa(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:pa(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=ma(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=na(b);function ra(){}ra.prototype=d.filters=d.pseudos,d.setFilters=new ra,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=Q.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=R.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(P," ")}),h=h.slice(c.length));for(g in d.filter)!(e=V[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function sa(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function ta(a,b,c){var d=b.dir,e=b.next,f=e||d,g=c&&"parentNode"===f,h=x++;return b.first?function(b,c,e){while(b=b[d])if(1===b.nodeType||g)return a(b,c,e)}:function(b,c,i){var j,k,l,m=[w,h];if(i){while(b=b[d])if((1===b.nodeType||g)&&a(b,c,i))return!0}else while(b=b[d])if(1===b.nodeType||g)if(l=b[u]||(b[u]={}),k=l[b.uniqueID]||(l[b.uniqueID]={}),e&&e===b.nodeName.toLowerCase())b=b[d]||b;else{if((j=k[f])&&j[0]===w&&j[1]===h)return m[2]=j[2];if(k[f]=m,m[2]=a(b,c,i))return!0}}}function ua(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function va(a,b,c){for(var d=0,e=b.length;e>d;d++)ga(a,b[d],c);return c}function wa(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function xa(a,b,c,d,e,f){return d&&!d[u]&&(d=xa(d)),e&&!e[u]&&(e=xa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||va(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:wa(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=wa(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?I(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=wa(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):G.apply(g,r)})}function ya(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ta(function(a){return a===b},h,!0),l=ta(function(a){return I(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[ta(ua(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return xa(i>1&&ua(m),i>1&&sa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(P,"$1"),c,e>i&&ya(a.slice(i,e)),f>e&&ya(a=a.slice(e)),f>e&&sa(a))}m.push(c)}return ua(m)}function za(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=E.call(i));u=wa(u)}G.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&ga.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ia(f):f}h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=ya(b[c]),f[u]?d.push(f):e.push(f);f=A(a,za(e,d)),f.selector=a}return f},i=ga.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(_,aa),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=V.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(_,aa),$.test(j[0].type)&&qa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&sa(j),!a)return G.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||$.test(a)&&qa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("fieldset"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(J,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null});var Aa=a.Sizzle;ga.noConflict=function(){return a.Sizzle===ga&&(a.Sizzle=Aa),ga},"function"==typeof define&&define.amd?define(function(){return ga}):"undefined"!=typeof module&&module.exports?module.exports=ga:a.Sizzle=ga}(window);
      //# sourceMappingURL=sizzle.min.map
    }
  }, 'dist/sizzle');

  Module.createPackage('bonzo', {
    'bonzo': function (module, exports, require, global) {
      /*!
        * Bonzo: DOM Utility (c) Dustin Diaz 2012
        * https://github.com/ded/bonzo
        * License MIT
        */
      (function (name, context, definition) {
        if (typeof module != 'undefined' && module.exports) module.exports = definition()
        else if (typeof define == 'function' && define.amd) define(definition)
        else context[name] = definition()
      })('bonzo', this, function() {
        var win = window
          , doc = win.document
          , html = doc.documentElement
          , parentNode = 'parentNode'
          , specialAttributes = /^(checked|value|selected|disabled)$/i
            // tags that we have trouble inserting *into*
          , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i
          , simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/
          , table = ['<table>', '</table>', 1]
          , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
          , option = ['<select>', '</select>', 1]
          , noscope = ['_', '', 0, 1]
          , tagMap = { // tags that we have trouble *inserting*
                thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
              , tr: ['<table><tbody>', '</tbody></table>', 2]
              , th: td , td: td
              , col: ['<table><colgroup>', '</colgroup></table>', 2]
              , fieldset: ['<form>', '</form>', 1]
              , legend: ['<form><fieldset>', '</fieldset></form>', 2]
              , option: option, optgroup: option
              , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
            }
          , stateAttributes = /^(checked|selected|disabled)$/
          , hasClass, addClass, removeClass
          , uidMap = {}
          , uuids = 0
          , digit = /^-?[\d\.]+$/
          , dattr = /^data-(.+)$/
          , px = 'px'
          , setAttribute = 'setAttribute'
          , getAttribute = 'getAttribute'
          , features = function() {
              var e = doc.createElement('p')
              return {
                transform: function () {
                  var props = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform'], i
                  for (i = 0; i < props.length; i++) {
                    if (props[i] in e.style) return props[i]
                  }
                }()
              , classList: 'classList' in e
              }
            }()
          , whitespaceRegex = /\s+/
          , toString = String.prototype.toString
          , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
          , query = doc.querySelectorAll && function (selector) { return doc.querySelectorAll(selector) }
      
      
        function getStyle(el, property) {
          var value = null
            , computed = doc.defaultView.getComputedStyle(el, '')
          computed && (value = computed[property])
          return el.style[property] || value
        }
      
      
        function isNode(node) {
          return node && node.nodeName && (node.nodeType == 1 || node.nodeType == 11)
        }
      
      
        function normalize(node, host, clone) {
          var i, l, ret
          if (typeof node == 'string') return bonzo.create(node)
          if (isNode(node)) node = [ node ]
          if (clone) {
            ret = [] // don't change original array
            for (i = 0, l = node.length; i < l; i++) ret[i] = cloneNode(host, node[i])
            return ret
          }
          return node
        }
      
        /**
         * @param {string} c a class name to test
         * @return {boolean}
         */
        function classReg(c) {
          return new RegExp('(^|\\s+)' + c + '(\\s+|$)')
        }
      
      
        /**
         * @param {Bonzo|Array} ar
         * @param {function(Object, number, (Bonzo|Array))} fn
         * @param {Object=} opt_scope
         * @param {boolean=} opt_rev
         * @return {Bonzo|Array}
         */
        function each(ar, fn, opt_scope, opt_rev) {
          var ind, i = 0, l = ar.length
          for (; i < l; i++) {
            ind = opt_rev ? ar.length - i - 1 : i
            fn.call(opt_scope || ar[ind], ar[ind], ind, ar)
          }
          return ar
        }
      
      
        /**
         * @param {Bonzo|Array} ar
         * @param {function(Object, number, (Bonzo|Array))} fn
         * @param {Object=} opt_scope
         * @return {Bonzo|Array}
         */
        function deepEach(ar, fn, opt_scope) {
          for (var i = 0, l = ar.length; i < l; i++) {
            if (isNode(ar[i])) {
              deepEach(ar[i].childNodes, fn, opt_scope)
              fn.call(opt_scope || ar[i], ar[i], i, ar)
            }
          }
          return ar
        }
      
      
        /**
         * @param {string} s
         * @return {string}
         */
        function camelize(s) {
          return s.replace(/-(.)/g, function (m, m1) {
            return m1.toUpperCase()
          })
        }
      
      
        /**
         * @param {string} s
         * @return {string}
         */
        function decamelize(s) {
          return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
        }
      
      
        /**
         * @param {Element} el
         * @return {*}
         */
        function data(el) {
          el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
          var uid = el[getAttribute]('data-node-uid')
          return uidMap[uid] || (uidMap[uid] = {})
        }
      
      
        /**
         * removes the data associated with an element
         * @param {Element} el
         */
        function clearData(el) {
          var uid = el[getAttribute]('data-node-uid')
          if (uid) delete uidMap[uid]
        }
      
      
        function dataValue(d) {
          var f
          try {
            return (d === null || d === undefined) ? undefined :
              d === 'true' ? true :
                d === 'false' ? false :
                  d === 'null' ? null :
                    (f = parseFloat(d)) == d ? f : d;
          } catch(e) {}
          return undefined
        }
      
      
        /**
         * @param {Bonzo|Array} ar
         * @param {function(Object, number, (Bonzo|Array))} fn
         * @param {Object=} opt_scope
         * @return {boolean} whether `some`thing was found
         */
        function some(ar, fn, opt_scope) {
          for (var i = 0, j = ar.length; i < j; ++i) if (fn.call(opt_scope || null, ar[i], i, ar)) return true
          return false
        }
      
      
        /**
         * this could be a giant enum of CSS properties
         * but in favor of file size sans-closure deadcode optimizations
         * we're just asking for any ol string
         * then it gets transformed into the appropriate style property for JS access
         * @param {string} p
         * @return {string}
         */
        function styleProperty(p) {
            (p == 'transform' && (p = features.transform)) ||
              (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + 'Origin'))
            return p ? camelize(p) : null
        }
      
        // this insert method is intense
        function insert(target, host, fn, rev) {
          var i = 0, self = host || this, r = []
            // target nodes could be a css selector if it's a string and a selector engine is present
            // otherwise, just use target
            , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
          // normalize each node in case it's still a string and we need to create nodes on the fly
          each(normalize(nodes), function (t, j) {
            each(self, function (el) {
              fn(t, r[i++] = j > 0 ? cloneNode(self, el) : el)
            }, null, rev)
          }, this, rev)
          self.length = i
          each(r, function (e) {
            self[--i] = e
          }, null, !rev)
          return self
        }
      
      
        /**
         * sets an element to an explicit x/y position on the page
         * @param {Element} el
         * @param {?number} x
         * @param {?number} y
         */
        function xy(el, x, y) {
          var $el = bonzo(el)
            , style = $el.css('position')
            , offset = $el.offset()
            , rel = 'relative'
            , isRel = style == rel
            , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]
      
          if (style == 'static') {
            $el.css('position', rel)
            style = rel
          }
      
          isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
          isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)
      
          x != null && (el.style.left = x - offset.left + delta[0] + px)
          y != null && (el.style.top = y - offset.top + delta[1] + px)
      
        }
      
        // classList support for class management
        // altho to be fair, the api sucks because it won't accept multiple classes at once
        if (features.classList) {
          hasClass = function (el, c) {
            return el.classList.contains(c)
          }
          addClass = function (el, c) {
            el.classList.add(c)
          }
          removeClass = function (el, c) {
            el.classList.remove(c)
          }
        }
        else {
          hasClass = function (el, c) {
            return classReg(c).test(el.className)
          }
          addClass = function (el, c) {
            el.className = (el.className + ' ' + c).trim()
          }
          removeClass = function (el, c) {
            el.className = (el.className.replace(classReg(c), ' ')).trim()
          }
        }
      
      
        /**
         * this allows method calling for setting values
         *
         * @example
         * bonzo(elements).css('color', function (el) {
         *   return el.getAttribute('data-original-color')
         * })
         *
         * @param {Element} el
         * @param {function (Element)|string} v
         * @return {string}
         */
        function setter(el, v) {
          return typeof v == 'function' ? v.call(el, el) : v
        }
      
        function scroll(x, y, type) {
          var el = this[0]
          if (!el) return this
          if (x == null && y == null) {
            return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
          }
          if (isBody(el)) {
            win.scrollTo(x, y)
          } else {
            x != null && (el.scrollLeft = x)
            y != null && (el.scrollTop = y)
          }
          return this
        }
      
        /**
         * @constructor
         * @param {Array.<Element>|Element|Node|string} elements
         */
        function Bonzo(elements) {
          this.length = 0
          if (elements) {
            elements = typeof elements !== 'string' &&
              !elements.nodeType &&
              typeof elements.length !== 'undefined' ?
                elements :
                [elements]
            this.length = elements.length
            for (var i = 0; i < elements.length; i++) this[i] = elements[i]
          }
        }
      
        Bonzo.prototype = {
      
            /**
             * @param {number} index
             * @return {Element|Node}
             */
            get: function (index) {
              return this[index] || null
            }
      
            // itetators
            /**
             * @param {function(Element|Node)} fn
             * @param {Object=} opt_scope
             * @return {Bonzo}
             */
          , each: function (fn, opt_scope) {
              return each(this, fn, opt_scope)
            }
      
            /**
             * @param {Function} fn
             * @param {Object=} opt_scope
             * @return {Bonzo}
             */
          , deepEach: function (fn, opt_scope) {
              return deepEach(this, fn, opt_scope)
            }
      
      
            /**
             * @param {Function} fn
             * @param {Function=} opt_reject
             * @return {Array}
             */
          , map: function (fn, opt_reject) {
              var m = [], n, i
              for (i = 0; i < this.length; i++) {
                n = fn.call(this, this[i], i)
                opt_reject ? (opt_reject(n) && m.push(n)) : m.push(n)
              }
              return m
            }
      
          // text and html inserters!
      
          /**
           * @param {string} h the HTML to insert
           * @param {boolean=} opt_text whether to set or get text content
           * @return {Bonzo|string}
           */
          , html: function (h, opt_text) {
              var method = opt_text
                    ? 'textContent'
                    : 'innerHTML'
                , that = this
                , append = function (el, i) {
                    each(normalize(h, that, i), function (node) {
                      el.appendChild(node)
                    })
                  }
                , updateElement = function (el, i) {
                    try {
                      if (opt_text || (typeof h == 'string' && !specialTags.test(el.tagName))) {
                        return el[method] = h
                      }
                    } catch (e) {}
                    append(el, i)
                  }
              return typeof h != 'undefined'
                ? this.empty().each(updateElement)
                : this[0] ? this[0][method] : ''
            }
      
            /**
             * @param {string=} opt_text the text to set, otherwise this is a getter
             * @return {Bonzo|string}
             */
          , text: function (opt_text) {
              return this.html(opt_text, true)
            }
      
            // more related insertion methods
      
            /**
             * @param {Bonzo|string|Element|Array} node
             * @return {Bonzo}
             */
          , append: function (node) {
              var that = this
              return this.each(function (el, i) {
                each(normalize(node, that, i), function (i) {
                  el.appendChild(i)
                })
              })
            }
      
      
            /**
             * @param {Bonzo|string|Element|Array} node
             * @return {Bonzo}
             */
          , prepend: function (node) {
              var that = this
              return this.each(function (el, i) {
                var first = el.firstChild
                each(normalize(node, that, i), function (i) {
                  el.insertBefore(i, first)
                })
              })
            }
      
      
            /**
             * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
             * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
             * @return {Bonzo}
             */
          , appendTo: function (target, opt_host) {
              return insert.call(this, target, opt_host, function (t, el) {
                t.appendChild(el)
              })
            }
      
      
            /**
             * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
             * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
             * @return {Bonzo}
             */
          , prependTo: function (target, opt_host) {
              return insert.call(this, target, opt_host, function (t, el) {
                t.insertBefore(el, t.firstChild)
              }, 1)
            }
      
      
            /**
             * @param {Bonzo|string|Element|Array} node
             * @return {Bonzo}
             */
          , before: function (node) {
              var that = this
              return this.each(function (el, i) {
                each(normalize(node, that, i), function (i) {
                  el[parentNode].insertBefore(i, el)
                })
              })
            }
      
      
            /**
             * @param {Bonzo|string|Element|Array} node
             * @return {Bonzo}
             */
          , after: function (node) {
              var that = this
              return this.each(function (el, i) {
                each(normalize(node, that, i), function (i) {
                  el[parentNode].insertBefore(i, el.nextSibling)
                }, null, 1)
              })
            }
      
      
            /**
             * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
             * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
             * @return {Bonzo}
             */
          , insertBefore: function (target, opt_host) {
              return insert.call(this, target, opt_host, function (t, el) {
                t[parentNode].insertBefore(el, t)
              })
            }
      
      
            /**
             * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
             * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
             * @return {Bonzo}
             */
          , insertAfter: function (target, opt_host) {
              return insert.call(this, target, opt_host, function (t, el) {
                var sibling = t.nextSibling
                sibling ?
                  t[parentNode].insertBefore(el, sibling) :
                  t[parentNode].appendChild(el)
              }, 1)
            }
      
      
            /**
             * @param {Bonzo|string|Element|Array} node
             * @return {Bonzo}
             */
          , replaceWith: function (node) {
              var that = this
              return this.each(function (el, i) {
                each(normalize(node, that, i), function (i) {
                  el[parentNode] && el[parentNode].replaceChild(i, el)
                })
              })
            }
      
            /**
             * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
             * @return {Bonzo}
             */
          , clone: function (opt_host) {
              var ret = [] // don't change original array
                , l, i
              for (i = 0, l = this.length; i < l; i++) ret[i] = cloneNode(opt_host || this, this[i])
              return bonzo(ret)
            }
      
            // class management
      
            /**
             * @param {string} c
             * @return {Bonzo}
             */
          , addClass: function (c) {
              c = toString.call(c).split(whitespaceRegex)
              return this.each(function (el) {
                // we `each` here so you can do $el.addClass('foo bar')
                each(c, function (c) {
                  if (c && !hasClass(el, setter(el, c)))
                    addClass(el, setter(el, c))
                })
              })
            }
      
      
            /**
             * @param {string} c
             * @return {Bonzo}
             */
          , removeClass: function (c) {
              c = toString.call(c).split(whitespaceRegex)
              return this.each(function (el) {
                each(c, function (c) {
                  if (c && hasClass(el, setter(el, c)))
                    removeClass(el, setter(el, c))
                })
              })
            }
      
      
            /**
             * @param {string} c
             * @return {boolean}
             */
          , hasClass: function (c) {
              c = toString.call(c).split(whitespaceRegex)
              return some(this, function (el) {
                return some(c, function (c) {
                  return c && hasClass(el, c)
                })
              })
            }
      
      
            /**
             * @param {string} c classname to toggle
             * @param {boolean=} opt_condition whether to add or remove the class straight away
             * @return {Bonzo}
             */
          , toggleClass: function (c, opt_condition) {
              c = toString.call(c).split(whitespaceRegex)
              return this.each(function (el) {
                each(c, function (c) {
                  if (c) {
                    typeof opt_condition !== 'undefined' ?
                      opt_condition ? !hasClass(el, c) && addClass(el, c) : removeClass(el, c) :
                      hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
                  }
                })
              })
            }
      
            // display togglers
      
            /**
             * @param {string=} opt_type useful to set back to anything other than an empty string
             * @return {Bonzo}
             */
          , show: function (opt_type) {
              opt_type = typeof opt_type == 'string' ? opt_type : ''
              return this.each(function (el) {
                el.style.display = opt_type
              })
            }
      
      
            /**
             * @return {Bonzo}
             */
          , hide: function () {
              return this.each(function (el) {
                el.style.display = 'none'
              })
            }
      
      
            /**
             * @param {Function=} opt_callback
             * @param {string=} opt_type
             * @return {Bonzo}
             */
          , toggle: function (opt_callback, opt_type) {
              opt_type = typeof opt_type == 'string' ? opt_type : '';
              typeof opt_callback != 'function' && (opt_callback = null)
              return this.each(function (el) {
                el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : opt_type;
                opt_callback && opt_callback.call(el)
              })
            }
      
      
            // DOM Walkers & getters
      
            /**
             * @return {Element|Node}
             */
          , first: function () {
              return bonzo(this.length ? this[0] : [])
            }
      
      
            /**
             * @return {Element|Node}
             */
          , last: function () {
              return bonzo(this.length ? this[this.length - 1] : [])
            }
      
      
            /**
             * @return {Element|Node}
             */
          , next: function () {
              return this.related('nextSibling')
            }
      
      
            /**
             * @return {Element|Node}
             */
          , previous: function () {
              return this.related('previousSibling')
            }
      
      
            /**
             * @return {Element|Node}
             */
          , parent: function() {
              return this.related(parentNode)
            }
      
      
            /**
             * @private
             * @param {string} method the directional DOM method
             * @return {Element|Node}
             */
          , related: function (method) {
              return bonzo(this.map(
                function (el) {
                  el = el[method]
                  while (el && el.nodeType !== 1) {
                    el = el[method]
                  }
                  return el || 0
                },
                function (el) {
                  return el
                }
              ))
            }
      
      
            /**
             * @return {Bonzo}
             */
          , focus: function () {
              this.length && this[0].focus()
              return this
            }
      
      
            /**
             * @return {Bonzo}
             */
          , blur: function () {
              this.length && this[0].blur()
              return this
            }
      
            // style getter setter & related methods
      
            /**
             * @param {Object|string} o
             * @param {string=} opt_v
             * @return {Bonzo|string}
             */
          , css: function (o, opt_v) {
              var p, iter = o
              // is this a request for just getting a style?
              if (opt_v === undefined && typeof o == 'string') {
                // repurpose 'v'
                opt_v = this[0]
                if (!opt_v) return null
                if (opt_v === doc || opt_v === win) {
                  p = (opt_v === doc) ? bonzo.doc() : bonzo.viewport()
                  return o == 'width' ? p.width : o == 'height' ? p.height : ''
                }
                return (o = styleProperty(o)) ? getStyle(opt_v, o) : null
              }
      
              if (typeof o == 'string') {
                iter = {}
                iter[o] = opt_v
              }
      
              function fn(el, p, v) {
                for (var k in iter) {
                  if (iter.hasOwnProperty(k)) {
                    v = iter[k];
                    // change "5" to "5px" - unless you're line-height, which is allowed
                    (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                    try { el.style[p] = setter(el, v) } catch(e) {}
                  }
                }
              }
              return this.each(fn)
            }
      
      
            /**
             * @param {number=} opt_x
             * @param {number=} opt_y
             * @return {Bonzo|number}
             */
          , offset: function (opt_x, opt_y) {
              if (opt_x && typeof opt_x == 'object' && (typeof opt_x.top == 'number' || typeof opt_x.left == 'number')) {
                return this.each(function (el) {
                  xy(el, opt_x.left, opt_x.top)
                })
              } else if (typeof opt_x == 'number' || typeof opt_y == 'number') {
                return this.each(function (el) {
                  xy(el, opt_x, opt_y)
                })
              }
              if (!this[0]) return {
                  top: 0
                , left: 0
                , height: 0
                , width: 0
              }
              var el = this[0]
                , de = el.ownerDocument.documentElement
                , bcr = el.getBoundingClientRect()
                , scroll = getWindowScroll()
                , width = el.offsetWidth
                , height = el.offsetHeight
                , top = bcr.top + scroll.y - Math.max(0, de && de.clientTop, doc.body.clientTop)
                , left = bcr.left + scroll.x - Math.max(0, de && de.clientLeft, doc.body.clientLeft)
      
              return {
                  top: top
                , left: left
                , height: height
                , width: width
              }
            }
      
      
            /**
             * @return {number}
             */
          , dim: function () {
              if (!this.length) return { height: 0, width: 0 }
              var el = this[0]
                , de = el.nodeType == 9 && el.documentElement // document
                , orig = !de && !!el.style && !el.offsetWidth && !el.offsetHeight ?
                   // el isn't visible, can't be measured properly, so fix that
                   function (t) {
                     var s = {
                         position: el.style.position || ''
                       , visibility: el.style.visibility || ''
                       , display: el.style.display || ''
                     }
                     t.first().css({
                         position: 'absolute'
                       , visibility: 'hidden'
                       , display: 'block'
                     })
                     return s
                  }(this) : null
                , width = de
                    ? Math.max(el.body.scrollWidth, el.body.offsetWidth, de.scrollWidth, de.offsetWidth, de.clientWidth)
                    : el.offsetWidth
                , height = de
                    ? Math.max(el.body.scrollHeight, el.body.offsetHeight, de.scrollHeight, de.offsetHeight, de.clientHeight)
                    : el.offsetHeight
      
              orig && this.first().css(orig)
              return {
                  height: height
                , width: width
              }
            }
      
            // attributes are hard. go shopping
      
            /**
             * @param {string} k an attribute to get or set
             * @param {string=} opt_v the value to set
             * @return {Bonzo|string}
             */
          , attr: function (k, opt_v) {
              var el = this[0]
                , n
      
              if (typeof k != 'string' && !(k instanceof String)) {
                for (n in k) {
                  k.hasOwnProperty(n) && this.attr(n, k[n])
                }
                return this
              }
      
              return typeof opt_v == 'undefined' ?
                !el ? null : specialAttributes.test(k) ?
                  stateAttributes.test(k) && typeof el[k] == 'string' ?
                    true : el[k] :  el[getAttribute](k) :
                this.each(function (el) {
                  specialAttributes.test(k) ? (el[k] = setter(el, opt_v)) : el[setAttribute](k, setter(el, opt_v))
                })
            }
      
      
            /**
             * @param {string} k
             * @return {Bonzo}
             */
          , removeAttr: function (k) {
              return this.each(function (el) {
                stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
              })
            }
      
      
            /**
             * @param {string=} opt_s
             * @return {Bonzo|string}
             */
          , val: function (s) {
              return (typeof s == 'string' || typeof s == 'number') ?
                this.attr('value', s) :
                this.length ? this[0].value : null
            }
      
            // use with care and knowledge. this data() method uses data attributes on the DOM nodes
            // to do this differently costs a lot more code. c'est la vie
            /**
             * @param {string|Object=} opt_k the key for which to get or set data
             * @param {Object=} opt_v
             * @return {Bonzo|Object}
             */
          , data: function (opt_k, opt_v) {
              var el = this[0], o, m
              if (typeof opt_v === 'undefined') {
                if (!el) return null
                o = data(el)
                if (typeof opt_k === 'undefined') {
                  each(el.attributes, function (a) {
                    (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
                  })
                  return o
                } else {
                  if (typeof o[opt_k] === 'undefined')
                    o[opt_k] = dataValue(this.attr('data-' + decamelize(opt_k)))
                  return o[opt_k]
                }
              } else {
                return this.each(function (el) { data(el)[opt_k] = opt_v })
              }
            }
      
            // DOM detachment & related
      
            /**
             * @return {Bonzo}
             */
          , remove: function () {
              this.deepEach(clearData)
              return this.detach()
            }
      
      
            /**
             * @return {Bonzo}
             */
          , empty: function () {
              return this.each(function (el) {
                deepEach(el.childNodes, clearData)
      
                while (el.firstChild) {
                  el.removeChild(el.firstChild)
                }
              })
            }
      
      
            /**
             * @return {Bonzo}
             */
          , detach: function () {
              return this.each(function (el) {
                el[parentNode] && el[parentNode].removeChild(el)
              })
            }
      
            // who uses a mouse anyway? oh right.
      
            /**
             * @param {number} y
             */
          , scrollTop: function (y) {
              return scroll.call(this, null, y, 'y')
            }
      
      
            /**
             * @param {number} x
             */
          , scrollLeft: function (x) {
              return scroll.call(this, x, null, 'x')
            }
      
        }
      
      
        function cloneNode(host, el) {
          var c = el.cloneNode(true)
            , cloneElems
            , elElems
            , i
      
          // check for existence of an event cloner
          // preferably https://github.com/fat/bean
          // otherwise Bonzo won't do this for you
          if (host.$ && typeof host.cloneEvents == 'function') {
            host.$(c).cloneEvents(el)
      
            // clone events from every child node
            cloneElems = host.$(c).find('*')
            elElems = host.$(el).find('*')
      
            for (i = 0; i < elElems.length; i++)
              host.$(cloneElems[i]).cloneEvents(elElems[i])
          }
          return c
        }
      
        function isBody(element) {
          return element === win || (/^(?:body|html)$/i).test(element.tagName)
        }
      
        function getWindowScroll() {
          return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
        }
      
        function createScriptFromHtml(html) {
          var scriptEl = document.createElement('script')
            , matches = html.match(simpleScriptTagRe)
          scriptEl.src = matches[1]
          return scriptEl
        }
      
        /**
         * @param {Array.<Element>|Element|Node|string} els
         * @return {Bonzo}
         */
        function bonzo(els) {
          return new Bonzo(els)
        }
      
        bonzo.setQueryEngine = function (q) {
          query = q;
          delete bonzo.setQueryEngine
        }
      
        bonzo.aug = function (o, target) {
          // for those standalone bonzo users. this love is for you.
          for (var k in o) {
            o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
          }
        }
      
        bonzo.create = function (node) {
          // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
          return typeof node == 'string' && node !== '' ?
            function () {
              if (simpleScriptTagRe.test(node)) return [createScriptFromHtml(node)]
              var tag = node.match(/^\s*<([^\s>]+)/)
                , el = doc.createElement('div')
                , els = []
                , p = tag ? tagMap[tag[1].toLowerCase()] : null
                , dep = p ? p[2] + 1 : 1
                , ns = p && p[3]
                , pn = parentNode
      
              el.innerHTML = p ? (p[0] + node + p[1]) : node
              while (dep--) el = el.firstChild
              // for IE NoScope, we may insert cruft at the begining just to get it to work
              if (ns && el && el.nodeType !== 1) el = el.nextSibling
              do {
                if (!tag || el.nodeType == 1) {
                  els.push(el)
                }
              } while (el = el.nextSibling)
              // IE < 9 gives us a parentNode which messes up insert() check for cloning
              // `dep` > 1 can also cause problems with the insert() check (must do this last)
              each(els, function(el) { el[pn] && el[pn].removeChild(el) })
              return els
            }() : isNode(node) ? [node.cloneNode(true)] : []
        }
      
        bonzo.doc = function () {
          var vp = bonzo.viewport()
          return {
              width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
            , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
          }
        }
      
        bonzo.firstChild = function (el) {
          for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
            if (c[i].nodeType === 1) e = c[j = i]
          }
          return e
        }
      
        bonzo.viewport = function () {
          return {
              width: win.innerWidth
            , height: win.innerHeight
          }
        }
      
        bonzo.isAncestor = 'compareDocumentPosition' in html ?
          function (container, element) {
            return (container.compareDocumentPosition(element) & 16) == 16
          } :
          function (container, element) {
            return container !== element && container.contains(element);
          }
      
        return bonzo
      }); // the only line we care about using a semi-colon. placed here for concatenation tools
      
    },
    'src/ender': function (module, exports, require, global) {
      (function ($) {
      
        var b = require('bonzo')
        b.setQueryEngine($)
        $.ender(b)
        $.ender(b(), true)
        $.ender({
          create: function (node) {
            return $(b.create(node))
          }
        })
      
        $.id = function (id) {
          return $([document.getElementById(id)])
        }
      
        function indexOf(ar, val) {
          for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
          return -1
        }
      
        function uniq(ar) {
          var r = [], i = 0, j = 0, k, item, inIt
          for (; item = ar[i]; ++i) {
            inIt = false
            for (k = 0; k < r.length; ++k) {
              if (r[k] === item) {
                inIt = true; break
              }
            }
            if (!inIt) r[j++] = item
          }
          return r
        }
      
        $.ender({
          parents: function (selector, closest) {
            if (!this.length) return this
            if (!selector) selector = '*'
            var collection = $(selector), j, k, p, r = []
            for (j = 0, k = this.length; j < k; j++) {
              p = this[j]
              while (p = p.parentNode) {
                if (~indexOf(collection, p)) {
                  r.push(p)
                  if (closest) break;
                }
              }
            }
            return $(uniq(r))
          }
      
        , parent: function() {
            return $(uniq(b(this).parent()))
          }
      
        , closest: function (selector) {
            return this.parents(selector, true)
          }
      
        , first: function () {
            return $(this.length ? this[0] : this)
          }
      
        , last: function () {
            return $(this.length ? this[this.length - 1] : [])
          }
      
        , next: function () {
            return $(b(this).next())
          }
      
        , previous: function () {
            return $(b(this).previous())
          }
      
        , related: function (t) {
            return $(b(this).related(t))
          }
      
        , appendTo: function (t) {
            return b(this.selector).appendTo(t, this)
          }
      
        , prependTo: function (t) {
            return b(this.selector).prependTo(t, this)
          }
      
        , insertAfter: function (t) {
            return b(this.selector).insertAfter(t, this)
          }
      
        , insertBefore: function (t) {
            return b(this.selector).insertBefore(t, this)
          }
      
        , clone: function () {
            return $(b(this).clone(this))
          }
      
        , siblings: function () {
            var i, l, p, r = []
            for (i = 0, l = this.length; i < l; i++) {
              p = this[i]
              while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
              p = this[i]
              while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
            }
            return $(r)
          }
      
        , children: function () {
            var i, l, el, r = []
            for (i = 0, l = this.length; i < l; i++) {
              if (!(el = b.firstChild(this[i]))) continue;
              r.push(el)
              while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
            }
            return $(uniq(r))
          }
      
        , height: function (v) {
            return dimension.call(this, 'height', v)
          }
      
        , width: function (v) {
            return dimension.call(this, 'width', v)
          }
        }, true)
      
        /**
         * @param {string} type either width or height
         * @param {number=} opt_v becomes a setter instead of a getter
         * @return {number}
         */
        function dimension(type, opt_v) {
          return typeof opt_v == 'undefined'
            ? b(this).dim()[type]
            : this.css(type, opt_v)
        }
      }(ender));
    }
  }, 'bonzo');

  require('underscore');
  require('sizzle');
  require('bonzo');
  require('bonzo/src/ender');

}.call(window));
//# sourceMappingURL=ender.js.map
