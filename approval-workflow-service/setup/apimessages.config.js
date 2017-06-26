module.exports = {
    "mongoErrCodes" : {
        "11000": "Opps! the given info already exists"
    },
    "defaultSuccessObject" : {
        "responseCode": 0,
        "responseMessage": "Successfully processed the request"
    },
    "defaultErrorObject": {
        "responseCode": 1,
        "responseMessage": "Some error occured, try again after sometime"
    },
    "partialErrorObject":{
        "responseCode": 3,
        "responseMessage": "Some of the items encountered error"
    },
    "invalidValueObject": {
        "responseCode": 1,
        "responseMessage": "Should be a valid %key%"
    },
    "invalidLogin": {
        "statusCode": 404,
        "message": "Invalid login credentials"
    },
    "unauthorized": {
        "statusCode": 401,
        "responseCode": 7,
        "message": "Please login to continue"
    },
    "systemError": {
        "statusCode": 500,
        "responseCode": 100,
        "message": "System Error, please try again later!"
    },
    "pathMissing":{
        "statusCode": 400,
        "responseCode": 1,
        "message": "Path %param% is missing"
    },
    "inactiveUser": {
        "statusCode": 403,
        "message": "Inactive Account!"
    },
    "deletedUser": {
        "statusCode": 403,
        "message": "Deleted Account!"
    }
}