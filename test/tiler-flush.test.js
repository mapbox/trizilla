var trizilla_tiler = require('../lib/tiler');
var fs = require('fs');
var JSONStream = require('JSONStream');
var split = require('split')();
var tape = require('tape');

var stream = fs.createReadStream('./test/fixtures/tri-geojson-stream');

var parser = JSONStream.parse();

stream.pipe(parser);

var tri_tiler = new trizilla_tiler.Tile()

function tileCallback(err, tileData) {
  tape('should match the tiled feature', function(t) {
    t.ok(tri_tiler, 'is inflating');
    var expected = JSON.parse(fs.readFileSync('./test/fixtures/laytile-flush-expected'));
    t.deepEqual(
      tileData,
      expected
    );

    t.end();
  })
}

var firstTime = true;
var count = 0;

parser.on('root', function (GeoJSON) {
  if (firstTime) {
    firstTime = false;
    tri_tiler.initialize(GeoJSON, '021333303', 128, tileCallback)
  } else {
    if (count < 50) {
      tri_tiler.addFeature(GeoJSON);
    }
  }
  count ++
}).on('end', function() {
  tri_tiler.flushFeatures();
});
