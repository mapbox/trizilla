var aggregate = require('./lib/aggregator');
var inlate = require('./lib/inflator');
var tiler = require('./lib/tiler');

function streamOut(err, GeoJSON) {
  console.log(JSON.stringify(GeoJSON));
};

// consume stream, inflate ∆s, and make parents
function inflate(line, minzoom) {

  try { var data = JSON.parse(line); } catch(err) { }
  minzoom = minzoom || data.key.length/2 - 1;

  var triZ = (data.key.length-1)/2;
  inflate(data.key, data, triZ, function(err, GeoJSON) {
    outputFunction(null, GeoJSON)
  });

  if (triZ > minZ) {
    aggregate(data, data.key, minZ);
  }
}

function tile() {
    // some tiling magic here
}

module.exports = {
  inflate: inflate,
  tile: tile
}