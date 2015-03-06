var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');

tape('should decompress a stream', function(t) {
  var all = [];
  fs.createReadStream('./test/fixtures/unclean-stream',{autoClose: true})
    .pipe(split)
    .pipe(trizilla.clean({}))
    .on('data', function(data) {
      all.push(JSON.parse(data));
  }).on('end', function(td) {
    t.ok(trizilla, 'stream force uncompressed, checking')
    var expected = JSON.parse(fs.readFileSync('./test/fixtures/clean-stream'));
    t.deepEqual(all, expected, 'stream should be clean');
    t.end();
  });
});