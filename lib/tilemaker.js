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
  initialize: function( GeoJSON, tileQuad, featureCount, callback) {
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

};

var tiler = false;

function initTiler(zoomDelta, callback) {
  tiler = {
    tiles: {},
    zoomDelta: zoomDelta,
    featureCount: Math.pow(4, zoomDelta) * 2,
    callback: callback
  };
}

function getTile(GeoJSON) {
  if (!tiler) {
    throw Error('The tiler must be initialized first: tilemaker.initTiler(<zoomDelta, callback)');
  }
  var qti = GeoJSON.properties.qtid.match(/[0-9]/g).join('');
  var tileQuad = qti.substring(0, qti.length - tiler.zoomDelta);
  if (tiler.tiles[tileQuad]) {
    tiler.tiles[tileQuad].addFeature(GeoJSON);
  } else {
    tiler.tiles[tileQuad] = new Tile();
    tiler.tiles[tileQuad].initialize(GeoJSON, tileQuad, tiler.featureCount, tiler.callback);
  }
}

function flushTiles() {
  if (!tiler) {
    throw Error('The tiler must be initialized first: tilemaker.initTiler(<zoomDelta, callback)');
  }
  for (var i in tiler.tiles) {
      tiler.tiles[i].flushFeatures();
  }
}

module.exports = {
  initTiler: initTiler,
  getTile: getTile,
  flushTiles: flushTiles
};