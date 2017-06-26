var pg = require("pg");
var dbconfig = require('./pg_db_config');
var conString = `${dbconfig.url}${dbconfig.user}:${dbconfig.password}@${dbconfig.servername}:${dbconfig.port}/${dbconfig.dbname}`;
var client = new pg.Client(conString);
client.connect();
module.exports = client;