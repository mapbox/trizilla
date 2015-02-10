var aggregator = require('./lib/aggregator');
var inflater = require('./lib/inflater');

function eat(line) {
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
}