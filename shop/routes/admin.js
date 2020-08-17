const express = require('express');
const validate = require('../utils/').Validate;
const workerController = require('../controllers/worker_controller');
const productController = require('../controllers/product_controller');
const tagCategoryController = require('../controllers/tag_category_controller');
const orderController = require('../controllers/order_controller')
const admin = require('../utils/routes').routes.admin
const path = require("path");
const router = express.Router();
const multer  = require('multer')

var storage = multer.diskStorage({
    destination: './public/data/uploads/',
    filename: function (req, file, cb) {
        cb(null, (req.body.id) + path.extname(file.originalname));
    }
  })
  
const upload = multer({ storage: storage })
const { check, validationResult} = require('express-validator');

router.get(admin.get.root, function(req, res){
    res.render('admin_panel', {admin: req.session.role == "admin" ? true : false});
});

router.get(admin.get.account, function(req, res){
    res.render('admin_account');
});


router.get(admin.get.login, function(req, res){
    res.render('login_worker');
});


router.get(admin.get.createWorker, function(req, res){
    res.render('register_worker');
});
router.get(admin.get.create, function(req, res){
    res.render('create');
});

router.get(admin.get.allOrders, function(req, res, next){
    if(req.session.user && req.session.role == "admin"){
        orderController.getOrders(req.session.userId, req.session.role)
            .then(result => res.status(200).json({result: result.rows}))
            .catch(err => next(err));
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
})

router.get(admin.get.order,  function(req, res){
    res.render('admin_orders');
});


router.get(admin.get.orderById, function(req, res, next){
    if(req.session.user && req.session.role == "admin"){
        orderController.getOrderItems(req.session.userId, req.session.role, req.params.orderId)
            .then(result => res.status(200).json({result: result.rows}))
            .catch(err => next(err));
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
})

router.post(admin.post.account, [
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
        const {username, email, pass, newpass} = req.body
        workerController.updateWorker(req.session.userId, username, email, pass, newpass)
            .then(result => {
                req.session.user = result.username;
                res.status(200).json({result: result});
            })
            .catch(err => next(err))
    }
});

//AUTH

router.post(admin.post.login, [
    check('username').notEmpty().withMessage('Username is required'),
    check('pass').notEmpty().withMessage('Password is required')
],  function(req, res, next) {
    let errors = validate.handleValidation(req, res)
    if(errors){
        res.status(500).json({filterErrors: errors})
    }else{
        const {username, pass} = req.body
        workerController.loginWorker(username, pass)
            .then(result => {
                if (result.rowCount == 1) {
                    req.session.user = result.rows[0]['username'];
                    req.session.role = "admin";
                    req.session.userId = result.rows[0]['id'];
                    res.status(200).send({result: 'redirect', url: admin.prefix + admin.get.root})
                }else {
                    res.status(500).json({errors: "Failed to authenticate"});
                }
            })
            .catch(err => next(err))
        
    }
});

router.post(admin.post.logout, function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect('../');
        }
    });
})

var tableActions = {
    get: 
    {
        tags: tagCategoryController.getAllTags,
        categories: tagCategoryController.getAllCategories,
        products: productController.getAllProducts,
        productTags: productController.getAssignedTags,
        productNotAssignedTags: productController.getNotAssignedTags
    },
    delete: 
    {
        tags: { 
            func: tagCategoryController.deleteTag, 
            validations: [
                check('id').notEmpty().withMessage('Id is required')
            ],
            getParams: (args) => {
                const {id} = args
                return [id];
            }
        },
        categories: { 
            func: tagCategoryController.deleteCategory, 
            validations: [
                check('id').notEmpty().withMessage('Id is required')
            ],
            getParams: (args) => {
                const {id} = args
                return [id];
            }
        },
        products: { 
            func: productController.deleteProduct, 
            validations: [
                check('id').notEmpty().withMessage('Id is required')
            ], 
            getParams: (args) => {
                const {id} = args;
                return [id];
            }
        }
    },
    edit:
    {
        tags: { 
            func: tagCategoryController.editTags, 
            validations: [
                check('name').notEmpty().withMessage('Username is required'),
                check('color').notEmpty().withMessage('Color is required'),
                check('id').notEmpty().withMessage('Id is required')
            ],
            getParams: (args) => {
                const {id, name, color, visible} = args;
                return [id, name, color, visible];
            }
        },
        categories: { 
            func: tagCategoryController.editCategory, 
            validations: [
                check('name').notEmpty().withMessage('Username is required'),
                check('color').notEmpty().withMessage('Color is required'),
                check('id').notEmpty().withMessage('Id is required')
            ],
            getParams: (args) => {
                const {id, name, color, visible} = args;
                return [id, name, color, visible];
            }
        },
        products: { 
            func: productController.editProduct, 
            validations:[
                check('name').notEmpty().withMessage('Username is required'),
                check('manifacturer').notEmpty().withMessage('Manufacturer is required'),
                check('description').notEmpty().withMessage('Description is required'),
                check('cost').notEmpty().withMessage('Cost is required'),
                check('category').notEmpty().withMessage('Category is required'),
                check('visible').notEmpty().withMessage('Visibillity is required')
            ], 
            getParams: (args) => {
                const {id, name, manifacturer, description, cost, category, visible} = args
                return [id, name, manifacturer, description, cost, category, visible]

            }
        }
    },
    create:
    {
        tags: { 
            func: tagCategoryController.createTag, 
            validations: [
                check('name').notEmpty().withMessage('Username is required'),
                check('color').notEmpty().withMessage('Color is required')
            ],
            getParams: (args) => {
                const {name, color, visible} = args
                return [name, color, visible]
            }
        },
        categories: { 
            func: tagCategoryController.createCategory, 
            validations: [
                check('name').notEmpty().withMessage('Username is required'),
                check('color').notEmpty().withMessage('Color is required')
            ],
            getParams: (args) => {
                const {name, color, visible} = args
                return [name, color, visible]
            }
        },
        products: { 
            func: productController.createProduct, 
            validations:[
                check('name').notEmpty().withMessage('Username is required'),
                check('manifacturer').notEmpty().withMessage('Manufacturer is required'),
                check('description').notEmpty().withMessage('Description is required'),
                check('cost').notEmpty().withMessage('Cost is required'),
                check('category').notEmpty().withMessage('Category is required'),
                check('visible').notEmpty().withMessage('Visibillity is required')
            ],
            getParams: (args) => {
                const {name, manifacturer, description, cost, category, visible, ammount} = args;
                return [name, manifacturer, description, cost, category, visible, ammount]
            }
        },
        workers: { 
            func: workerController.createWorker, 
            validations:[
                check('username').notEmpty().withMessage('Username is required'),
                check('email').notEmpty().withMessage('Email is required'),
                check('email').isEmail().withMessage('Email is not valid'),
                check('pass').notEmpty().withMessage('Password is required').custom((value, {req}) => {
                    if(value !== req.body.repass){
                        throw new Error("Passwords do not match");
                    }
                    return true;
                })
            ],
            getParams: (args) => {
                const {username, email, pass} = args
                return [username, email, pass]
            }
        }
    },
    //remove altogether soon
    error:
    {
        tags: tagCategoryController.handleTagError,
        categories: tagCategoryController.handleCategoryError,
        products: productController.handleError,
        workers: workerController.handleError
    }
};

