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
     * transfer file from a dir to another by exedee number
     *
     * @param number
     */
    function transferFile(number) {

        fs.readdir(outgoingDir, function (err, files) {

            for (var i = 0; i < number; i++) {
                copyFile(path.join(outgoingDir, files[i]), path.join(tmpDir, files[i]));
            }

        });
    }

    /**
     * copy file and delete it if no error
     *
     * @param source
     * @param target
     */
    function copyFile(source, target) {

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
                fs.unlinkSync(path.join(source));
            }
        }
    }

    /**
     * check if outogoing dir has right number files
     * else move file
     *
     */
    function normalizeDir() {

        var countOutgoing = countFiles(outgoingDir);

        if (countOutgoing > line) {

            var exceed = countOutgoing - line;

            transferFile(exceed);

            console.log('Too many call in outgoing, exceed files: ' + exceed);

        } else {
            console.log('outgoing dir, total file size OK ' + countOutgoing);
        }
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
            var splitted = arr[i].split(":");

            if (splitted.length == 2) {

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

        console.log('file parsed: '+file);
        return obj;
    }


    function sendOutgoingFiles() {

        fs.readdir(outgoingdoneDir, function (err, files) {

            for (var i = 0; i < files.length; i++) {
                console.log('file to be processed in outgoing_done: ' + path.join(outgoingdoneDir, files[i]));

                var pasedFile = parseFile(path.join(outgoingdoneDir, files[i]));
                sendStatus(obj);

            }
        })
    }



    function sendStatus(obj){

        request.post({url:obj.url, form: obj}, function(err,httpResponse,body){


        });
    }


    module.start = function () {

        //1 check outgoing dir har right file number and normalize it
        normalizeDir();

        // check if outgoing_dir has files that need to be sent
        sendOutgoingFiles();

        console.log('task lanciato');


    };


    return module;
};