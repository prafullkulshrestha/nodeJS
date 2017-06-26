var mongoose = require('mongoose');

var historyObject = {
  user:{type: String, maxlength: 250},
  action:{type: String, maxlength: 250},
  milestone:{type: String, maxlength: 250},
}

var DocumentSchema = mongoose.Schema({
  workflowModelId: { type: String, required: true, index: true, maxlength: 500},
  workflowName: {type: String, maxlength: 500},
  documentId: { type: String, required: true, index: true, maxlength: 500},
  user:{type: String, maxlength: 500, required: true},
  action:{type: String, maxlength: 500, required: true},
  milestone:{type: String, maxlength: 500, required: true},
  timeSpent: {type: String},
  meta : { type: Object }
}, {
    timestamps: true,
    strict: false
});

// create the model for roles for workflow
module.exports = mongoose.model('Document', DocumentSchema);
