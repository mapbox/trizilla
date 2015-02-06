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

var coordTemplate = {
  false: [
      [0, 2, 3, 0],
      [0, 2, 1, 0]
      ],
  true: [
      [3, 1, 2, 3],
      [3, 1, 0, 3]
      ],
  dirMap: {
    n: 0,
    s: 1
  }
}

function createTriangle(BBOX, direct, orient, callback) {
  var feature = {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": []
      }
  }
  switch(orient) {
    case false:
      switch(direct) {
        case 'n':
          feature.geometry.coordinates = [[
            [BBOX[0], BBOX[3]],
            [BBOX[2], BBOX[1]],
            [BBOX[2], BBOX[3]],
            [BBOX[0], BBOX[3]]
          ]];
          break;
        case 's':
          feature.geometry.coordinates = [[
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
          feature.geometry.coordinates = [[
            [BBOX[0], BBOX[1]],
            [BBOX[2], BBOX[3]],
            [BBOX[0], BBOX[3]],
            [BBOX[0], BBOX[1]]
          ]];
          break;
        case 's':
          feature.geometry.coordinates = [[
            [BBOX[0], BBOX[1]],
            [BBOX[2], BBOX[3]],
            [BBOX[2], BBOX[1]],
            [BBOX[0], BBOX[1]]
          ]];
          break;
      }
      break;
  }
  return callback(null, feature);
}

function inflate(id, attributes) {
  var tile = parseID(id);
  var triGeo = createTriangle(tile.BBOX, tile.direct, tile.orient, function(err, data) {
    data.properties = attributes;
    data.properties.zEquiv = id.length;
    data.properties.qtid = id;
    console.log(JSON.stringify(data));
  });
}

module.exports = {
  inflate: inflate
}