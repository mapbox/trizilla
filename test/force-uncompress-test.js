var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');

tape('should force decompress a stream', function(t) {
  var all = [];
  fs.createReadStream('./test/fixtures/compressed-features',{autoClose: true})
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.decompress('ForceDecompressor'))
    .on('data', function(data) {
      all.push(JSON.parse(data));
  }).on('end', function(td) {
    t.ok(trizilla, 'stream force uncompressed, checking')
    var expected = [{
      qt: 's0s3s3s3s3s3s3s',
      attributes: {band_2: '4.64', band_1: '28.03'}
    }];
    t.deepEqual(all, expected);
    t.end();
  });
});