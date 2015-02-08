var aggregator = require('./lib/aggregator');
var inflater = require('./lib/inflater');

function eatStream(line) {
  try {
    var data = JSON.parse(line);
    var parent = data.key.substring(0, data.key.length-2);
    aggregator.handleParent(data.attributes, parent);
  } catch(err) { }
}

module.exports = {
    eatStream: eatStream,
    holder: aggregator.holder
}