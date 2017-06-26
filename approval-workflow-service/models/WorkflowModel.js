var mongoose = require('mongoose');
var Document = require('./DocumentModel');
var Schema = mongoose.Schema;

// var roleObject = {
//   id:{type: String, maxlength: 250},
//   name:{type: String, maxlength: 250},
//   description:{type: String, maxlength: 1000}
// }
//
// var actionObject = {
//   id:{type: String, maxlength: 250},
//   name:{type: String, maxlength: 250},
//   description:{type: String, maxlength: 1000},
//   role: Schema.Types.Mixed,
//   milestone: {type: String, maxlength: 250},
// };
//
// var milestoneObject = {
//   id:{type: String, maxlength: 250},
//   name:{type: String, maxlength: 250},
//   description:{type: String, maxlength: 1000},
//   role: Schema.Types.Mixed,
//   actions: Schema.Types.Mixed
// };

var WorkflowfSchema = mongoose.Schema({
  id: {type: String, maxlength: 500, required: true, index: {unique: true}},
  name: {type: String, maxlength: 500, required: true},
  description: {type: String, maxlength: 1000},
  defaultMilestone: {type: String,default:'new'},
  roles: Schema.Types.Mixed,
  actions: Schema.Types.Mixed,
  milestones: Schema.Types.Mixed,
  documents: [{type: String}]
}, {
    timestamps: true,
    strict:false
});

// create the model for roles for workflow
module.exports = mongoose.model('Workflow', WorkflowfSchema);
