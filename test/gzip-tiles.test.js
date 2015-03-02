var trizilla_tilemaker = require('../lib/maketile');
var fs = require('fs');
var tape = require('tape');
var Protobuf = require('pbf');
var VectorTile = require('vector-tile').VectorTile;
var zlib = require('zlib');

function tileTester(err, tile) {
  tape('should create a valid vector tile', function(t) {

    if (err) throw (err);
    tile = JSON.parse(tile);

    var parsed = new Buffer(tile.buffer, 'base64');

    zlib.gunzip(parsed, function(err, data) {
      if (err) throw (err);

      t.ok(trizilla_tilemaker, 'data unserialized and gunzipped');
      
      var vtile = new VectorTile(new Protobuf(data));

      var expected = fs.readFileSync('./test/fixtures/gzip-tiles-expected').toString();

      t.equal(JSON.stringify(vtile), expected);

      t.end();
    });
  });
}

fs.readFile('./test/fixtures/laytile-expected', function(err, data) {
  if (err) throw (err);
  trizilla_tilemaker.makeTile(JSON.parse(data), tileTester);
})
