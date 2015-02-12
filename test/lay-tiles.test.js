var trizilla = require('../index');
var fs = require('fs');
var JSONStream = require('JSONStream');

function tileCallback(err, tileData) {
  console.log(JSON.stringify(tileData));
}

var stream = fs.createReadStream('./test/fixtures/trigeojsonstream.txt');

var parser = JSONStream.parse();

stream.pipe(parser);

trizilla.layTiles.initTiler(5, tileCallback);

parser.on('root', function (GeoJSON) {
  GeoJSON.properties.qtid = GeoJSON.properties.quadtree;
  trizilla.layTiles.getTile(GeoJSON);
});

trizilla.layTiles.flushTiles();


