exports.createFile = createFile;


function generateContentFile(params) {

    if (!params.priority) params.priority = 1;

    if (!params.maxRetries) params.maxRetries = 9999;
    if (!params.retryTime) params.retryTime = 15;
    if (!params.waitTime) params.waitTime = 15;
    if (!params.archive) params.archive = 'Yes';
    if (!params.urgente) params.urgente = 0;

    var stream = '';

    stream += 'Channel:local/' + params.to + '@' + params.context + '/n\n';
    stream += 'MaxRetries:' + params.maxRetries + '\n';
    stream += 'RetryTime:' + params.retryTime + '\n';
    stream += 'WaitTime:' + params.waitTime + '\n';
    stream += 'Set:CIDDest=' + params.to + '\n';
    stream += 'Set:Id=' + params.id + '\n';
    stream += 'Set:Url=' + params.url + '\n';
    stream += 'Set:Urgente=' + params.urgente + '\n';
    stream += 'Set:Token=' + params.token + '\n';
    stream += 'Set:Testo=' + params.message + '\n';
    stream += 'Set:Task=' + params.task + '\n';
    stream += 'Context:' + params.context + '\n';
    stream += 'Extension:' + params.extension + '\n';
    stream += 'Priority:' + params.priority + '\n';
    stream += 'Archive:' + params.archive + '\n';

    return stream;
}


function createFile(req, res) {

    var app = req.app
        , config = app.get('config')
        , fs = require('fs')
        , path = require('path')
        , uid = require('uid')
        , file = require('./../models/call.js').get()
        , errors = file.validate(req.body);

    if (errors.length) return res.json({'status': 101, message: errors});

    var fileContent = generateContentFile(req.body);
    var dir = config.get('tmpDir');
    var namefile = uid(10);


    fs.writeFile(path.join(dir,namefile), fileContent, function (err) {

        if (err) {
            return res.json({'status': 101, message: errors});
        } else {

            return res.json({'status': 11, 'message': 'saved'});
        }

    });

}


