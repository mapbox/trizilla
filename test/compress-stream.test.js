var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');

tape('should compress a stream', function(t) {
  var all = [];
  fs.createReadStream('./test/fixtures/data-stream',{autoClose: true})
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.compress(2, {}))
    .on('data', function(data) {
      all.push(JSON.parse(data));
  }).on('error', function(err) {
    console.log(err);
  }).on('end', function(td) {
    t.ok(trizilla, 'stream compressed, checking')
    var expected = fs.readFileSync('./test/fixtures/compressed-expected').toString();
    t.deepEqual(all, JSON.parse(expected));
    t.end();
  });
});