var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');

tape('should not properly inflate a stream of features', function(t) {
  var all = [];
  fs.createReadStream('./test/fixtures/data-stream',{autoClose: true})
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.inflate(6))
    .on('data', function(data) {
      all.push(JSON.parse(data));
  }).on('end', function(td) {
    t.ok(trizilla, 'inflating');
    var expected = fs.readFileSync('./test/fixtures/inflated-features').toString();
    t.notDeepEqual(all, JSON.parse(expected), 'inflated features should NOT match expected');
    t.end();
  });
});