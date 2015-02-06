var aggregator = require('./lib/aggregator');
var inflater = require('./lib/inflater');

function eatStream(line) {
  try {
    var data = JSON.parse(line);
    var parent = data.key.substring(0, data.key.length-2);
    aggregator.handleParent(data.attributes, parent);
  } catch(err) { }
}

function eatJSON(attributes, id) {
    var parent = id.substring(0, id.length-2);
    aggregator.handleParent(ttributes, parent);
}

module.exports = {
    eatStream: eatStream,
    eatJSON: eatJSON
}