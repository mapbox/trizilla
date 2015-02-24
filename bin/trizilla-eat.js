var split = require('split')();
var trizilla = require('../index')();

process.stdin.pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.compress(1))
    .pipe(trizilla.decompress({}))
    .pipe(trizilla.inflate(6))
    .pipe(process.stdout)