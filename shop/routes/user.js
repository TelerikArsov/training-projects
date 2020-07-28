const express = require('express');
const validate = require('../utils/').Validate;
const userController = require('../controllers/user_controller')
const router = express.Router();
const { check, validationResult} = require('express-validator');

router.get('/', function(req, res) {
    if(req.session.user){
        userController.getUser(req, (err, results) => {
            if(err){
                res.status(500).json({errors: userController.handleError(err)})
            }else{
                if (results.rowCount == 1) {
                    res.render('account', results.rows[0]);
                }else {
                    res.render('account');
                }
            }
        });
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
    validate.handleValidation(req, res, userController.updateUser, (err, result) => {
        if(err){
            res.status(500).json({errors: userController.handleError(err)});
        }else{
            req.session.user = result.username;
            res.status(200).json({result: result});
        }
    });
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
    validate.handleValidation(req, res, userController.createUser, (err, result) => {
        console.log(err);
        console.log(result)
        if(err){
            res.status(500).json({errors: userController.handleError(err)});
        }else{
            res.redirect('/user/login');
        }
    });
});

router.post('/login', [
    check('username').notEmpty().withMessage('Username is required'),
    check('pass').notEmpty().withMessage('Password is required')
],  function(req, res) {
    validate.handleValidation(req, res, userController.loginUser, (err, result) => {
        if(err){
            res.status(500).json({errors: userController.handleError(err)});
            console.log('err');
        }else{
            if (result.rowCount == 1) {
                req.session.user = result.rows[0]['username'];
                req.session.role = "user";
                req.session.userId = result.rows[0]['id'];
                console.log(`Req session: ${req.session.user}`);
                res.status(200).send({result: 'redirect', url:'/'})
            }else{
                res.status(500).json({errors: "Failed to authenticate"});
            }
        }
    });
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

module.exports = router;