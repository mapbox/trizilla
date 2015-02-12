var util = require('util');
var Transform = require('stream').Transform;
var Aggregator = require('./lib/aggregator');
var tiler = require('./lib/tiler');
var inflator = require('./lib/inflator').inflate;

module.exports = function() {
  var parentHolder = {}

  util.inherits(InflateStream, Transform);
  function InflateStream(minZ) { Transform.call(this, minZ); this.minZ = minZ; }
  // consume stream, inflate ∆s, and make parents
  InflateStream.prototype._transform = function(chunk, enc, callback) {
    var inflateStream = this;
    try { var data = JSON.parse(chunk); }
    catch(err) { callback(err); }

    inflateStream.push(inflator(data));
    minZ = inflateStream.minZ || (data.qt.length-1)/2;
    if ((data.qt.length-1)/2 > minZ) agg(data);

    function agg(data) {
      var parent = data.qt.substring(0, data.qt.length-2);
      // Does the parent object already exist? if so, aggregate its values; if not, initialize one
      if (parentHolder[parent]) {
        parentHolder[parent].aggregate(data.attributes);
      } else {
        parentHolder[parent] = new Aggregator();
        parentHolder[parent].initialize(parent, data.attributes, function(err, child, pID) {
          if (err) throw err;
          var pdata = { "qt": pID, "attributes": child }
          inflateStream.push(inflator(pdata));
          if ((pID.length-1)/2 > minZ) agg(pdata);
          parentHolder[pID] = {}
        });
      }
    }

    callback();
  }

  util.inherits(LayTileStream, Transform);
  function LayTileStream(delta) {
    Transform.call(this, delta);
    this.delta = delta;
    this.tileHolder = new tiler.Tiler(delta);
  }
  LayTileStream.prototype._transform = function(chunk, enc, callback) {
    var layTileStream = this;
    try { var data = JSON.parse(chunk); }
    catch(err) { callback(err); }
    delta = layTileStream.delta;
    tileHolder = layTileStream.tileHolder;
    //console.log(tileHolder)

    var qti = data.properties.qt.match(/[0-9]/g).join('');
    var tileQuad = qti.substring(0, qti.length - tileHolder.zoomDelta);
    if (tileHolder.tiles[tileQuad]) {
      tileHolder.tiles[tileQuad].addFeature(data);
    } else {
      tileHolder.tiles[tileQuad] = new tiler.Tile();
      tileHolder.tiles[tileQuad].initialize(data, tileQuad, tileHolder.featureCount, function(err, tile) {
        if (err) throw err;
        //console.log(tile);
        layTileStream.push(JSON.stringify(tile));
      });
    }
    callback();
  }

  return {
    inflate: function(value) { return new InflateStream(value); },
    tile: function(delta) { return new LayTileStream(delta); }
  }
}
