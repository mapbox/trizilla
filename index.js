var aggregator = require('./lib/aggregator');
var tiler = require('./lib/tiler');

function streamOut(err, GeoJSON) {
  console.log(JSON.stringify(GeoJSON));
};

function inflate(line, minzoom) {
  minzoom = minzoom || data.key.length/2 - 1;
  try {
  var data = JSON.parse(line);
  aggregator.dataEater(data.key, data.attributes, minzoom, streamOut);
  } catch(err) { }
}

function tile() {
    // some tiling magic here
}

module.exports = {
  inflate: inflate,
  tile: tile
}