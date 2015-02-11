var fs = require('fs');
var tape = require('tape');
var inflator = require('../lib/inflator').inflate;

var data = {
    "attributes": {"band_1": 3.645732107301456},
    "key": "n0n0n0n0n1n1n0n0n"
}

tape('should return a triangle', function(t) {
    var tri = inflator(data);
    var geojson = JSON.parse(fs.readFileSync('./test/fixtures/inflator-output.json'));
    t.ok(tri, 'got a triganle');
    t.equal(JSON.stringify(tri), JSON.stringify(geojson));
    t.end();
});