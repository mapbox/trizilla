tilebelt = require('tilebelt');

function parseID(qt) {
  var tile = tilebelt.quadkeyToTile(qt.match(/[0-9]/g).join(''));
  return {
    xyz: tile,
    direct: qt.substring(qt.length-1, qt.length),
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
  create: function(BBOX, direct, orient, properties) {
    this.feature.properties = properties;
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
    return this.feature;
  }
}

module.exports = function(data) {
  var tile = parseID(data.qt);
  var tri = new Triangle();
  var properties = data.attributes;
  properties.zE = (data.qt.length-1)/2 ;
  properties.qt = data.qt;
  var newTri = tri.create(tile.BBOX, tile.direct, tile.orient, properties);
  return JSON.stringify(newTri);
}
