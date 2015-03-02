module.exports.makeTile = (t, callback) {
  var geojson = {
    "type": "FeatureCollection",
    "features": t.features
  };
  var vtile = new mapnik.VectorTile(t.xyz[2],t.xyz[0],t.xyz[1]);
  vtile.addGeoJSON(JSON.stringify(geojson), "now");

  zlib.gzip(vtile.getData(), function(err, buffer) {
    if (err) return callback(err);
    var tile = new Tile(t.xyz[2], t.xyz[0], t.xyz[1], buffer);
    tile.buffer = tile.buffer.toString('base64');
    return callback(null, JSON.stringify(tile));
  });
}