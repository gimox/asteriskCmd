var os = require('os');


/**
 * get pid process number
 * @returns {*}
 */
function getPid() {
    return process.pid;
}

function getMemoryUsage() {
    return Math.round(process.memoryUsage().rss / 1024 / 1024) + "M";
}

/**
 * get uptime process
 *
 * @returns {*}
 */
function upTime() {
    return process.uptime();
}

/**
 * get node version installed in server
 *
 * @returns {*}
 */
function getNodeVersion() {
    return process.version;
}

/**
 * get system date
 *
 * @returns {Date}
 */
function getStartInfo() {
    return new Date();
}

/**
 * get cpu load average
 *
 * @returns {*}
 */
function getLoadAvg() {
    return os.loadavg();
}

/**
 * get free memory
 *
 * @returns {string}
 */
function getFreeMemory() {
    return Math.round(os.freemem() / 1024 / 1024) + "M";
}

/**
 * get enviroment params
 *
 * @returns {*}
 */
function getEnv() {
    console.log('env');
    return process.env.NODE_ENV;
}

/**
 * get hostname
 *
 * @returns {*}
 */
function getHostname() {

    return os.hostname();
}


/**
 * get array list of ip -> local server
 *
 * @returns {Array}
 */
function getIp() {
    //  var os = require('os');
    var ifaces = os.networkInterfaces();

    var ip = [];

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            /*
             if (alias >= 1) {
             // this single interface has multiple ipv4 addresses

             console.log(ifname + ':' + alias, iface.address);
             } else {
             // this interface has only one ipv4 adress
             console.log(ifname, iface.address);
             }
             */

            ip.push(iface.address);
        });
    });

    return ip;

}

/**
 *  return all stat value
 *  start time
 *  node version
 *  pid process
 *  load average
 *  memory usage
 *  free momory
 *  enviroment
 *  hostname
 *
 * @returns {{}}
 */
function getStat() {
    var info = {};

    info.startTime = getStartInfo();
    info.nodeVersion = getNodeVersion();
    info.pid = getPid();
    info.loadAvg = getLoadAvg();
    info.memoryUsage = getMemoryUsage();
    info.freeMemory = getFreeMemory();
    info.upTime = upTime();
    info.env = getEnv();
    info.hostname = getHostname();
    info.serverIp = getIp();

    return info;
}


exports.getPid = function () {
    return getPid();
};

exports.getMemoryUsage = function () {
    return getMemoryUsage;
};

exports.upTime = function () {
    return upTime();
};

exports.getLoadAvg = function () {
    return getLoadAvg();
};

exports.getFreeMemory = function () {
    return getFreeMemory();
};

exports.getNodeVersion = function () {
    return getNodeVersion();
};

exports.getEnv = function () {
    return getEnv();
};

exports.getHostname = function () {
    return getHostname();
};

exports.getIp = function () {
    return getIp();
};

exports.getStat = function () {
    return getStat();
};