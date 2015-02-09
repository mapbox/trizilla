var aggregator = require('./lib/aggregator');
var inflater = require('./lib/inflater');

function streamOut(err, GeoJSON) {
  console.log(JSON.stringify(GeoJSON));
};

function eatStream(line) {
  try {
  var data = JSON.parse(line);
  aggregator.dataEater(data.key, data.attributes, 5, streamOut);
  } catch(err) { }
}

module.exports = {
  eatStream: eatStream,
  streamOut: streamOut
}