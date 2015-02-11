var trizilla = require('../index');

function tileCallback(err, tileData) {
  console.log(tileData);
}

trizilla.layTiles.initTiler(3, tileCallback);

var input = '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-174.375,84.54136107313408],[-168.75,85.0511287798066],[-174.375,85.0511287798066],[-174.375,84.54136107313408]]]},"properties":{"band_1":4.298577568913235,"zEquiv":13,"qtid":"n0n0n0n0n0n1n"}}'

var GeoJSON = JSON.parse(input);

trizilla.layTiles.getTile(GeoJSON)

trizilla.layTiles.flushTiles();


