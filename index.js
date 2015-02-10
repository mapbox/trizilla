var aggregator = require('./lib/aggregator');
var inflator = require('./lib/inflator');
//var tiler = require('./lib/tiler');

function streamOut(err, GeoJSON) {
  console.log(JSON.stringify(GeoJSON));
};

// consume stream, inflate ∆s, and make parents
function inflate(line, minZ) {

  try { var data = JSON.parse(line); }
  catch(err) { }

  inflator(data);

  minZ = minZ || (data.key.length-1)/2;
  if ((data.key.length-1)/2 > minZ) {
    aggregator(data, data.key, minZ);
  }

}

function tile() {
    // some tiling magic here
}

module.exports = {
  inflate: inflate,
  tile: tile
}