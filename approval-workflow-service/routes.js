let express = require('express');
let router = express.Router();
let Workflow = require('@accionlabs/approval-workflow');
let workflows = {};
let validate = require('./validationSchemas');
let setWorkflowInstance = require('./setWorkflowInstance');
let workflowOperations = require('./operations');
let swaggerJSDoc = require('swagger-jsdoc');
const uuidV1 = require('uuid/v1');
var cache = require('memory-cache');
var async = require('async');
let fs = require('fs');
let jsonfile = require('jsonfile');
if(global.config.STORAGE == "db"){
  var messages = require('./config/messages');
  var utils = require('./utility/utils');
  var errbackFunc = require('./utility/errback');
}


if (!fs.existsSync(`${__dirname}/workflow-models/`)){
    fs.mkdirSync(`${__dirname}/workflow-models/`);
}
if (!fs.existsSync(`${__dirname}/workflow-mapping/`)){
    fs.mkdirSync(`${__dirname}/workflow-mapping/`);
    fs.writeFileSync(`${__dirname}/workflow-mapping/mapping.json`, "{}");
}

/**
*   @swagger
*   /api/createWorkflow:
*       post:
*           tags:
*               - db
*               - cache
*               - file
*           description: Creates and returns a new workfow + instance or only a workflow model depending on the storage type
*           produces:
*               - application/json
*           parameters:
*             - name: body
*               description: Request body
*               in: body
*               schema:
*                   $ref: '#/definitions/CreateWorkflowBody'
*               required:
*                   - body
*           responses:
*               200:
*                   description: Success
*                   schema:
*                       properties:
*                           responseCode:
*                               type: number
*                           responseMessage:
*                               type: string
*                           workflowId:
*                               type: number
*               default:
*                   description: Error responses
*                   schema:
*                       $ref: "#/definitions/DefaultErrorResponse"
*/
router.post('/createWorkflow', validate("createWorkflow"), function(req, res){
    try {
        if(!req.body.wfModel){
            return res.send("Required params are missing");
        }
        let id = uuidV1().toString();
        switch(global.config.STORAGE){
            case 'file':
                let modelId = uuidV1().toString();
                jsonfile.writeFileSync(`${__dirname}/workflow-models/${modelId}.json`, req.body.wfModel);
                let workflowMapping = jsonfile.readFileSync(`${__dirname}/workflow-mapping/mapping.json`);
                workflowMapping[id] = modelId;
                jsonfile.writeFileSync(`${__dirname}/workflow-mapping/mapping.json`, workflowMapping);
            break;
            case 'db':
              let WorkflowOperations = new workflowOperations();
              WorkflowOperations.createWorkflow(req.body.wfModel, errbackFunc, function (err,documentID) {
                  if (err) {
                    return utils.handleErrResp(req, res, err);
                  } else {
                    res.json({
                        responseCode: 0,
                        responseMessage: "Success",
                        workflowId: documentID
                    });
                  }
              });
            break;
            default:
                /* If document is not sent in case of cache */
                if(!req.body.document){
                    return res.status(400).json({
                        responseCode: 1,
                        responseMessage: "Document is required cache based implementation"
                    });
                }
                cache.put(id, new Workflow(req.body.wfModel, req.body.document), 1800000, (key, value)=>{
                    console.log(key, 'did', value);
                });
            break;
        }
        if(global.config.STORAGE != 'db'){
          res.json({
              responseCode: 0,
              responseMessage: "Success",
              workflowId: id
          });
        }
    } catch(e) {
      console.log(e)
      return res.json(messages.defaultErrorObject);
    }
});


/**
*   @swagger
*   /api/createWorkflowInstance/{workflowId}:
*       get:
*           tags:
*               - db
*           description: Creates and returns a new workfow instance
*           produces:
*               - application/json
*           parameters:
*             -   name: workflowId
*                 in: path
*                 description: Workflow Instance id
*                 type: string
*                 required: true
*           responses:
*               200:
*                   description: Success
*                   schema:
*                       properties:
*                           responseCode:
*                               type: number
*                           responseMessage:
*                               type: string
*                           workflowId:
*                               type: number
*               default:
*                   description: Error responses
*                   schema:
*                       $ref: "#/definitions/DefaultErrorResponse"
*/
router.get('/createWorkflowInstance/:workflowId',  function(req, res){
    if(global.config.STORAGE !== 'db'){
        return res.status(403).send("End point only availaible for storage type db");
    }
    if(!req.params.workflowId){
        return res.status(400).send("Workflow id is required");
    }
    let workflowoperations = new workflowOperations();
    workflowoperations.createNewInstance(req.params.workflowId, errbackFunc, (err, instanceId)=>{
        if(err){
            return utils.handleErrResp(rea, res, err);
        }
        return res.json({
            responseCode: 0,
            responseMessage: "Success",
            instanceId: instanceId
        });
    });
});

router.post('/isUserFromRole/:workflowId', function(req, res){

});

router.post('/getTargetMilestone/:workflowId', function(req, res){

});

