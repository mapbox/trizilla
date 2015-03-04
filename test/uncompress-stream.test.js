var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');

tape('should decompress a stream', function(t) {
  var all = [];
  fs.createReadStream('./test/fixtures/compressed-features',{autoClose: true})
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.decompress('Decompressor'))
    .on('data', function(data) {
      all.push(JSON.parse(data));
  }).on('end', function(td) {
    t.ok(trizilla, 'stream force uncompressed, checking')
    var expected = JSON.parse(fs.readFileSync('./test/fixtures/uncompressed-expected'));
    t.deepEqual(all, expected);
    t.end();
  });
});