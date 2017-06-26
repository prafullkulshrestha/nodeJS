const Joi = require('joi');

let commons = {
    user: {
        id: Joi.string().required(),
        role: Joi.string().required()
    },
    document: Joi.object().keys({
                history: Joi.array().required().empty().items(Joi.object().keys({
                    user: Joi.string().required(),
                    milestone: Joi.string().required(),
                    action: Joi.string().required()
                }))
            })
}

let schemas = {
    createWorkflow: {
        POST: Joi.object().keys({
            wfModel: Joi.object().required()
        })
    },
    isUserAllowedAction: {
        POST: Joi.object().keys({
            user: Joi.object().required().keys(commons.user),
            action: Joi.string().required(),
            document: commons.document
        })
    },
    getAllowedActions: {
        POST: Joi.object().keys({
            user: Joi.object().required().keys(commons.user),
            document: commons.document
        })
    },
    isUserAllowedMilestone: {
        POST: Joi.object().keys({
            user: Joi.object().required().keys(commons.user),
            document: commons.document
        })
    },
    doAction: {
        POST: Joi.object().keys({
            user: Joi.object().required().keys(commons.user),
            action: Joi.string().required(),
            document: commons.document
        })
    },
    common: {
        user: Joi.object().keys({
            id: Joi.string().required(),
            role: Joi.string().required()
        })
    }
}

module.exports = function(path){
    return function(req, res, next){
        let schema = schemas[path][req.method];
    Joi.validate(req.body, schema, {allowUnknown: true}, (err)=>{
            if(err){
                return res.send(err.details[0].message);
            }
            next();
        });
    }
}