var util = require('util');
var path = require('path');
var zlib = require('zlib');
var mapnik = require('mapnik');
var Transform = require('stream').Transform;
var Aggregator = require('./lib/aggregator');
var tiler = require('./lib/tiler');
var inflator = require('./lib/inflator');
mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'ogr.input'));

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

    var qti = data.properties.qt.match(/[0-9]/g).join('');
    var tileQuad = qti.substring(0, qti.length - tileHolder.zoomDelta);
    if (tileHolder.tiles[tileQuad]) {
      tileHolder.tiles[tileQuad].addFeature(data);
    } else {
      tileHolder.tiles[tileQuad] = new tiler.Tile();
      tileHolder.tiles[tileQuad].initialize(data, tileQuad, tileHolder.featureCount, function(err, tileObj) {
        if (err) throw err;
        makeTile(tileObj, function(err, serialTile) {
          layTileStream.push(serialTile);
        });
      });
    }
    callback();
  }

  return {
    inflate: function(value) { return new InflateStream(value); },
    tile: function(delta) { return new LayTileStream(delta); }
  }
}

function makeTile(t, callback) {
  var geojson = {
    "type": "FeatureCollection",
    "features": t.features
  }
  var vtile = new mapnik.VectorTile(t.xyz[2],t.xyz[0],t.xyz[1]);
  vtile.addGeoJSON(JSON.stringify(geojson), "now");
  zipTile(vtile, function(err, buf) {
    if (err) return callback(err);
    var serialObj = {
      z: t.xyz[2],
      x: t.xyz[0],
      y: t.xyz[1],
      buffer: buf.toString('base64')
    }
    return callback(null, JSON.stringify(serialObj));
  });
}

function zipTile(vtile, callback) {
  zlib.gzip(vtile.getData(), function(err, buffer) {
    if (err) return callback(err);
    return callback(null, buffer);
  });
}