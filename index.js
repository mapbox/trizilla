var util = require('util');
var path = require('path');
var zlib = require('zlib');
var mapnik = require('mapnik');
var Transform = require('stream').Transform;
var Aggregator = require('./lib/aggregator');
var tiler = require('./lib/tiler');
var inflator = require('./lib/inflator');
var Compress = require('./lib/compressor');
var Tile = require('tilelive').stream.Tile;

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'geojson.input'));

module.exports = function() {
  var parentHolder = {};

  util.inherits(InflateStream, Transform);
  function InflateStream(minZ) { Transform.call(this, minZ); this.minZ = minZ; }

  InflateStream.prototype._transform = function(chunk, enc, callback) {
    var inflateStream = this;
    var inData;
    try {
      inData = JSON.parse(chunk);
    } catch(err) { callback(err); }

    inflateStream.push(inflator(inData));
    var minZ = inflateStream.minZ || (inData.qt.length-1)/2;

    if ((inData.qt.length-1)/2 > minZ) agg(inData);

    function agg(data) {
      var parent = data.qt.substring(0, data.qt.length-2);

      if (parentHolder[parent]) {
        parentHolder[parent].aggregate(data.attributes);
      } else {
        parentHolder[parent] = new Aggregator();
        parentHolder[parent].initialize(parent, data.attributes, function(err, child, pID) {
          if (err) callback(err);

          var pdata = { "qt": pID, "attributes": child };
          inflateStream.push(inflator(pdata));

          if ((pID.length-1)/2 >= minZ) agg(pdata);

          parentHolder[pID] = {};
        });
      }
    }
    callback();
  };

  util.inherits(LayTileStream, Transform);
  function LayTileStream(delta) {
    Transform.call(this, {});

    this._writableState.objectMode = true;
    this._readableState.objectMode = true;

    this.delta = delta;
    this.tileHolder = new tiler.Tiler(delta);
  }

  LayTileStream.prototype._transform = function(chunk, enc, callback) {
    var layTileStream = this;
    var data;
    try {
      data = JSON.parse(chunk);
    } catch(err) { callback(err); }

    var qti = data.properties.qt.match(/[0-9]/g).join('');
    var tileQuad = qti.substring(0, qti.length - layTileStream.tileHolder.zoomDelta);

    if (layTileStream.tileHolder.tiles[tileQuad]) {
      layTileStream.tileHolder.tiles[tileQuad].addFeature(data);
    } else {
      layTileStream.tileHolder.tiles[tileQuad] = new tiler.Tile();
      layTileStream.tileHolder.tiles[tileQuad].initialize(data, tileQuad, layTileStream.tileHolder.featureCount, function(err, tileObj) {
        if (err) callback(err);
          layTileStream.push(tileObj);
      });
    }
    callback()
  };

  util.inherits(GZIPstream, Transform);

  function GZIPstream() {
    Transform.call(this,{});
    this._writableState.objectMode = true;
    this._readableState.objectMode = true;
  }

  GZIPstream.prototype._transform = function(chunk, enc, callback) {

    var GZIPstream = this;

    makeTile(chunk, function(err, tile) {
      if (err) callback(err)
      //console.log(tile);
      GZIPstream.push(tile+'\n');
      callback();
    });
  };

  util.inherits(CleanStream, Transform);
  function CleanStream(options) { Transform.call(this, options); }

  CleanStream.prototype._transform = function(chunk, enc, callback) {
    if (!chunk.toString()) { return callback(); }

    var data;

    try {
      data = JSON.parse(chunk);
    } catch(err) { return callback(); }

    this.push(JSON.stringify(data));

    callback();
  };

  util.inherits(CompressStream, Transform);
  function CompressStream(levels, featRounding) {
    Transform.call(this, levels);
    this.levels = levels;
    this.featRounding = featRounding
    this.compressionHolder = new Compress.StreamCompressor(levels);
  }

  CompressStream.prototype._transform = function(chunk, enc, callback) {
    var compStream = this;
    var data;
    try {
      data = JSON.parse(chunk);
    } catch(err) { callback(err); }

    var levels = compStream.levels
    var featRounding = compStream.featRounding

    var qt = data.qt.slice(0, data.qt.length - levels * 2);

    if (compStream.compressionHolder[qt]) {
      compStream.compressionHolder[qt].aggregate(data);
    } else {
      compStream.compressionHolder[qt] = new Compress.Compressor();
      compStream.compressionHolder[qt].initialize(data, levels, featRounding, function (err, out, dQt) {
        if (err) callback(err);
        compStream.push(JSON.stringify(out));
        compStream.compressionHolder[dQt] = true;
      });
    }
    callback();
  };

  util.inherits(DecompressStream, Transform);
  function DecompressStream(levels) {
    Transform.call(this, levels);
  }

  DecompressStream.prototype._transform = function(chunk, enc, callback) {
    var decompStream = this;
    var data;
    try {
      data = JSON.parse(chunk);
    } catch(err) { callback(err); }
    var dc = new Compress.Decompressor()
    dc.decompress(data, function(err, outData) {
      for (var i = 0; i < outData.length; i++) {
        decompStream.push(JSON.stringify(outData[i]) + '\n');
      }
    });

    callback();
  };

  return {
    inflate: function(value) { return new InflateStream(value); },
    tile: function(delta) { return new LayTileStream(delta); },
    clean: function(options) { return new CleanStream(options); },
    compress: function(levels, featRounding) { return new CompressStream(levels, featRounding); },
    decompress: function(levels) {return new DecompressStream(levels)},
    clean: function(options) { return new CleanStream(options); },
    gzip: function() { return new GZIPstream(); }
  };
};

function makeTile(t, callback) {
  var geojson = {
    "type": "FeatureCollection",
    "features": t.features
  };
  var vtile = new mapnik.VectorTile(t.xyz[2],t.xyz[0],t.xyz[1]);
  vtile.addGeoJSON(JSON.stringify(geojson), "now");

  zlib.gzip(vtile.getData(), function(err, buffer) {
    if (err) return callback(err);
    var tile = new Tile(t.xyz[2], t.xyz[0], t.xyz[1], buffer);
    tile.buffer = tile.buffer.toString('base64');
    return callback(null, JSON.stringify(tile));
  });

}
