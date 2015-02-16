var fs = require('fs')
    , info = require('simple-node-info');

exports.displayInfo = displayInfo;
exports.displayError = displayError;

/**
 * read package.json and parse as json format
 *
 * @returns {*}
 */
function readfile() {
    console.log('Reading package.json...');

    var data = fs.readFileSync('package.json', 'utf8');

    if (!data) return console.log('error reading package.json.');

    try {
        console.log('done.');
        return JSON.parse(data);
    } catch (err) {
        return console.log('error malformed package.json: ' + err);
    }
}

/**
 * set event on listeninfg
 * display info data using server var and package.json
 *
 * @param server
 * @returns {boolean}
 */
function displayInfo(server) {

    var file = readfile();
    if (!file) return false;

    server.on('listening', function () {

        console.info(' ');
        console.info('\x1b[32m_______________________________________________________________\x1b[0m');
        console.info(' ');
        console.info('::  ' + new Date());
        console.info(' ');
        console.info('      Application name : \x1b[36m' + file.name + '\x1b[0m');
        console.info('      Project version  : ' + file.version);
        console.info('      Server name      : ' + info.getHostname());
        console.info('      Ip               : ' + info.getIp());
        console.info('      Port             : ' + server.address().port);
        console.info('      NodeJs version   : ' + info.getNodeVersion());
        console.info('      ProcessID        : ' + info.getPid());
        console.info(' ');
        console.info('\x1b[32m_______________________________________________________________\x1b[0m');
        console.info(' ');

    })

}

/**
 * add event error
 *
 * @param server
 */
function displayError(server) {

    server.on('error', function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error('Port ' + port + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error('Port ' + port + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

}