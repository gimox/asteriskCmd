exports.createFile = createFile;


function generateContentFile(params) {

    if (!params.priority) params.priority = 1; //
    if (!params.maxRetries) params.maxRetries = 3; // call retry
    if (!params.retryTime) params.retryTime = 15; // fail time
    if (!params.waitTime) params.waitTime = 15; // rings time
    if (!params.archive) params.archive = 'Yes';
    if (!params.urgente) params.urgente = 0;


    var stream = '';

    stream += 'Channel:local/' + params.to + '@' + params.context + '/n\n';
    stream += 'MaxRetries:' + params.maxRetries + '\n';
    stream += 'RetryTime:' + params.retryTime + '\n';
    stream += 'WaitTime:' + params.waitTime + '\n';
    stream += 'Set:CIDDest=' + params.to + '\n';
    stream += 'Set:id=' + params.id + '\n';
    stream += 'Set:url=' + params.url + '\n';
    stream += 'Set:urgente=' + params.urgente + '\n';
    stream += 'Set:token=' + params.token + '\n';
    stream += 'Set:testo=' + params.message + '\n';
    stream += 'Set:task=' + params.task + '\n';
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

    if (req.body.token != config.get('token')) return res.status(403);

    if (errors.length) return res.json({'status': 101, message: errors});

    var fileContent = generateContentFile(req.body)
        , dir = config.get('tmpDir')
        , namefile = uid(10);


    fs.writeFile(path.join(dir, namefile), fileContent, function (err) {

        if (err)  return res.json({'status': 101, message: errors});

        return res.json({'status': 10, 'message': 'saved'});
    });

}
