var tape = require('tape');
var inflator = require('../lib/inflator').inflate;

var data = {
    "attributes": {"band_1": 3.645732107301456},
    "key": "n0n0n0n0n1n1n0n0n"
}

tape('should return a triangle', function() {
    var tri = inflator(data);
});