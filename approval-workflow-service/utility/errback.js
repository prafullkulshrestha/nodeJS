var messages = require('../config/messages');
module.exports = function (err, callback) {

    let ErrorMessage = "";
    if (typeof err === 'string') {
        ErrorMessage = err;
    } else if (err.errors) {
        ErrorMessage = err.errors[Object.keys(err.errors)[0]].message;
    } else if (err.code) {
        ErrorMessage = messages.mongoErrCodes[err.code];
    } else if (err.message) {
        ErrorMessage = err.message;
    } else if (err.isJoi) {
        ErrorMessage = err.details;
    } else {
        ErrorMessage = `New Error Code ${err.code}`;
        console.log(err);
    }


    var status = !!err ? (!!err.statusCode ? err.statusCode : 400) : 400;
    return callback({statusCode: status, message: ErrorMessage});
};