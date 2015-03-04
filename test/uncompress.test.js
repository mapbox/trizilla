var trizilla_decompressor = require('../lib/compressor');
var tape = require('tape');
var fs = require('fs');

tape('should force decompress to stored triangle size', function(t) {
    var compressed = JSON.parse(fs.readFileSync('./test/fixtures/uncompressed-features'));
    var ForceDC = new trizilla_decompressor.ForceDecompressor();
    t.ok(ForceDC, 'force decompressing')
    ForceDC.decompress(compressed, function(err, data) {
        t.equals(err, null, 'should not error');
        var expected = {
            qt: 's0s3s3s3s3s3s3s',
            attributes: { band_2: '4.64', band_1: '28.03' }
        };
        t.deepEqual(data, expected, 'should return the correct force decompressed values')
        t.end()
    });
});

tape('decompress correctly', function(t) {
    var compressed = JSON.parse(fs.readFileSync('./test/fixtures/uncompressed-features'));
    var ForceDC = new trizilla_decompressor.Decompressor();
    t.ok(ForceDC, 'decompressing')
    ForceDC.decompress(compressed, function(err, data) {
        t.equals(err, null, 'should not error');
        var expected = JSON.parse(fs.readFileSync('./test/fixtures/uncompressed-expected'))
        t.deepEqual(data, expected, 'should return the correct decompressed values');
        t.end()
    });
});