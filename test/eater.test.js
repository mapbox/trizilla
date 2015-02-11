var split = require('split')();
var trizilla = require('../index')();

process.stdin.pipe(split)
    .pipe(trizilla.inflate(5))
    .pipe(process.stdout);
    //.pipe(trizilla.tiler)
    // outputs tile-sized geojsons