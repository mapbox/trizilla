var inflater = require('./inflator')

// Object to hold aggregations; dumped when agg is complete
var parentHolder = {};

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
  },
  outputVals: function(format) {
    for (var i in this.values) {
      this.values[i] /= 4;
    }
    return this.callback(null, this.values, this.ID);
  },
  values: [],
  count: 1
};

// Get a parent and aggregate it, then stream it
module.exports.aggregate = function(data, ID, minZ, outputFunction) {
  var parent = ID.substring(0, ID.length-2);
  // Does the parent object already exist? if so, aggregate its values; if not, initialize one
  if (parentHolder[parent]) {
    parentHolder[parent].aggregate(data);
  } else {
    parentHolder[parent] = new Aggregator();
    parentHolder[parent].initialize(parent, data, function(err, child, pID) {
      dataEater(pID, child, minZ, outputFunction);
      parentHolder[pID] = {}
    });
  }
}

