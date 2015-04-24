var express = require('express');
var path = require('path');
var logger = require("./lib/logger");
var bodyParser = require('body-parser');
var app = express();
var config = require("config");
var routing = require('json-routing'); // set routing
var errors = require('./lib/errors'); // mange http errors 404,500
var watch = require('./lib/watchDir')(app,config);


// SET
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('config',config);


//USE
app.use(require('morgan')("combined",{"stream": logger.stream }));
GLOBAL.logger = logger;



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//config
routing(app, config.get('path')); // init routing


watch.start();
errors.init(app); // manage error4 404,500 etc


module.exports = app;