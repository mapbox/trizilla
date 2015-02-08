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

// Get a parent and aggregate it
function getParent(data, ID, callback) {
  var parent = ID.substring(0, ID.length-2);
  // Does the object exist? if so, aggregate its values; if not, initialize one
  if (holder[parent]) {
    holder[parent].aggregate(data);
  } else {
    holder[parent] = new Aggregator();
    holder[parent].initialize(parent, data, function(err, child, pID) {
      // console.log(pID)
      inflater.inflate(pID, child, function(err, GeoJSON) {
        callback(null, GeoJSON)
      });
      handleParent(child, pID);
    });
  }
}

// Handle the parent (as an intermediary)
function handleParent(data, ID) {
  if (ID.length > 4) {
    getParent(data, ID, function(err, GeoJSON) {
      console.log(JSON.stringify(GeoJSON));
    });
  }
}

module.exports = {
  handleParent: handleParent,
  getParent: getParent,
  holder: holder
}