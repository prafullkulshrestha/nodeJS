/**
 * Created by root on 20/12/16.
 */

var winston = require('winston');
var DailyRotateFile = require('winston-daily-rotate-file');
var fs = require('fs');

winston.emitErrs = true;
if (!fs.existsSync(__dirname+'/../logs')){
    fs.mkdirSync(__dirname+'/../logs');
}

var infoFilename = __dirname+'/../logs/info.log';
var errorFilename = __dirname+'/../logs/error.log';

var transports = [
    new DailyRotateFile({
        name: 'info-file',
        level: 'info',
        filename: infoFilename,
        handleExceptions: true,
        json: true,
        colorize: false,
        prettyPrint: true
    }),
    new DailyRotateFile({
        level: 'error',
        filename: errorFilename,
        handleExceptions: true,
        json: true,
        colorize: false,
        prettyPrint: true
    })
];

var logger = new winston.Logger({
    transports: transports,
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};
