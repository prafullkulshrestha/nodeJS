 var client = require('./../config/pg_db_client');
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

}
module.exports = PostgresOperations;