var mongoose = require('mongoose');
var async = require('async');
var uuid = require('uuid/v1');

var WorkflowModel = require('../models/WorkflowModel');
var DocumentModel = require('../models/DocumentModel');
let projectConfig = require('../setup/initialize.config');

class MongoDBOperations {
    constructor() {

    }

    /* @function
     * @param {object} params - Required params (Workflow, etc).
     * @param {function} errback - Database error callback.
     * @param {function} callback - Callback.
     */
     createWorkflow(params, errback, callback) {
       var workflow = new WorkflowModel();
        workflow.documents = [];
        workflow.id = params.id;
        workflow.name = params.name;
        workflow.description = params.description || null;
        workflow.defaultMilestone = params.defaultMilestone || 'new';
        workflow.roles = params.roles || {};
        workflow.actions = params.actions || {};
        workflow.milestones = params.milestones || {};
        workflow.save((err,data)=>{
          if (err) {
            errback(err, callback);
          }
          else{
            callback(null,data._id);
          }
        });
     }


     createNewInstance(workflowId, errback, callback){
       WorkflowModel.findOne({_id: workflowId}, (err, doc)=>{
          if(err){
            return errback(err, callback);
          }
          if(!doc){
            return errback({message: 'Not a valid workflow id', statusCode: 404}, callback);
          }
          let instanceId = uuid();
          doc.documents.push(instanceId);
          doc.save((err)=>{
            if(err){
              return errback(err, callback);
            }
            callback(null, instanceId);
          });
       });
     }

     deleteDocument(param,callback){
       DocumentModel.findByIdAndRemove(param,(err,data)=>{
         if(err) callback(err,null);
         callback(null,data);
       });
     }

     addDocument(params, callback){
      let documentModel = new DocumentModel(
        params
      );
      documentModel.save(function (err,data) {
          if (err) {
              return errback(err, null);
          }else{
            callback(null,data._id);
          }
      });
    }

    setInstance(documentId, errback, callback){
      WorkflowModel.findOne({documents: {$in: [documentId]}}).lean().exec((err, wfModel)=>{
        if(!wfModel){
          return errback({message: "Not found", statusCode: 404}, callback);
        }
        if(projectConfig.externalHistory){
          this.fetchDocument(documentId, (err, document)=>{
            if(err){
              return errback(err, callback);
            }
            callback(null, {"wfModel": wfModel, "document": document});
          });
        } else {
          callback(null, {"wfModel": doc});
        }
      })
    }

    fetchDocument(documentId,callback){
      DocumentModel.find({'documentId': documentId}).lean().exec((err, docs)=>{
        if(err){
          return callback(err, null);
        }
        let documentObj = {
          history: docs
        }
        callback(null, documentObj);
      });
    }

    setHistory(params, errback, callback){
      DocumentModel.find({documentId: params.documentId}).exec((err, doc)=>{
        if(err){
          return errback(err, callback);
        }
        let documents = doc;
        var document = new DocumentModel(params.history[params.history.length -1]);
        document.documentId = params.documentId;
        document.workflowModelId = params.wfModelId;
        document.save((err, data)=>{
          documents.push(data);
          if(err){
            return errback(err, callback);
          }
          callback(null, documents);
        });
      });
    }

}

module.exports = MongoDBOperations;
