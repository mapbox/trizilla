var trizilla_tilemaker = require('../lib/maketile');
var fs = require('fs');
var tape = require('tape');
var Protobuf = require('pbf');
var VectorTile = require('vector-tile').VectorTile;

function tileTester(err, data) {
  var vtile = new VectorTile(new Protobuf(JSON.parse(data)));
  console.log(vtile)
}

fs.readFile('./test/fixtures/laytile-expected', tileTester)