var split = require('split')();
var trizilla = require('../index')();

process.stdin.pipe(split)
    .pipe(trizilla.inflate(5))
    .pipe(trizilla.tile(2))
    .pipe(process.stdout);
    // outputs tile-sized geojsons
