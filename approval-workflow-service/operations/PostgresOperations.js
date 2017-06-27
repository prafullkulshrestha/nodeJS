 var client = require('./../config/pg_db_client');
 let projectConfig = require('../setup/initialize.config');
//postgres queries here
class PostgresOperations {
	constructor() {
		
    }
    
    /* @function
     * @param {object} params - Required params (Workflow, etc).
     * @param {function} errback - Database error callback.
     * @param {function} callback - Callback.
     */
     createWorkflow(params, errback, callback) {
    	
     	   	 var query = client.query("INSERT INTO public.workflow" +
    	 	"(id, name, description, default_milestone, roles, actions, milestones, create_ts, create_user, update_ts, update_user) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning *",
    		[params.id,
    		 params.name,
    		 params.description || null,
    		 params.defaultMilestone || 'new',
    		 params.roles || {},
    	     params.actions || {},
    	     params.milestones || {},
    		 '2017-06-24 00:00:00', 'workflow', '2017-06-24 00:00:00', 'pkulshrestha']);
    	//var query = client.query("SELECT firstname, lastname FROM emps ORDER BY lastname, firstname");

    	query.on('row', function (row, result) {
    		console.log('data' + JSON.stringify(row, null, "    "));
    	    result.addRow(row);
    	});
    	query.on('end', function (result) {
    	    console.log(JSON.stringify(result.rows));
    	    client.end();
    	    callback(null,result.rows[0].workflow_skey);
    	});
            
        
     }
     
     createNewInstance(workflowId, errback, callback){
    	 var workflowIdRetrieved;
    	 const query = {
    			  // give the query a unique name
    			  name: 'fetch-workflow',
    			  text: 'SELECT * FROM workflow WHERE workflow_skey= $1',
    			  values: [workflowId]
    			}

    			// callback
    			client.query(query, (err, res) => {
    			  if (err) {
    			    console.log(err.stack)
    			  } else {
    			    console.log(res.rows[0])
    			    const query = {
						  text: 'INSERT INTO public.workflow_instance' +
		 	    	    	 	'(workflow_skey, create_ts, create_user, update_ts, update_user) VALUES ($1, $2, $3, $4, $5) returning *',
						  values: [workflowId, '2017-06-24 00:00:00', 'workflow', '2017-06-24 00:00:00', 'pkulshrestha']
						}
						
						// callback
						client.query(query, (err, res) => {
						  if (err) {
						    console.log(err.stack)
						  } else {
						    if (res.rows[0].workflow_skey) {
														    console.log(' workflow instance id '+ res.rows[0].workflow_instance_skey)
						    callback(null,res.rows[0].workflow_instance_skey);
						  }
							}
						})
    			  }
    			})

       }

     setInstance(documentId, errback, callback){
    	 
    	 const query = {
   			  // give the query a unique name
   			  name: 'fetch-workflow-for-instance',
   			  text: 'select * from workflow w, workflow_instance wi where w.workflow_skey = wi.workflow_instance_skey  and wi.workflow_instance_skey= $1 ',
   			  values: [documentId]
   			}
    	 
    	 client.query(query, (err, res) => {
			  if (err) {
			    console.log(err.stack)
			  } else {
			    var wfModel = JSON.parse(JSON.stringify(res.rows[0]));
			    wfModel._id= wfModel.workflow_skey.toString() ;
			    delete wfModel.workflow_skey;
			    wfModel.updatedAt = wfModel.update_ts;
			    delete wfModel.update_ts;
			    wfModel.createdAt = wfModel.create_ts;
			    delete wfModel.create_ts;
			    wfModel.defaultMilestone = wfModel.default_milestone;
			    delete wfModel.default_milestone;
			    delete wfModel.create_user;
			    delete wfModel.update_user;
			    var documents = [wfModel.workflow_instance_skey.toString()];
			    wfModel.documents= documents;
			    delete wfModel.workflow_instance_skey;
			    console.log('***************** res.rows[0] after*****************' + JSON.stringify(wfModel));
			    if(!wfModel){
			          return errback({message: "Not found", statusCode: 404}, callback);
			        }
			    if(projectConfig.externalHistory){
			    	this.fetchHistory(documentId, (err, document)=>{
			            if(err){
			                return errback(err, callback);
			              }
			              callback(null, {"wfModel": wfModel, "document": document});
			            });
			    	} else {
			        	console.log('Before external callback '+ "wfModel: "+ JSON.stringify(doc));
			          callback(null, {"wfModel": doc});
			        }
			    }
			})
        
       }
     fetchHistory(documentId,callback){
    	 const query = {
   			  // give the query a unique name
   			  name: 'fetch-history',
   			  text: 'SELECT * FROM workflow_action_history WHERE workflow_instance_skey= $1',
   			  values: [documentId]
   			}

   			// callback
   			client.query(query, (err, res) => {
   			  if (err) {
   				return callback(err, null);
   			  } else {
   				  var docs = [];
   				console.log('$$$$$$$$$$$$ docs before ' + JSON.stringify(res.rows));
   				  res.rows.forEach(function(record) { 
   					var requiredRecord = record;
   					requiredRecord._id = requiredRecord.workflow_action_history_skey.toString() ;
 			    delete requiredRecord.workflow_action_history_skey;
 			   requiredRecord.workflowModelId = requiredRecord.workflow_skey;
					delete requiredRecord.workflow_skey;
					requiredRecord.documentId = requiredRecord.workflow_instance_skey;
					delete requiredRecord.workflow_instance_skey;
 			    requiredRecord.user = requiredRecord.user_acted;
 			    delete requiredRecord.user_acted;
 			   requiredRecord.action = requiredRecord.user_action;
			    delete requiredRecord.user_action;
 			   requiredRecord.updatedAt = requiredRecord.update_ts;
 			    delete requiredRecord.update_ts;
 			   requiredRecord.createdAt = requiredRecord.create_ts;
 			    delete requiredRecord.create_ts;
 			    delete requiredRecord.create_user;
 			    delete requiredRecord.update_user;
   				docs.push(requiredRecord)
   				})
   			 let documentObj = {
   	             history: docs
   	           }
   			console.log('$$$$$$$$$$$$ docs after ' + JSON.stringify(docs));
   	           callback(null, documentObj);
   			  }
   			})
       }
     
