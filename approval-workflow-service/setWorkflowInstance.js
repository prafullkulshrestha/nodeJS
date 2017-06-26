var cache = require('memory-cache');
let jsonfile = require('jsonfile');
let Workflow = require('@accionlabs/approval-workflow');
let workflowOperations = require('./operations');
let projectConfig = require('./setup/initialize.config');
var errbackFunc = require('./utility/errback');
var utils = require('./utility/utils');

module.exports = function(req, res, next){
    if(!req.params.workflowId){
        return res.status(400).send("Workflow id is required");
    }
    switch(global.config.STORAGE){
        case "file":
            if(!req.body.document || !req.body.document.history){
                return res.status(400).send("Document is required");
            }
            let workflowMapping = jsonfile.readFileSync(`${__dirname}/workflow-mapping/mapping.json`);
            let modelId = workflowMapping[req.params.workflowId];
            if(!modelId){
                return res.status(404).send("Invalid Workflow id");
            }
            let wfModel = jsonfile.readFileSync(`${__dirname}/workflow-models/${modelId}.json`);
            cache.put(req.params.workflowId, new Workflow(wfModel, req.body.document), 1800000);
        break;
        case "db":
          let WorkflowOperations = new workflowOperations();
          WorkflowOperations.setInstance(req.params.workflowId, errbackFunc, (err,data)=>{
            if(err){
                return utils.handleErrResp(req, res, err);
            }
            let document = data.document || req.body.document;
            req.wfModelId = data.wfModel._id;
            req.wfInstanceId = req.params.workflowId;
            req.workflowInstance = new Workflow(data.wfModel, document);
            next();
          });
        break;
        default:
        break;
    }
    if(global.config.STORAGE != "db"){
      let workflowInstance = cache.get(req.params.workflowId);
      if(!workflowInstance){
          return res.status(404).send("Invalid Workflow id");
      }
      req.workflowInstance = workflowInstance;
      next();
    }
}