/**
 * @swagger
 * /api/isUserAllowedAction/{workflowId}:
 *      post:
 *          tags:
 *              - db
 *              - cache
 *              - file
 *          description: Check if the given user can do the given action. Returns boolean.
 *          produces:
 *              - application/json
 *          parameters:
 *              -   name: workflowId
 *                  in: path
 *                  description: Workflow Instance id
 *                  type: string
 *                  required: true
 *              -   name: body
 *                  in: body
 *                  required: true
 *                  schema:
 *                      $ref: "#/definitions/isUserAllowedActionBody"
 *          responses:
 *              200:
 *                  description: Success
 *                  properties:
 *                      responseCode:
 *                          type: number
 *                      responseMessage:
 *                          type: string
 *                      isAllowed:
 *                          type: boolean
 *              default:
 *                  description: Error responses
 *                  schema:
 *                      $ref: "#/definitions/DefaultErrorResponse"
 */
router.post('/isUserAllowedAction/:workflowId', validate("isUserAllowedAction"), setWorkflowInstance, function(req, res){
    try {
        let allowed = req.workflowInstance.isUserAllowedAction(req.body.user, req.body.action);
        return res.json({
            responseCode: 0,
            responseMessage: 'Success',
            isAllowed: allowed
        });
    } catch (e) {
        console.log(e);
        return res.json({
            responseCode: 1,
            responseMessage: 'An Error Occured'
        });
    }
});

/**
 * @swagger
 * /api/getAllowedActions/{workflowId}:
 *      post:
 *          tags:
 *              - db
 *              - cache
 *              - file
 *          description: Gets an array of actions allowed for the given user on the document associated with the instance.
 *          produces:
 *              - application/json
 *          parameters:
 *              -   name: workflowId
 *                  in: path
 *                  description: Workflow Instance id
 *                  required: true
 *              -   name: body
 *                  in: body
 *                  required: true
 *                  schema:
 *                      $ref: "#/definitions/getAllowedActionsBody"
 *          responses:
 *              200:
 *                  description: Success
 *                  properties:
 *                      responseCode:
 *                          type: number
 *                      responseMessage:
 *                          type: string
 *                      actions:
 *                          type: array
 *              default:
 *                  description: Error responses
 *                  schema:
 *                      $ref: "#/definitions/DefaultErrorResponse"
 */
router.post('/getAllowedActions/:workflowId', validate("getAllowedActions"), setWorkflowInstance, function(req, res){
    try {
        let actions = req.workflowInstance.getAllowedActions(req.body.user);
        return res.json({
            responseCode: 0,
            responseMessage: 'Success',
            actions: actions
        });
    } catch (e) {
        return res.json({
            responseCode: 1,
            responseMessage: 'An Error Occured'
        });
    }
});

/**
 * @swagger
 * /api/getLastMilestone/{workflowId}:
 *      post:
 *          tags:
 *              - db
 *              - cache
 *              - file
 *          description: Returns the last milestone of the document associated with the given instance.
 *          produces:
 *              - application/json
 *          parameters:
 *              -   name: workflowId
 *                  in: path
 *                  description: Workflow Instance id
 *                  required: true
 *              -   name: body
 *                  in: body
 *                  required: true
 *                  schema:
 *                      $ref: "#/definitions/getLastMilestoneBody"
 *          responses:
 *              200:
 *                  description: Success
 *                  properties:
 *                      responseCode:
 *                          type: number
 *                      responseMessage:
 *                          type: string
 *                      lastMilestone:
 *                          type: string
 *              default:
 *                  description: Error responses
 *                  schema:
 *                      $ref: "#/definitions/DefaultErrorResponse"
 */
router.post('/getLastMilestone/:workflowId', setWorkflowInstance, function(req, res){
	try {
		res.json({
			responseCode: 0,
			responseMessage: 'Success',
			lastMilestone: req.workflowInstance.getLastMilestone()
		});
	} catch (e){
		console.log(e);
		return res.json({
            responseCode: 1,
            responseMessage: 'An Error Occured'
        });
	}
});

/**
 *  @params: user,
 */
router.post('/isUserAllowedMilestone/:workflowId', validate("isUserAllowedMilestone"), setWorkflowInstance, function(req, res){
    try {
        let allowed = req.workflowInstance.isUserAllowedMilestone(req.body.user);
        return res.json({
            responseCode: 0,
            responseMessage: 'Success',
            isAllowed: allowed
        });
    } catch (e) {
        return res.json({
            responseCode: 1,
            responseMessage: 'An Error Occured'
        });
    }
});

/**
 * @swagger
 * /api/doAction/{workflowId}:
 *      post:
 *          tags:
 *              - db
 *              - cache
 *              - file
 *          description: Performs the given action on the document associated with the workflow instance, updates the history/ document.
 *          produces:
 *              - application/json
 *          parameters:
 *              -   name: workflowId
 *                  in: path
 *                  description: Workflow Instance id
 *                  required: true
 *              -   name: body
 *                  in: body
 *                  required: true
 *                  schema:
 *                      $ref: "#/definitions/doActionBody"
 *          responses:
 *              200:
 *                  description: Success
 *                  properties:
 *                      responseCode:
 *                          type: number
 *                      responseMessage:
 *                          type: string
 *                      done:
 *                          type: boolean
 *                      history:
 *                          type: array
 *                          items:
 *                              type: object
 *                              properties:
 *                                  user:
 *                                      type: string
 *                                  action:
 *                                      type: string
 *                                  milestone:
 *                                      type: string
 *              default:
 *                  description: Error responses
 *                  schema:
 *                      $ref: "#/definitions/DefaultErrorResponse"
 */
