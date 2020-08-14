const { validationResult} = require('express-validator');

exports.handleValidation = function(req, res){
    var errors = validationResult(req).array();
    var res = null;
    if (errors.length) {
        res = errors
    }
    return res;
}