var trizilla_tiler = require('../lib/tiler');
var fs = require('fs');
var JSONStream = require('JSONStream');
var split = require('split')();
var tape = require('tape');

function tileCallback(err, tileData) {
  tape('should match the tiled feature', function{})
  JSON.stringify(tileData)
  var expected = fs.readFileSync('./test/fixtures/laytile-expected.txt').toString();
  console.log(expected)
}

var stream = fs.createReadStream('./test/fixtures/trigeojsonstream.txt');

var parser = JSONStream.parse();

stream.pipe(parser);

var tri_tiler = new trizilla_tiler.Tile()

var firstTime = true;

parser.on('root', function (GeoJSON) {
  if (firstTime) {
    firstTime = false;
    tri_tiler.initialize(GeoJSON, '0', 131072, tileCallback)
  } else {
    tri_tiler.addFeature(GeoJSON)
  }
});


