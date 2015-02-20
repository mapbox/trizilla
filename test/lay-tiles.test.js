var trizilla_tiler = require('../lib/tiler');
var fs = require('fs');
var JSONStream = require('JSONStream');
var split = require('split')();
var tape = require('tape');

var stream = fs.createReadStream('./test/fixtures/trigeojsonstream.txt');

var parser = JSONStream.parse();

stream.pipe(parser);

var tri_tiler = new trizilla_tiler.Tile()

function tileCallback(err, tileData) {
  tape('should match the tiled feature', function(t) {
  t.ok(tri_tiler, 'is inflating');
  var expected = JSON.parse(fs.readFileSync('./test/fixtures/laytile-expected.txt'));
  t.equal(JSON.stringify(expected), JSON.stringify(tileData));
  t.end();
  })
}

var firstTime = true;

parser.on('root', function (GeoJSON) {
  if (firstTime) {
    firstTime = false;
    tri_tiler.initialize(GeoJSON, '0', 131072, tileCallback)
  } else {
    tri_tiler.addFeature(GeoJSON)
  }
});


