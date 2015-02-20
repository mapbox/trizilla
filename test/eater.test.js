var split = require('split')();
var trizilla = require('../index')();

process.stdin.pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.inflate(5))
    .pipe(trizilla.tile(5))
    .pipe(trizilla.serialize())
    .pipe(process.stdout);