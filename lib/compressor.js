// The Compressor - for each attribute, sums values, and when 4 are reached,
// it outputs each / 4 (== average), and sends these + the id to kill the object
var Compressor = function() {};

Compressor.prototype = {
  aggregate: function(obj) {
    this.count++;
    this.sQt.push(obj.qt.slice(obj.qt.length - this.levels * 2, obj.qt.length));
    for (var v in this.fields) {
      if (obj.attributes[v]) {
        this.fields[v].push(obj.attributes[v].toFixed(featRounding));
      } else {
        this.fields[v].push(null);
      }
    }
    if (this.count == this.totals) {
      this.outputVals()
    }
  },
  initialize: function(obj, levels, featRounding, callback) {
    this.levels = levels;
    this.callback = callback;
    this.qt = obj.qt.slice(0, obj.qt.length - levels * 2);
    this.sQt = [obj.qt.slice(obj.qt.length - levels * 2, obj.qt.length)]
    for (var v in obj.attributes) {
      this.fields[v] = [obj.attributes[v].toFixed(featRounding)];
    }
    this.count = 1;
    this.totals = Math.pow(4, levels); 
  },
  outputVals: function() {
    var output = {
      qt: this.qt,
      sQts: JSON.stringify(this.sQt)
    }
    for (var v in this.fields) {
      output[v] = JSON.stringify(this.fields[v]);
    }
    return this.callback(null, output, this.qt);
  },
  sQt: [],
  fields: {}
};

var test = [{"attributes": {"snod": 0.10312407660280432, "temp": -12.840119364326846}, "qt": "s0s2s1s3n3n3n3n0n0n0n0n"},
  {"attributes": {"snod": 0.10216937552584941, "temp": -13.061976109449052}, "qt": "s0s2s1s3n3n3n3n0n0n0n1n"},
  {"attributes": {"snod": 0.09859013442917666, "temp": -13.087313093454124}, "qt": "s0s2s1s3n3n3n3n0n0n0n1s"},
  {"attributes": {"snod": 0.09545490287325326, "temp": -13.004261364300643}, "qt": "s0s2s1s3n3n3n3n0n0n0n3n"}
];

// Get a parent and aggregate it, then stream it
// module.exports = Compressor;



// c.initialize(test[0], 1, 2, function(err, data, dQt){
//   console.log(data);
// });

// c.aggregate(test[1]);
// c.aggregate(test[2]);
// c.aggregate(test[3]);

var CompressStream = {
  initialize: function(levels) {
    this.levels = levels;
    this.compressed = {};
    this.featureCount = Math.pow(4, levels);
  },
  getData: function(data) {
    var qt = data.qt.slice(0, data.qt.length - this.levels * 2);
    if (this.compressed[qt]) {
      this.compressed[qt] = new Compressor();
      this.compressed[qt].initialize(data, this.levels, 2, function(err, out, dQt) {
        console.log(out);
      });
    } else {
      this.compressed[qt].aggregate(data);
    }
  }
}

function flush () {
  if (!tiler) {
    throw Error('The tiler must be initialized first: tilemaker.initTiler(<zoomDelta, callback)');
  }
  for (var i in CompressStream.compressed) {
      CompressStream.compressed[i].flushFeatures();
  }
}

var fs = require('fs');
var split = require('split')();

CompressStream.initialize(1)

fs.createReadStream('./test/fixtures/fill-facets-output')
  .pipe(split)
  .on('data', function(data) {
    data = JSON.parse(data);
    CompressStream.getData(data)
  })

// module.exports.Tile = Tile;
// module.exports.Tiler = Tiler;
// module.exports.flush = flush;