router.post('/doAction/:workflowId', validate("doAction"), setWorkflowInstance, function(req, res){
    try {
        let done = req.workflowInstance.doAction(req.body.user, req.body.action);
        let status = done ? 200 : 403;
        let message = done ? 'success' : 'forbidden';
        let code = done ? 0 : 1;
        if(!config.externalHistory && process.env.STORAGE == 'db' && done){
          let WorkflowOperations = new workflowOperations();
          let params = {documentId:req.params.workflowId, wfModelId:req.wfModelId, history:req.workflowInstance.getHistory()}
          WorkflowOperations.setHistory(params, errbackFunc, (error,data)=>{
            return res.status(status).json({
                responseCode: code,
                responseMessage: message,
                done: done,
                history: data
            });
          });
        } else {
          return res.status(status).json({
                responseCode: code,
                responseMessage: message,
                done: done,
                history: req.workflowInstance.getHistory()
          });
        }
    } catch (e) {
        console.log(e);
        return res.json({
            responseCode: 1,
            responseMessage: 'An Error Occured'
        });
    }
});

/**
 * @swagger
 * /api/getHistory/{workflowId}:
 *      get:
 *          tags:
 *              - db
 *              - cache
 *              - file
 *          description: Returns the complete history of the document associated with the workflow instance (ONLY for IN-MEMORY implementation).
 *          produces:
 *              - application/json
 *          parameters:
 *              -   name: workflowId
 *                  in: path
 *                  description: Workflow Instance id
 *                  required: true
 *          responses:
 *              200:
 *                  description: Success
 *                  properties:
 *                      responseCode:
 *                          type: number
 *                      responseMessage:
 *                          type: string
 *                      history:
 *                          type: object
 *              default:
 *                  description: Error responses
 *                  schema:
 *                      $ref: "#/definitions/DefaultErrorResponse"
 */
router.get('/getHistory/:workflowId', setWorkflowInstance, function(req, res){
    let history = req.workflowInstance.getHistory();
    return res.json({
        responseCode: 0,
        responseMessage: 'Success',
        history: history
    });
});


/**
 * @swagger
 * /api/mapActions:
 *      post:
 *          tags:
 *              - file
 *          description: Takes in array of objects, maps allowed actions according to workflow.
 *          produces:
 *              - application/json
 *          parameters:
 *              -   name: body
 *                  in: body
 *                  required: true
 *                  schema:
 *                      $ref: "#/definitions/mapActionsBody"
 *          responses:
 *              200:
 *                  description: Success
 *                  properties:
 *                      responseCode:
 *                          type: number
 *                      responseMessage:
 *                          type: string
 *                      done:
 *                          type: boolean
 *                      history:
 *                          type: array
 *                          items:
 *                              type: object
 *                              properties:
 *                                  user:
 *                                      type: string
 *                                  action:
 *                                      type: string
 *                                  milestone:
 *                                      type: string
 *              default:
 *                  description: Error responses
 *                  schema:
 *                      $ref: "#/definitions/DefaultErrorResponse"
 */
router.post('/mapActions', function(req, res){
    if(!req.body.data) {
        return res.json({
            responseCode: 1,
            responseMessage: 'Data not provided'
        });
    }
    if(!req.body.user) {
        return res.json({
            responseCode: 1,
            responseMessage: 'User not provided'
        });
    }
    let workflowMapping = jsonfile.readFileSync(`${__dirname}/workflow-mapping/mapping.json`);
    let results = [];
    async.each(req.body.data, (obj, callback)=>{
        if(!obj.workflowId || !obj.wfHistory){
            obj.wf_message = "Workflow id or history is missing";
            results.push(obj);
            return callback(null);
        }
        let wf_id = obj.workflowId;
        let document = {
            history: obj.wfHistory
        }
        let modelId = workflowMapping[wf_id];
        if(!modelId){
            obj.wf_message = "Invalid workflow id";
            results.push(obj);
            return callback(null);
        }
        let wfModel = jsonfile.readFileSync(`${__dirname}/workflow-models/${modelId}.json`);
        let wfInstance = new Workflow(wfModel, document);
        obj.allowedActions = wfInstance.getAllowedActions(req.body.user);
        obj.isUserAllowedMilestone = wfInstance.isUserAllowedMilestone(req.body.user);
        obj.wf_message = "Success";
        results.push(obj);
        callback(null);
    }, (err)=>{
         return res.json({
            responseCode: 0,
            responseMessage: 'Success',
            results: results,
            user: req.body.user
        });
    });
});

module.exports = router;
