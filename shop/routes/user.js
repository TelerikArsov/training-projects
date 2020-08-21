require('dotenv').config();
const express = require('express');
const validate = require('../utils/').Validate;
const userController = require('../controllers/user_controller');
const verifTokenController = require('../controllers/verifToken_controller');
const router = express.Router();
const { check } = require('express-validator');
const user = require('../utils/routes').routes.user
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.get(user.get.root, function(req, res, next) {
    if(req.session.user){
        userController.getUser(req.session.user)
            .then(result => {
                if(result.rowCount == 1) {
                    res.render('account', result.rows[0]);
                }else {
                    res.render('account');
                }
            })
            .catch(err => next(err));
    }
});

router.get(user.get.register, function(req, res){
    res.render('register');
});

router.get(user.get.login, function(req, res){
    res.render('login');
});


router.post(user.post.updateProfile, [
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
], function(req, res, next) {
    let errors = validate.handleValidation(req, res)
    if(errors){
        res.status(500).json({filterErrors: errors})
    }else{
        userController.updateUser(req.session.userId, req.body.username, req.body.email,
            req.body.pass, req.body.newpass)
            .then(result => {
                req.session.user = result.username;
                res.status(200).json({result: result});
            })
            .catch(err => next(err));
    }
  
});

router.post(user.post.register, [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').notEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is not valid'),
    check('pass').notEmpty().withMessage('Password is required').custom((value, {req}) => {
        if(value !== req.body.repass){
            throw new Error("Passwords do not match");
        }
        return true;
    })
], function(req, res, next) {
    let errors = validate.handleValidation(req, res)
    if(errors){
        res.status(500).json({filterErrors: errors})
    }else{
        userController.createUser(req.body.username, req.body.email, req.body.pass)
            .then(result => {
                let tokenData = undefined;
                if(result.rowCount == 1){
                    tokenData = {
                        user_id: result.rows[0].id,
                        token: crypto.randomBytes(16).toString('hex')
                    }
                }
                return verifTokenController.createToken(tokenData.user_id, tokenData.token);
            }).then(result => {
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
                let message = {
                    from: 'no-reply@yourwebapplication.com',
                    to: req.body.email, 
                    subject: 'Account Verification Token', 
                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + result.rows[0].token + '.\n' 
                };
                return transporter.sendMail(message)
            }).then(_ => res.status(200).json({success: true}))
            .catch(err => next(err));
    }
});

router.get(user.get.confirmationToken, function(req, res, next) {
    verifTokenController.getToken(req.params.token)
        .then(result => {
            if(result.rowCount == 1) {
                return userController.verifyUser(result.rows[0].user_id);
            }else{
                throw new Error("Cant verify token")
            }
        })
        .then(_ =>  res.redirect(user.prefix + user.get.login))
        .catch(err => next(err));
});

router.post(user.post.login, [
    check('username').notEmpty().withMessage('Username is required'),
    check('pass').notEmpty().withMessage('Password is required')
],  function(req, res, next) {
    let errors = validate.handleValidation(req, res)
    if(errors){
        res.status(500).json({filterErrors: errors})
    }else{
        userController.loginUser(req.body.username, req.body.pass)
            .then(result => {
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
            })
            .catch(err => next(err))   
    }
});


router.post(user.post.logout, function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect('../');
        }
    });
})

module.exports = router;