var argv = require('minimist')(process.argv.slice(2), {
    alias: {
        s: 'scheme',
        l: 'list',
        c: 'concurrency',
        b: 'bounds',
        bbox: 'bounds'
    }
});

console.log(argv)