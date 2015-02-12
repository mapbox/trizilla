var tilebelt = require('tilebelt');

var Tile = function() {};
Tile.prototype = {
  addFeature: function(GeoJSON) {
    this.features.push(GeoJSON);
    if (this.features.length === this.featureCount) {
      this.flushed = true;
      this.outputTile();
    }
  },
  initialize: function(GeoJSON, tileQuad, featureCount, callback) {
    this.callback = callback;
    this.featureCount = featureCount;
    this.features = [GeoJSON];
    this.quadtree = tileQuad;
    this.xyz = tilebelt.quadkeyToTile(tileQuad);
    this.flushed = false;
  },
  flushFeatures: function() {
    if (!this.flushed) {
      this.outputTile();
    }
  },
  outputTile: function() {
    return this.callback(null, {
      xyz: this.xyz,
      quadtree: this.quadtree,
      features: this.features
    });
  }
}

var Tiler = function(delta) {
  this.zoomDelta = delta;
  this.tiles = {},
  this.featureCount = Math.pow(4, this.zoomDelta) * 2
  return this;
}

function flush () {
  if (!tiler) {
    throw Error('The tiler must be initialized first: tilemaker.initTiler(<zoomDelta, callback)');
  }
  for (var i in tiler.tiles) {
      tiler.tiles[i].flushFeatures();
  }
}

module.exports.Tile = Tile;
module.exports.Tiler = Tiler;
module.exports.flush = flush;