var messages = require('../config/messages');

module.exports.handleErrResp = function(req, res, err){
    if(err.statusCode){
        return res.status(err.statusCode).json({
            responseCode: messages.defaultErrorObject.responseCode,
            responseMessage: err.message
        });
    }
    return res.status(400).json({
        responseCode: messages.defaultErrorObject.responseCode,
        responseMessage: err
    });
};

module.exports.response = function (req, status, error, result = {}) {

    var res = {};

    if (error) {
        if (error.statusCode) {
            res.responseCode = messages.defaultErrorObject.responseCode;
            res.statusCode = error.statusCode;
            res.responseMessage = error.message;
        } else {
            res.responseCode = messages.defaultErrorObject.responseCode;
            res.statusCode = 400;
            res.responseMessage = error;
        }


    } else {
        res.responseCode = status.responseCode;
        res.statusCode = status.statusCode || 200;
        res.responseMessage = status.responseMessage;

        Object.keys(result).forEach(function (key) {
            res[key] = result[key];
        });
    }

    if (req.refreshedToken) {
        res.token = req.refreshedToken;
    }

    return res;
};

module.exports.send = function (res, data) {
    var statusCode = data.statusCode;
    delete data.statusCode;

    res.status(statusCode).json(data);
};