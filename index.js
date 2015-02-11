var util = require('util');
var Transform = require('stream').Transform;
var Aggregator = require('./lib/aggregator');
var inflator = require('./lib/inflator').inflate;
//var tiler = require('./lib/tiler');

module.exports = function() {
  var parentHolder = {}

  util.inherits(InflateStream, Transform);
  function InflateStream(minZ) { Transform.call(this, minZ); this.minZ = minZ; }
  // consume stream, inflate ∆s, and make parents
  InflateStream.prototype._transform = function(chunk, enc, callback) {

    try { var data = JSON.parse(chunk); }
    catch(err) { callback(err); }

    //console.log(Aggregator);
    this.push(inflator(data));
    minZ = this.minZ || (data.key.length-1)/2;
    if ((data.key.length-1)/2 > minZ) {
      console.log('aggregating!');
      var parent = data.key.substring(0, data.key.length-2);
      // Does the parent object already exist? if so, aggregate its values; if not, initialize one
      if (parentHolder[parent]) {
        parentHolder[parent].aggregate(data);
      } else {
        parentHolder[parent] = new Aggregator;
        parentHolder[parent].initialize(parent, data, function(err, child, pID) {
          if (err) throw err;
          this.push(inflator(child));
          parentHolder[pID] = {}
        });
      }
    }
    callback();
  }
  return {
    inflate: function(value) { return new InflateStream(value); }
    //tile: function() { return new TileStream(); }
  }
}
