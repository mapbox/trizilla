process.stdin.pipe(require('split')()).on('data', processLine)

var holder = {}

process.stdin.on('end', function() {
    console.log(holder);
});

var Aggregator = function() {};

Aggregator.prototype = {
    aggregate: function(val) {
        this.value += val;
        this.count++
        if (this.count === 4) {
            this.outputVal('')
        }
    },
    setCallback: function(ID, callback) {
        this.callback = callback;
        this.ID = ID;
    },
    outputVal: function(format) {
        return this.callback(null, this.value / 4, this.ID);
    },
    value: 0,
    count: 0
}

function processLine (line) {
    try {
        var tO = JSON.parse(line);
        var parent = tO.key.substring(0, tO.key.length-2)
        if (holder[parent]) {
            for (var a in tO.attributes) {
                holder[parent].aggregate(tO.attributes[a]);
            }
        } else {
            for (var a in tO.attributes) {
                holder[parent] = new Aggregator;
                holder[parent].setCallback(parent, function(err, data, ID) {
                    console.log(ID + ': ' + data);
                    delete holder[ID];
                });
                holder[parent].aggregate(tO.attributes[a]);
            }
        }
    } catch(err) {
        console.log(err);
    }
}

