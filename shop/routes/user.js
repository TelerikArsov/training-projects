require('dotenv').config();
const express = require('express');
const validate = require('../utils/').Validate;
const userController = require('../controllers/user_controller');
const verifTokenController = require('../controllers/verifToken_controller');
const router = express.Router();
const { check} = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
        if(err){
            res.status(500).json({errors: userController.handleError(err)});
        }else{
            if(result.rowCount == 1){
                console.log(result.rows[0])
                var tokenData = {user_id: result.rows[0].id, token: crypto.randomBytes(16).toString('hex')}
                verifTokenController.createToken(tokenData, (err, _res) => {
                    if(err){
                        res.status(500).json({errors: "Failed to create token"});
                    }else {
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                type: 'OAUTH2',
                                user: process.env.EMAILUSER,
                                clientId: process.env.EMAILCLIENTID,
                                clientSecret: process.env.EMAILCLIENTSECRET,
                                refreshToken: process.env.EMAILREFRESHTOKEN,
                                accessToken: process.env.EMAILACCESSTOKEN
                            }
                        });
                        var message = {
                            from: 'no-reply@yourwebapplication.com',
                            to: req.body.email, 
                            subject: 'Account Verification Token', 
                            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + tokenData.token + '.\n' 
                        };
                        transporter.sendMail(message, function (err) {
                            if (err) {
                                //return res.status(500).json({ errors: err.message });
                                console.log(err.message)
                            }
                        });
                        res.status(200).send();
                    }
                })
            }else{
                res.status(500).json({errors: "Unknown token error"});
            }
            
        }
    });
});

router.get('/confirmation/:token', function(req, res) {
    verifTokenController.getToken(req, res, (err, result) => {
        if(err) {
            res.status(500).json({errors: "Cant verify token"});
        }else{
            if(result.rowCount == 1) {
                userController.verifyUser(result.rows[0].user_id, (err, _result) => {
                    if(err){
                        res.status(400).json({errors: "User not found"});
                    }else {
                        res.redirect('/user/login')
                    }
                });
            }else{
                res.status(500).json({errors: "Cant verify token"});
            }
        }
    })
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
                if(result.rows[0]['isverified']){
                    req.session.user = result.rows[0]['username'];
                    req.session.role = "user";
                    req.session.userId = result.rows[0]['id'];
                    console.log(`Req session: ${req.session.user}`);
                    res.status(200).send({result: 'redirect', url:'/'});
                }
                else{
                    res.status(500).json({errors: "Not verified"});
                }
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