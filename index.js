var util = require('util');
var Transform = require('stream').Transform;
var aggregator = require('./lib/aggregator');
var inflator = require('./lib/inflator').inflate;
//var tiler = require('./lib/tiler');

var parentHolder = {}

util.inherits(InflateStream, Transform);
function InflateStream(minZ) { Transform.call(this, minZ) }

// consume stream, inflate ∆s, and make parents
InflateStream.prototype._transform = function(chunk, enc, callback) {

  try { var data = JSON.parse(chunk); }
  catch(err) { callback(err); }

  this.push(inflator(data));
  var minZ = minZ || (data.key.length-1)/2;
  if ((data.key.length-1)/2 > minZ) {
    var parent = ID.substring(0, ID.length-2);
    // Does the parent object already exist? if so, aggregate its values; if not, initialize one
    if (parentHolder[parent]) {
      parentHolder[parent].aggregate(data);
    } else {
      parentHolder[parent] = new Aggregator();
      parentHolder[parent].initialize(parent, data, function(err, child, pID) {
        if (err) throw err;
        this.push(inflator(child));
        parentHolder[pID] = {}
      });
    }
  }
  callback();
}

function tile() {
    // some tiling magic here
}

module.exports = {
  inflate: function() { return new InflateStream(); },
  tile: function() { return new TileStream(); },
}