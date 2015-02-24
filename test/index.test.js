var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');
var UPDATE = process.env.UPDATE;

tape('should load, parse, inflate, tile, and serialize a stream', function(t) {
  fs.createReadStream('./test/fixtures/fill-facets-output')
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.inflate(5))
    .pipe(trizilla.tile(3))
    .on('data', function(data) {
      t.ok(trizilla, 'processed, checking')
      if (UPDATE) fs.writeFileSync('./test/fixtures/eater-test-expected', data);
      var expected = fs.readFileSync('./test/fixtures/eater-test-expected').toString();
      var data = JSON.stringify(JSON.parse(data));
      t.equal(data, expected);
      t.end();
  });
});