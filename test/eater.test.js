var split = require('split')();
var trizilla = require('../index')();

process.stdin.pipe(split)
    .pipe(trizilla.inflate(3))
    .pipe(process.stdout);
    //.pipe(trizilla.tiler)
    // outputs tile-sized geojsons