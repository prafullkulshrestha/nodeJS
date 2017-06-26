var cache = require('memory-cache');
let jsonfile = require('jsonfile');
let Workflow = require('@accionlabs/approval-workflow');
var WorkflowOperations = require('../operations');
var errbackFunc = require('../utility/errback');

module.exports = function(req, res, next){
    if(!req.params.workflowId){
        return res.status(400).send("Workflow id is required");
    }
    let workflowOperations = new WorkflowOperations();
    workflowOperations.workflowModel({"workflowId":req.params.workflowId}, errbackFunc, function (err,workflowInstance) {

      if(!workflowInstance){
          return res.status(404).send("Invalid Workflow id");
      }
      req.workflowInstance = new Workflow(workflowInstance, req.body.document);
      next();
    });
}
