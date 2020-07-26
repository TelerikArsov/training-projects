const express = require('express');
const userController = require('../controllers/user_controller')
const router = express.Router();
const { check, validationResult} = require('express-validator');

router.get('/', function(req, res) {
    if(req.session.user){
        userController.getUser(req, (prop) => res.render('account', prop));
    }
});

router.get('/register', function(req, res){
    res.render('register');
});

router.get('/login', function(req, res){
    res.render('login');
});


router.post('/', [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').notEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is not valid'),
    check('pass').notEmpty().withMessage('Password is required'),
    check('newpass').custom((value, {req}) => {
        if(value !== req.body.repass){
            throw new Error("Passwords do not match");
        }
        return true;
    })
], function(req, res) {
    handleErrors(req, res, userController.updateUser, 'account');
});

router.post('/register', [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').notEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is not valid'),
    check('pass').notEmpty().withMessage('Password is required').custom((value, {req}) => {
        if(value !== req.body.repass){
            throw new Error("Passwords do not match");
        }
        return true;
    })
], function(req, res) {
    handleErrors(req, res, userController.createUser, 'register');
});

router.post('/login', [
    check('username').notEmpty().withMessage('Username is required'),
    check('pass').notEmpty().withMessage('Password is required')
],  function(req, res) {
    console.log(req.body)
    handleErrors(req, res, userController.loginUser, 'login');
});


router.post('/logout', function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect('../');
        }
    });
})

// remove this function altogether
function handleErrors(req, res, callback, errorPage){
    var errors = validationResult(req).array()
    if (errors.length) {
        res.render(errorPage, {errors: errors})
    }else {
        try{
            callback(req, res);
        }catch (e) {
            console.log(e);
        }
        
    }
}

module.exports = router;