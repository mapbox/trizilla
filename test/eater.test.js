var split = require('split')();
var trizilla = require('../index');

process.stdin.pipe(split)
    .on('data', trizilla.inflate)
    .pipe(trizilla.tiler)
    .pipe(process.stdout);
    // outputs tile-sized geojsons