var util = require('util');

var Transform = require('stream').Transform;
var Aggregator = require('./lib/aggregator');
var tiler = require('./lib/tiler');
var inflator = require('./lib/inflator');
var Compress = require('./lib/compressor');
var tileMaker = require('./lib/maketile');

module.exports = function() {

  util.inherits(InflateStream, Transform);
  function InflateStream(minZ) {
    Transform.call(this, minZ); this.minZ = minZ;
    this.parentHolder = {};
  }

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

      if (inflateStream.parentHolder[parent]) {
        inflateStream.parentHolder[parent].aggregate(data.attributes);
      } else {
        inflateStream.parentHolder[parent] = new Aggregator();
        inflateStream.parentHolder[parent].initialize(parent, data.attributes, function(err, child, pID) {
          if (err) callback(err);

          var pdata = { "qt": pID, "attributes": child };
          inflateStream.push(inflator(pdata));

          if ((pID.length-1)/2 > minZ) agg(pdata);

          inflateStream.parentHolder[pID] = false;
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
    this._readableState.objectMode = true;
    this._writableState.objectMode = true;
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
        layTileStream.tileHolder.tiles[tileObj.quadtree] = false;
      });
    }
    callback()
  };

  LayTileStream.prototype._flush = function(done) {
    for (var i in this.tileHolder.tiles) {
      if (this.tileHolder.tiles[i]) {
        this.tileHolder.tiles[i].flushFeatures();
      }
    }
    done();
  }

  util.inherits(GZIPstream, Transform);

  function GZIPstream() {
    Transform.call(this,{});
    this._writableState.objectMode = true;
    this._readableState.objectMode = true;
    this._buffer = [];
  }

  GZIPstream.prototype._transform = function(chunk, enc, callback) {
    var GZIPstream = this;
    var data = GZIPstream._buffer.pop();
    if (data) GZIPstream.push(data + '\n');

    tileMaker.makeTile(chunk, function(err, tile) {
      if (err) callback(err)
      GZIPstream._buffer.push(tile);
      callback();
    });
  };

  GZIPstream.prototype._flush = function(callback) {
    var data = this._buffer.pop();
    if (data) this.push(data);
    callback();
  }

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
  function DecompressStream(dcType) {
    Transform.call(this, dcType);
    if (!dcType || (dcType !== 'Decompressor' && dcType !== 'ForceDecompressor')) {
      dcType = 'Decompressor'
    }
    this.dcType = dcType
  }

  DecompressStream.prototype._transform = function(chunk, enc, callback) {
    if (!chunk.toString()) return callback();
    var decompStream = this;
    var data;
    try {
      data = JSON.parse(chunk);
    } catch(err) { callback(err); }
    var dc = new Compress[this.dcType]()
    dc.decompress(data, function(err, outData) {
      if (err) callback(err);

      for (var i = 0; i < outData.length; i++) {
        decompStream.push(JSON.stringify(outData[i]) + '\n');
      }

      callback();
    });
  };

  return {
    inflate: function(value) { return new InflateStream(value); },
    tile: function(delta) { return new LayTileStream(delta); },
    clean: function(options) { return new CleanStream(options); },
    compress: function(levels, featRounding) { return new CompressStream(levels, featRounding); },
    decompress: function(decompressType) {return new DecompressStream(decompressType)},
    gzip: function() { return new GZIPstream(); }
  };
};
