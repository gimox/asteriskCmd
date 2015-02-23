exports.get = function () {

    var schema = require('validate');

    var file = schema({

        to: {
            type: 'string',
            required: true
        },
        message: {
            type: 'string',
            required: true
        },
        context: {
            type: 'string',
            required: true
        },
        extension: {
            type: 'string',
            required: true
        },
        task: {
            type: 'string',
            required: true
        },
        id: {
            type: 'number',
            required: true
        },
        url: {
            type: 'string',
            required: true
        },
        priority: {
            type: 'number'
        },
        maxRetries: {
            type: 'number'
        },
        retryTime: {
            type: 'number'
        },
        waitTime: {
            type: 'string'
        },
        'archive': {
            type: 'string'
        },
        token: {
            type: 'string'
        },
        urgente: {
            type: 'string'
        }



    });

    return file;

};