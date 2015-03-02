var trizilla_tilemaker = require('../lib/maketile');
var fs = require('fs');
var tape = require('tape');
var Protobuf = require('pbf');
var VectorTile = require('vector-tile').VectorTile;

function tileTester(err, data) {
  var pbf = new Protobuf(data);
  var vtile = new VectorTile(pbf);
  console.log(vtile.layers);
}

fs.readFile('./test/fixtures/laytile-expected', tileTester)