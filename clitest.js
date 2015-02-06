var split = require('split')();
var aggregator = require('./lib/aggregator.js');

process.stdin.pipe(split)
    .on('data', aggregator.processLine);

process.stdin.on('end', function() {
});