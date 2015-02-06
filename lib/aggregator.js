var inflater = require('./inflater')

// Object to hold aggregations; dumped when agg is complete
var holder = {};

// The aggregator - for each attribute, sums values, and when 4 are reached,
// it outputs each / 4 (== average), and sends these + the id to kill the object
var Aggregator = function() {};

Aggregator.prototype = {
  aggregate: function(vals) {
    this.count++;
    for (var i in vals) {
      this.values[i] += vals[i];
    }
    if (this.count === 4) {
      this.outputVals();
    }
  },
  initialize: function(ID, vals, callback) {
    this.callback = callback;
    this.ID = ID;
    this.values = vals;
    this.count++;
  },
  outputVals: function(format) {
    for (var i in this.values) {
      this.values[i] /= 4;
    }
    return this.callback(null, this.values, this.ID);
  },
  values: [],
  count: 0
};

// Get a parent and aggregate it
function getParent(data, ID) {
  var parent = ID.substring(0, ID.length-2);
  // Does the object exist? if so, aggregate its values; if not, initialize one
  if (holder[parent]) {
    holder[parent].aggregate(data);
  } else {
    holder[parent] = new Aggregator();
    holder[parent].initialize(parent, data, function(err, child, ID) {
      // Log to stdout - prob should do this a more official way.
      // console.log(ID + ':' + JSON.stringify(child))
      inflater.inflate(ID, child);
      handleParent(child, ID);
    });
  }
}

// Handle the parent (as an intermediary)
function handleParent(data, ID) {
  if (ID.length > 14) {
    getParent(data, ID);
  }
  delete holder[ID];
}

// Process the line input and send to handleParent
function processLine(line) {
  try {
    var data = JSON.parse(line);
    var parent = data.key.substring(0, data.key.length-2);
    handleParent(data.attributes, parent);
  } catch(err) { }
}

module.exports = {
  processLine: processLine,
  getParent: getParent
}