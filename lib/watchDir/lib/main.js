module.exports = function (app, config) {

    var module = {}
        , fs = require('fs')
        , path = require('path')
        , request = require('request')
        , outgoingDir = config.get('outgoingDir')
        , tmpDir = config.get('tmpDir')
        , line = config.get('line')
        , outgoingdoneDir = config.get('outgoingdoneDir')
        , watch = require('watch');


    //************************ UTILS

    /**
     * read file list
     *
     * @param source
     * @returns {*}
     */
    function readFile(source) {
        try {
            return fs.readFileSync(source, 'utf8');
        } catch (err) {
            logger.error('error processing file: ' + source);
            return false;
        }
    }

    /**
     * return dir file count
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

        logger.debug('copyng - source:' + source + ' - target:' + target);
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
                logger.debug('copyng done.');
            } else {
                logger.error('error copyng files: ' + err);
            }
        }
    }

    /**
     * delete file
     * @param source
     */
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

    /**
     * transfer file from a dir to another
     *
     * @param number of file to be copied
     */
    function transferFile(number, source, target) {

        logger.debug('Transfer file requested: source:' + source + ' - dest: ' + target);

        fs.readdir(source, function (err, files) {

            if (err) return logger.error('error reading source files: ' + err);
            var totalFiles = files.length;

            logger.debug('Total file in source: ' + totalFiles);

            if (totalFiles) {
                for (var i = 0; i < number; i++) {
                    copyFile(path.join(source, files[i]), path.join(target, files[i]));
                }
            }

        });
    }


    /**
     * parse file as object
     *
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


    //************************ END UTILS


    //************************ MONITOR


    /**
     * outgoing_done
     */
    function checkOutgoingdone() {

        watch.createMonitor(outgoingdoneDir, {ignoreDotFiles: true}, function (monitor) {

            //  monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
            monitor.on("created", function (f, stat) {
                logger.info('New file: ' + f);
                sendFile(f);
            });
            monitor.on("changed", function (f, curr, prev) {
                logger.info('Changed file: ' + f);
            });
            monitor.on("removed", function (f, stat) {
                logger.info('Removed file: ' + f);
            });
            // monitor.stop(); // Stop watching
        })

    }


    /**
     * outgoing
     */
    function checkOutgoing() {

        watch.createMonitor(outgoingDir, {ignoreDotFiles: true}, function (monitor) {

            monitor.on("created", function (f, stat) {
                logger.info('New file: ' + f);
                //  sendFile(f);
            });
            monitor.on("changed", function (f, curr, prev) {
                logger.info('Changed File: ' + f);
            });
            monitor.on("removed", function (f, stat) {
                normalizeDir();
                logger.info('Removed file: ' + f);
            });
            // monitor.stop(); // Stop watching
        })

    }


    /**
     * received
     */
    function checkTmpdir() {

        watch.createMonitor(tmpDir, {ignoreDotFiles: true}, function (monitor) {

            monitor.on("created", function (f, stat) {
                logger.info('New file: ' + f);
                normalizeDir();
            });
            monitor.on("changed", function (f, curr, prev) {
                logger.info('Changed File: ' + f);
            });
            monitor.on("removed", function (f, stat) {
                normalizeDir();
                logger.info('Removed file: ' + f);
            });
            // monitor.stop(); // Stop watching
        })

    }

    //**************END MONITOR


    /**
     * check if outogoing dir has right number files
     * add or remove file
     *
     */
    function normalizeDir() {

        logger.debug('Start normalizing outgoing dir: ' + outgoingDir);
        var countOutgoing = countFiles(outgoingDir);
        logger.debug('Total count ' + countOutgoing);


        if (countOutgoing > line) {
            var exceed = countOutgoing - line;
            logger.debug('Outgoing dir exceed number files ' + exceed);
            transferFile(exceed, outgoingDir, tmpDir);
            return;
        }

        if (countOutgoing < line) {
            var fileNeeded = line - countOutgoing;
            logger.debug('Outgoing dir can process more file: ' + fileNeeded);
            transferFile(fileNeeded, tmpDir, outgoingDir);
            return;
        }

        logger.debug('Ougoing has right number of file: ' + countOutgoing);
    }


    /**
     * send file to senderalert file
     */
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

    /**
     * exec send
     *
     * @param obj
     * @param source
     */
    function sendStatus(obj, source) {

        logger.debug('Sending response..');


        if (obj.url && obj.id && obj.Status && obj.url != 'undefined' && obj.id != 'undefined') {

            request.post({url: obj.url, form: obj}, function (err, httpResponse, body) {

                logger.debug('Sending data: file:' + source + ' - Url: ' + obj.url + ' - id: ' + obj.id + ' - Status: ' + obj.Status);

                if (err) {
                    logger.debug('Sending error');
                    logger.error('error sending file:  file:' + source + ' Url: ' + obj.url + ' - id: ' + obj.id + ' - Status: ' + obj.Status);
                    logger.error(err);
                    return;
                }

                try {
                    var response = JSON.parse(body);

                    if (response.status == 1) {

                        logger.debug('Response: OK  with code: ' + response.code);
                        deleteFile(source);

                    } else {
                        logger.info(response);
                        logger.error('Response: KO - status:' + response.status);
                    }

                } catch (ex) {
                    logger.error('Error parsing server response in JSON format ' + source);
                }

            });

        } else {
            logger.error('file ' + source + ' has not right params, can not be sent Url: ' + obj.url + ' - id: ' + obj.id + ' - Status: ' + obj.Status);
        }

    }


    /**
     * wrapper of parsed + sendStatus
     *
     * @param file
     */
    function sendFile(file) {
        var parsedFile = parseFile(file);
        sendStatus(parsedFile, file);

    }


    /**
     * main app function
     */
    module.start = function () {

         logger.info('****************');
         logger.debug('START TASK');
         logger.info('outgoing: '+outgoingDir);
         logger.info('outgoing_done: '+outgoingdoneDir);
         logger.info('received:'+tmpDir);
         logger.info('****************');

         normalizeDir();
         sendOutgoingFiles();
         checkOutgoingdone();
         checkOutgoing();
         checkTmpdir();

    };


    return module;
};