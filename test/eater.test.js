var split = require('split')();
var trizilla = require('../index');

process.stdin.pipe(split)
    .on('data', trizilla.eatStream)
    // .on('data', function(chunk){
    //     try { var data = JSON.parse(chunk); }
    //     catch(e) { throw e; }
    //     console.log(data.key.length)
    // });