router.get(admin.get.allInTable, function(req, res, next){
    if(tableActions.get[req.params['table']]){
        tableActions.get[req.params['table']](req.session.role, req.query.id)
        .then(result => res.json({table: req.params['table'], result: result.rows}))
        .catch(err => next(err));
    }else {
        res.status(500).json({errors: "No such table"});
    }
});
router.post(admin.post.deleteTable, function(req, res, next){
    validateReq('table', 'delete', req, res, next);
});

router.post(admin.post.editTable, function(req, res, next){
    validateReq('table', 'edit', req, res, next);
});

router.post(admin.post.createTable, function(req, res, next){
    validateReq('table', 'create', req, res, next);
});

router.post(admin.post.uploadImage, upload.single('productImage'), function(req, res){
    res.status(200).end();
});

router.post(admin.post.productAmmount, function(req, res, next) {
    if(req.session.user && req.session.role == "admin"){
        productController.editAmmount(req.body.id, req.body.ammount)
            .then(_ => res.json({table: 'products'}))
            .catch(err => next(err))
    }
});

router.post(admin.post.productAddTag, function(req, res, next) {
    if(req.session.user && req.session.role == "admin"){
        productController.assignTag(req.body.id, req.body.tag_id)
            .then(_ => res.json({table: 'products'}))
            .catch(err => next(err));
    }
});

router.post(admin.post.productRemoveTag, function(req, res) {
    if(req.session.user && req.session.role == "admin"){
        productController.removeTag(req.body.id, req.body.tag_id)
            .then(_ => res.json({table: 'products'}))
            .catch(err => next(err));
    }
});

function ValidateError(message, errors){
    var error = Error.call(this, message);
    this.name = 'ValidateError';
    this.message = error.message;
    this.stack = error.stack;
    this.errors = errors;
}
ValidateError.prototype = Object.create(Error.prototype)
ValidateError.prototype.constructor = ValidateError

function validateReq(paramName, type, req, res, next){
    if(tableActions[type][req.params[paramName]] && req.session.userId &&
        req.session.role == "admin"){      
        Promise.all(tableActions[type][req.params[paramName]]
            .validations.map(async (element) => {
                await element.run(req)
            })
        ).then(() => {
            let errors = validationResult(req).array();
            if (errors.length){
                throw new ValidateError('Validation error', errors)
            }
            var action = tableActions[type][req.params[paramName]]
            return action.func(action.getParams(req.body))
        }).then(result => {
            let id = undefined
            if(result.rowCount == 1){
                id = result.rows[0].id;
            }
            res.status(200).json({result: id || result, table: req.params[paramName]})
        }, err => {
            res.status(500).json({filterErrors: err.errors})
            return ValidateError('Already handled', err.errors);
        })
        .catch(err => {
            if(err instanceof ValidateError)
            {
                console.error(err.message, err.errors);
            }else{
                next(err)
            }
            //res.status(500).json({errors: tableActions['error'][req.params[paramName]](err)});
        });
    }
}

module.exports = router;
