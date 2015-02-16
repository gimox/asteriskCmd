/**
 * manage 404/500 etc errors
 *
 * set request header Accept params for a correct response
 *
 * Accept: application/json
 * Accept: text/html
 * Accept: text/plain
 *
 * @param app
 */

exports.init = function (app) {

    //jwt error
    app.use(function (err, req, res, next) {
        if (err.name === "UnauthorizedError") {
            res.status(401).send('You are not logged in');
        }
    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function (err, req, res, next) {

        var systemError = null;

        res.status(err.status || 500);


        if (app.get("env") === 'development') {
            systemError = err;
        }


        return res.json({err: 99, message: err.message, systemError: systemError});

    });
};
