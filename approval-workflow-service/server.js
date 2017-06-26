let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let swaggerJSDoc = require('swagger-jsdoc');
let path = require('path');
var childProcess = require('child_process');
global.config = {
  STORAGE: process.env.STORAGE || 'cache',
  PORT: process.env.PORT || '3000',
  DBTYPE: process.env.DBTYPE || 'mongodb'
};


if(global.config.STORAGE == "db"){
  //move this later to a seperate connection file.
  switch(global.config.DBTYPE){
    case "mongodb":
      var mongoose = require('mongoose');
      var dbconfig = require('./config/db_config');
      mongoose.Promise = global.Promise;

      mongoose.connect(`${dbconfig.url}:${dbconfig.port}/${dbconfig.dbname}`, {
          user: dbconfig.user,
          pass: dbconfig.password,
          auth: {authdb: dbconfig.authdb},
          server: {
              socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000},
              replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}
          }
      });
      var conn = mongoose.connection;
      conn.on('error', console.error.bind(console, 'connection error: UMS'));
    break;
    case "postgres":
      //postgres connection here
    	var pg = require("pg");
    	var dbconfig = require('./config/pg_db_config');
    	var conString = `${dbconfig.url}${dbconfig.user}:${dbconfig.password}@${dbconfig.servername}:${dbconfig.port}/${dbconfig.dbname}`;
    	var conn = new pg.Client(conString);
    	conn.on('error', console.error.bind(console, 'connection error: UMS'));
    break;
    default:
        console.log("Unexpected error occured");
        process.exit(1);
    break;
  }
}

// swagger definition
var swaggerDefinition = {
  info: {
    title: 'Approval workflow as a service',
    version: '1.0.0',
    description: '',
  },
  host: `localhost:${global.config.PORT}`,
  basePath: '/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./*.js']
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
app.use('/apidoc', express.static(path.join(__dirname, '/api-doc')));
app.get('/swagger.json', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use(bodyParser.json({limit: '20mb'}));
app.use('/api', require('./routes'));

app.use(function (err, req, res, next) {
  return  res.status(500).json({responseCode:1, responseMessage: 'an error occured', errorData: err});
})

app.listen(global.config.PORT, ()=>{
    console.log(`app is running on ${global.config.PORT}`);
});

childProcess.exec(`node ${__dirname}/test/test.js`);
