var winston = require('winston');
var app = require('express')();
winston.emitErrs = true;

var logger = new (winston.Logger)({
    transports : [
        new (winston.transports.File)({
            name            : 'info-log',
            level           : 'info',
            filename        : './logs/all-logs.log',
            handleExceptions: false,
            json            : true,
            maxsize         : 5242880, //5MB
            maxFiles        : 5,
            colorize        : false
        }),
        new (winston.transports.File)({
            name            : 'debug-log',
            level           : 'debug',
            filename        : './logs/debug-logs.log',
            handleExceptions: false,
            json            : true,
            maxsize         : 5242880, //5MB
            maxFiles        : 5,
            colorize        : false
        }),

        new (winston.transports.Console)({
            level           : 'debug',
            handleExceptions: true,
            json            : false,
            colorize        : true
        })
    ],
    exitOnError: false
});


module.exports = logger;
module.exports.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};