tilebelt = require('tilebelt');

function parseID(id) {
  var tile = tilebelt.quadkeyToTile(id.match(/[0-9]/g).join(''));
  return {
    xyz: tile,
    direct: id.substring(id.length-1,id.length),
    orient: ((tile[0] + tile[1]) % 2) === 1,
    BBOX: tilebelt.tileToBBOX(tile)
  };
}

var Triangle = function() {};

Triangle.prototype = {
  feature: {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": []
        }
  },
  create: function(BBOX, direct, orient, callback) {
    switch(orient) {
      case false:
        switch(direct) {
          case 'n':
            this.feature.geometry.coordinates = [[
              [BBOX[0], BBOX[3]],
              [BBOX[2], BBOX[1]],
              [BBOX[2], BBOX[3]],
              [BBOX[0], BBOX[3]]
            ]];
            break;
          case 's':
            this.feature.geometry.coordinates = [[
              [BBOX[0], BBOX[3]],
              [BBOX[2], BBOX[1]],
              [BBOX[0], BBOX[1]],
              [BBOX[0], BBOX[3]]
            ]];
            break;
        }
        break;
      case true:
        switch(direct) {
          case 'n':
            this.feature.geometry.coordinates = [[
              [BBOX[0], BBOX[1]],
              [BBOX[2], BBOX[3]],
              [BBOX[0], BBOX[3]],
              [BBOX[0], BBOX[1]]
            ]];
            break;
          case 's':
            this.feature.geometry.coordinates = [[
              [BBOX[0], BBOX[1]],
              [BBOX[2], BBOX[3]],
              [BBOX[2], BBOX[1]],
              [BBOX[0], BBOX[1]]
            ]];
            break;
        }
        break;
    }
    return callback(null, this.feature);
  }
}

function inflate(id, attributes) {
  var tile = parseID(id);
  var tri = new Triangle();
  tri.create(tile.BBOX, tile.direct, tile.orient, function(err, data) {
    data.properties = attributes;
    data.properties.zEquiv = id.length;
    data.properties.qtid = id;
    console.log(JSON.stringify(data));
  });
}

module.exports = {
  inflate: inflate
}