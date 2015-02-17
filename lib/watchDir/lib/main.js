module.exports = function (app) {

    var module = {}
        , fs = require('fs')
        , path = require('path')
        , request = require('request')
        , config = app.get('config')
        , outgoingDir = config.get('outgoingDir')
        , tmpDir = config.get('tmpDir')
        , line = config.get('line')
        , outgoingdoneDir = config.get('outgoingdoneDir');


    /**
     * return number of file in dir
     *
     * @param dir
     * @returns {*}
     */
    function countFiles(dir) {

        try {

            var files = fs.readdirSync(dir);
        } catch (err) {
            console.log('error getting total dir count: ' + dir);
            return 0
        }

        return files.length;
    }




    /**
     * copy file and delete it if no error
     *
     * @param source
     * @param target
     */
    function copyFile(source, target) {

        console.log(source);
        var rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            done(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            done(err);
        });
        wr.on("close", function (ex) {
            done();
        });
        rd.pipe(wr);

        function done(err) {
            if (!err) {
                fs.unlinkSync(source);
            } else {
                logger.error(err);
            }
        }
    }

    /**
     * transfer file from a dir to another by exedee number
     *
     * @param number
     */
    function transferFile(number,source,target) {

        console.log('directory source:'+source);

        fs.readdir(source, function (err, files) {

            for (var i = 0; i < number; i++) {
                copyFile(path.join(source, files[i]), path.join(target, files[i]));
            }

        });
    }

    /**
     * check if outogoing dir has right number files
     * else move file
     *
     */
    function normalizeDir() {

        logger.debug('Start normalizing outgoing dir: ' + outgoingDir);
        var countOutgoing = countFiles(outgoingDir);
        logger.debug('Total count ' + countOutgoing);


        if (countOutgoing > line) {
            var exceed = countOutgoing - line;
            logger.debug('outgoing dir exceed number files ' + exceed);
            transferFile(exceed,outgoingDir,tmpDir);
            return;
        }

        if (countOutgoing < line) {
            var fileNeeded = line - countOutgoing;
            logger.debug('outgoing dir can process more file: ' + fileNeeded);
            transferFile(fileNeeded,tmpDir,outgoingDir);
            return;
        }

        logger.debug('ougoing has right number of file: ' + countOutgoing);
        return;

    }




    /**
     * get file text content
     *
     * @param source
     * @returns {*}
     */
    function readFile(source) {
        try {
            return fs.readFileSync(source, 'utf8');
        } catch (err) {
            console.log('error processing file: ' + source);
            return false;
        }
    }

    /**
     * get object from file
     * @param file
     */
    function parseFile(file) {


        var obj = {};
        var content = readFile(file).trim();


        //1 split object by line
        var arr = content.split("\n");

        for (var i = 0; i < arr.length; i++) {


            // split all line by :
            //TODO without regexp?
            var splitted = arr[i].split(/:(.+)?/);

            if (splitted.length >= 2) {

                // if is not a set pameters => Set:key=value
                if (splitted[0] != 'Set') {
                    obj[splitted[0]] = splitted[1].trim();
                } else {

                    // is a Set parameter, get value splitting for =
                    setSplitted = arr[i].split("=");

                    // get key splitting key[0] for :
                    var SetSplit = setSplitted[0].split(":");
                    obj[SetSplit[1]] = setSplitted[1];
                }
            }
        }

        logger.debug('file parsed ' + file);

        return obj;
    }


    function sendOutgoingFiles() {

        logger.debug('Checking outgoing_done file to be send..');
        fs.readdir(outgoingdoneDir, function (err, files) {

            logger.debug('file to be sent: ' + files.length);

            for (var i = 0; i < files.length; i++) {
                logger.debug('file to be processed in outgoing_done: ' + path.join(outgoingdoneDir, files[i]));

                var parsedFile = parseFile(path.join(outgoingdoneDir, files[i]));
                sendStatus(parsedFile, path.join(outgoingdoneDir, files[i]));

            }
        })
    }


    function sendStatus(obj, source) {

        logger.debug('Sending response..');
        logger.debug('Sending data: file:' + source + ' - Url: ' + obj.url + ' - id: ' + obj.id + ' - Status: ' + obj.Status);

        request.post({url: obj.url, form: obj}, function (err, httpResponse, body) {

            if (err) {
                logger.debug('Sending error');
                logger.error('error sending file:  file:' + source + ' Url: ' + obj.url + ' - id: ' + obj.id + ' - Status: ' + obj.Status);
                loggger.error(err);
                return;
            }

            try {
                var response = JSON.parse(body);

                if (response.status == 1) {

                    logger.debug('Response: OK  with code: ' + response.code);
                    deleteFile(source);

                } else {
                    logger.error('Response: KO - status:' + response.status);
                }

            } catch (ex) {
                logger.error('Error parsing server response in JSON format ' + source);
            }


        });
    }

    function deleteFile(source) {
        logger.debug('deleting file: ' + source);

        fs.unlink(source, function (err) {

            if (err) {
                logger.error(err);
                logger.error('Error deleting file: ' + source);
            } else {
                logger.debug('file deleted: ' + source);
            }
        });
    }


    function checkOutgoingdone() {
        logger.debug('watching outgoing_done dir files..');
        fs.watch(outgoingdoneDir, function (event, filename) {
            console.log('event is: ' + event);

            if (filename) {
                fs.exists(path.join(outgoingDir, filename), function (exists) {


                    logger.info('exists: '+exists);

                    if (exists){
                        logger.info('file is copied');

                    } else {
                        logger.info('file is deleted')
                    }


                   // logger.debug('file ' + filename + 'exists: ' + exists);

                });
            }


        });
    }


    module.start = function () {

        logger.debug('START TASK');

        normalizeDir();
        sendOutgoingFiles();
        checkOutgoingdone();

/*
        setInterval(function(){
            console.log('test');
        }, 1000);

        */

    };


    return module;
};