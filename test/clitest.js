var split = require('split')();
var trizilla = require('../index');

process.stdin.pipe(split)
    .on('data', trizilla.eatStream);

process.stdin.on('end', function() {

});