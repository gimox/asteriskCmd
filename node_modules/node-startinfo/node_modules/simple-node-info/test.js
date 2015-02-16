var express = require('express')
    , app = express()
    , info = require('./lib/main');

console.log('started');


console.log(info.getStat());

module.exports = app;