     setHistory(params, errback, callback){
    	 
    	 const query = {
      			  // give the query a unique name
      			  name: 'fetch-history',
      			  text: 'SELECT * FROM workflow_action_history WHERE workflow_instance_skey= $1',
      			  values: [params.documentId]
      			}

      			// callback
      			client.query(query, (err, res) => {
      			  if (err) {
      				return callback(err, null);
      			  } else {
      				  var docs = [];
      				console.log('$$$$$$$$$$$$ docs before ' + JSON.stringify(res.rows));
      				  res.rows.forEach(function(record) { 
      					var requiredRecord = record;
      					requiredRecord._id = requiredRecord.workflow_action_history_skey.toString() ;
    			    delete requiredRecord.workflow_action_history_skey;
    			    requiredRecord.workflowModelId = requiredRecord.workflow_skey;
  					delete requiredRecord.workflow_skey;
  					requiredRecord.documentId = requiredRecord.workflow_instance_skey;
  					delete requiredRecord.workflow_instance_skey;
    			    requiredRecord.user = requiredRecord.user_acted;
    			    delete requiredRecord.user_acted;
    			   requiredRecord.action = requiredRecord.user_action;
   			    delete requiredRecord.user_action;
    			   requiredRecord.updatedAt = requiredRecord.update_ts;
    			    delete requiredRecord.update_ts;
    			   requiredRecord.createdAt = requiredRecord.create_ts;
    			    delete requiredRecord.create_ts;
    			    delete requiredRecord.create_user;
    			    delete requiredRecord.update_user;
      				docs.push(requiredRecord)
      				})
      			 let documents = docs;
      			 var document = params.history[params.history.length -1];
      			 document.documentId = params.documentId;
      		     document.workflowModelId = params.wfModelId;
      		   const query = {
          			  // give the query a unique name
          			  name: 'set-history',
          			  text: "INSERT INTO workflow_action_history(workflow_skey, workflow_instance_skey, user_acted, user_action, milestone, allowedroles, create_ts, create_user, update_ts, update_user)" +
          			  		" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *",
          			  values: [document.workflowModelId, document.documentId, document.user, document.action, document.milestone, JSON.stringify(document.allowedroles),
          			         '2017-06-24 00:00:00', 'workflow', '2017-06-24 00:00:00', 'pkulshrestha']
          			}

          			// callback
          			client.query(query, (err, res) => {
          			  if (err) {
          				 console.log('##################3 err ' +err);
          				return callback(err, null);
          			  } else {
          				var requiredRecord = res.rows[0];
          				 console.log('##################3 record ' +JSON.stringify(res));
      					requiredRecord._id = requiredRecord.workflow_action_history_skey.toString() ;
      					delete requiredRecord.workflow_action_history_skey;
      					requiredRecord.workflowModelId = requiredRecord.workflow_skey;
      					delete requiredRecord.workflow_skey;
      					requiredRecord.documentId = requiredRecord.workflow_instance_skey;
      					delete requiredRecord.workflow_instance_skey;
      					requiredRecord.user = requiredRecord.user_acted;
      					delete requiredRecord.user_acted;
      					requiredRecord.action = requiredRecord.user_action;
      					delete requiredRecord.user_action;
      					requiredRecord.updatedAt = requiredRecord.update_ts;
      					delete requiredRecord.update_ts;
      					requiredRecord.createdAt = requiredRecord.create_ts;
      					delete requiredRecord.create_ts;
      					delete requiredRecord.create_user;
      					delete requiredRecord.update_user;
      					documents.push(requiredRecord);
          				callback(null, documents);  
          			  }
          			})

      			  }
      			});
      			
    	
     }
}
module.exports = PostgresOperations;