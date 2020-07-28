const { validationResult} = require('express-validator');

exports.handleValidation = function(req, res, controllerFunc, callback){
    var errors = validationResult(req).array()
    if (errors.length) {
        res.status(500).json({filterErrors: errors})
    }else {
        controllerFunc(req, res, callback)
    }
}