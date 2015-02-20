var fs = require('fs');
var tape = require('tape');
var inflator = require('../lib/inflator');

var data = {
    "attributes": {"band_1": 3.645732107301456},
    "qt": "n0n0n0n0n1n1n0n0n"
}

var expected = {
  "type":"Feature",
  "geometry":{
    "type":"Polygon",
    "coordinates":[
      [
        [-163.125,85.0511287798066],
        [-161.71875,84.92832092949963],
        [-161.71875,85.0511287798066],
        [-163.125,85.0511287798066]
      ]
    ]
  },
  "properties":{
    "band_1":3.645732107301456,
    "zE":8,
    "qt":"n0n0n0n0n1n1n0n0n"
  }
}

tape('should return a triangle', function(t) {
    var tri = inflator(data);
    t.ok(tri, 'got a triangle');
    t.equal(tri, JSON.stringify(expected));
    t.end();
});