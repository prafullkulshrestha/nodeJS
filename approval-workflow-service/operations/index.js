(function(){
    if(global.config.STORAGE === 'db'){
        switch(global.config.DBTYPE) {
            case 'mongodb':
                var WorkflowOperations = require('./MongoDBOperations')
                module.exports = WorkflowOperations;
            break;
            case 'postgres':
                var WorkflowOperations = require('./PostgresOperations');
                module.exports = WorkflowOperations;
            break;
            default:
                console.log("Unexpected error occured");
                process.exit(1);
            break;
        }
    }
})();