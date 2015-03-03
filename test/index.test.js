var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');
var UPDATE = process.env.UPDATE;

tape('should load, parse, inflate, tile, and serialize a stream', function(t) {
  fs.createReadStream('./test/fixtures/fill-facets-output')
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.compress(3, {}))
    .pipe(trizilla.decompress({}))
    .pipe(trizilla.inflate(5))
    .pipe(trizilla.tile(3))
    .pipe(trizilla.gzip())
    .on('data', function(data) {
      t.ok(trizilla, 'processed, checking')

      var expected = JSON.parse(fs.readFileSync('./test/fixtures/index-expected'));

      t.deepLooseEqual(data, expected);
      t.end();
  });
});