var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');
var Protobuf = require('pbf');
var VectorTile = require('vector-tile').VectorTile;
var zlib = require('zlib');

tape('should load, parse, inflate, tile, and serialize a stream', function(t) {
  var actualData = [];
  fs.createReadStream('./test/fixtures/fill-facets-output')
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.compress(3, {}))
    .pipe(trizilla.decompress({}))
    .pipe(trizilla.inflate(5))
    .pipe(trizilla.tile(3))
    .pipe(trizilla.gzip())
    .on('data', function(tile) {
      actualData.push({});
      tile = JSON.parse(tile);

      var parsed = new Buffer(tile.buffer, 'base64');

      zlib.gunzip(parsed, function(err, data) {
        if (err) throw (err);
        var vtile = new VectorTile(new Protobuf(data));
        actualData[actualData.length - 1].extent = vtile.layers.now.extent;
        actualData[actualData.length - 1].name = vtile.layers.now.name;

        actualData[actualData.length - 1].length = vtile.layers.now.length;

        var actualFeatures = {};
        var actualTypes = [];

        for (var i = 0; i < vtile.layers.now.length; i ++) {
          actualFeatures[JSON.stringify(vtile.layers.now.feature(i).loadGeometry())] = JSON.stringify(vtile.layers.now.feature(i).loadGeometry())
          actualTypes.push(vtile.layers.now.feature(i).type)
        }

        actualData[actualData.length - 1].features = actualFeatures;
        actualData[actualData.length - 1].types = actualTypes;


      });
  })
  .on('finish', function() {
      var expectedData = JSON.parse(fs.readFileSync('./test/fixtures/index-features-expected'));
      t.ok(trizilla, 'processed, checking');
      for (var i = 0; i < actualData.length; i ++) {
        t.deepLooseEqual(actualData[i], expectedData[i]);
      }
      t.end();
  })
});