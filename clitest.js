process.stdin.pipe(require('split')()).on('data', processLine)

var holder = {}

process.stdin.on('end', function() {
    console.log(holder);
});

var Aggregator = function() {};

Aggregator.prototype = {
    aggregate: function(vals) {
        this.count++
        for (var i in vals) {
            this.values[i] += vals[i]
        }
        if (this.count === 4) {
            this.outputVals();
        }
    },
    initialize: function(ID, vals, callback) {
        this.callback = callback;
        this.ID = ID;
        this.values = vals;
        this.count++
    },
    outputVals: function(format) {
        for (var i in this.values) {
            this.values[i] /= 4;
        }
        return this.callback(null, this.values, this.ID);
    },
    values: [],
    count: 0
}

function getParents(ID, count) {
    var parents = [];
    for(var i = 0; i < count; i++) {
        parents.push(ID.substring(0, ID.length - (i * 2 + 2)));
    }
    return parents;
}


function processLine(line) {
    try {
        var tO = JSON.parse(line);
        var parent = tO.key.substring(0, tO.key.length-2)
        if (holder[parent]) {
            holder[parent].aggregate(tO.attributes);
        } else {
            holder[parent] = new Aggregator;
            holder[parent].initialize(parent, tO.attributes, function(err, data, ID) {
                console.log(ID + ': ' + JSON.stringify(data));
                delete holder[ID];
            });
        }
    } catch(err) {
        console.log(err);
    }
}

