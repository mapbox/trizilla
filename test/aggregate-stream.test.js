var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');

tape('should properly inflate a stream of features', function(t) {
  var all = [];
  fs.createReadStream('./test/fixtures/data-stream',{autoClose: true})
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.inflate(5))
    .on('data', function(data) {
      all.push(JSON.parse(data));
  }).on('end', function(td) {
    t.ok(trizilla, 'inflating');
    var expected = fs.readFileSync('./test/fixtures/inflated-features').toString();
    t.deepEqual(all, JSON.parse(expected), 'inflated features match expected');
    t.end();
  });
});