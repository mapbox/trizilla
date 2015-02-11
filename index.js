var aggregator = require('./lib/aggregator');
var inflater = require('./lib/inflater');
var tilemaker = require('./lib/tilemaker');

function eat(line, callback) {
  try {
  var data = JSON.parse(line);
  aggregator.dataEater(data.key, data.attributes, 5, function(err, GeoJSON) {
    if (err) throw err;
    callback(GeoJSON)
  });
  } catch(err) { }
}

module.exports = {
  eat: eat,
  layTiles: tilemaker
}