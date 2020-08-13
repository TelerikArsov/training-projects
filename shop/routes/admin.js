const express = require('express');
const validate = require('../utils/').Validate;
const workerController = require('../controllers/worker_controller');
const productController = require('../controllers/product_controller');
const tagCategoryController = require('../controllers/tag_category_controller');
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

router.get(admin.get.allOrders, function(req, res){
    if(req.session.user && req.session.role == "Admin"){
        orderController.getOrders(req, res, (err, result) => {
            if(err){
                console.log(err)
                res.status(500).json({errors: "Oops Cant get cart"});
            }
            res.status(200).json({result: result.rows});
        })
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
})

router.get(admin.get.order,  function(req, res){
    res.render('admin_orders');
});


router.get(admin.get.orderById, function(req, res){
    if(req.session.user && req.session.role == "Admin"){
        orderController.getOrderItems(req, res, (err, result) => {
            if(err){
                console.log(err)
                res.status(500).json({errors: "Oops Cant get cart"});
            }else {
                res.status(200).json({result: result.rows});
            }
        })
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
], function(req, res) {
    validate.handleValidation(req, res, workerController.updateWorker, (err, result) => {
        if(err){
            res.status(500).json({errors: workerController.handleError(err)});
        }else{
            req.session.user = result.username;
            res.status(200).json({result: result});
        }
    });
});

//AUTH

router.post(admin.post.login, [
    check('username').notEmpty().withMessage('Username is required'),
    check('pass').notEmpty().withMessage('Password is required')
],  function(req, res) {
    validate.handleValidation(req, res, workerController.loginWorker, (err, result) => {
        if(err){
            res.status(500).json({errors: workerController.handleError(err)});
        }else{
            if (result.rowCount == 1) {
                req.session.user = result.rows[0]['username'];
                req.session.role = "admin";
                req.session.userId = result.rows[0]['id'];
                res.status(200).send({result: 'redirect', url: admin.prefix + admin.get.root})
            }else {
                res.status(500).json({errors: "Failed to authenticate"});
            }
        }
    });
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
        tags: { func: tagCategoryController.deleteTag, validations: [
            check('id').notEmpty().withMessage('Id is required')
        ]},
        categories: { func: tagCategoryController.deleteCategory, validations: [
            check('id').notEmpty().withMessage('Id is required')
        ]},
        products: { func: productController.deleteProduct, validations: [
            check('id').notEmpty().withMessage('Id is required')
        ]}
    },
    edit:
    {
        tags: { func: tagCategoryController.editTags, validations: [
            check('name').notEmpty().withMessage('Username is required'),
            check('color').notEmpty().withMessage('Color is required'),
            check('id').notEmpty().withMessage('Id is required')
        ]},
        categories: { func: tagCategoryController.editCategory, validations: [
            check('name').notEmpty().withMessage('Username is required'),
            check('color').notEmpty().withMessage('Color is required'),
            check('id').notEmpty().withMessage('Id is required')
        ]},
        products: { func: productController.editProduct, validations:[
            check('name').notEmpty().withMessage('Username is required'),
            check('manifacturer').notEmpty().withMessage('Manufacturer is required'),
            check('description').notEmpty().withMessage('Description is required'),
            check('cost').notEmpty().withMessage('Cost is required'),
            check('category').notEmpty().withMessage('Category is required'),
            check('visible').notEmpty().withMessage('Visibillity is required')
        ]}
    },
    create:
    {
        tags: { func: tagCategoryController.createTag, validations: [
            check('name').notEmpty().withMessage('Username is required'),
            check('color').notEmpty().withMessage('Color is required')
        ]},
        categories: { func: tagCategoryController.createCategory, validations: [
            check('name').notEmpty().withMessage('Username is required'),
            check('color').notEmpty().withMessage('Color is required')
        ]},
        products: { func: productController.createProduct, validations:[
            check('name').notEmpty().withMessage('Username is required'),
            check('manifacturer').notEmpty().withMessage('Manufacturer is required'),
            check('description').notEmpty().withMessage('Description is required'),
            check('cost').notEmpty().withMessage('Cost is required'),
            check('category').notEmpty().withMessage('Category is required'),
            check('visible').notEmpty().withMessage('Visibillity is required')
        ]},
        workers: { func: workerController.createWorker, validations:[
            check('username').notEmpty().withMessage('Username is required'),
            check('email').notEmpty().withMessage('Email is required'),
            check('email').isEmail().withMessage('Email is not valid'),
            check('pass').notEmpty().withMessage('Password is required').custom((value, {req}) => {
                if(value !== req.body.repass){
                    throw new Error("Passwords do not match");
                }
                return true;
            })
        ]}
    },
    error:
    {
        tags: tagCategoryController.handleTagError,
        categories: tagCategoryController.handleCategoryError,
        products: productController.handleError,
        workers: workerController.handleError
    }
};

router.get(admin.get.allInTable, async function(req, res){
    if(tableActions.get[req.params['table']]){
        tableActions.get[req.params['table']](req, res, (err, results) =>{
            if(err) {
                console.log(err)
            }
            res.json({table: req.params['table'], result: results.rows});
        });
    }
});
router.post(admin.post.deleteTable, async function(req, res){
    await validateReq('table', 'delete', req, res);
});

router.post(admin.post.editTable, async function(req, res){
    await validateReq('table', 'edit', req, res);
});

router.post(admin.post.createTable, async function(req, res){
    await validateReq('table', 'create', req, res);
});

router.post(admin.post.uploadImage, upload.single('productImage'), function(req, res){
    res.status(200).end();
});

router.post(admin.post.productAmmount, function(req, res) {
    productController.editAmmount(req, res, (err, _results) =>{
        if(err) {
            res.status(500).json({errors: tableActions['error']['products'](err)});
        }else {
            res.json({table: 'products'});
        }
    });
});

router.post(admin.post.productAddTag, function(req, res) {
    productController.assignTag(req, res, (err, _results) =>{
        if(err) {
            res.status(500).json({errors: tableActions['error']['products'](err)});
        }else {
            res.json({table: 'products'});
        }
    });
});

router.post(admin.post.productRemoveTag, function(req, res) {
    productController.removeTag(req, res, (err, _results) =>{
        if(err) {
            res.status(500).json({errors: tableActions['error']['products'](err)});
        }else {
            res.json({table: 'products'});
        }
    });
});

async function validateReq(paramName, type, req, res){
    if(tableActions[type][req.params[paramName]]){
        await Promise.all(tableActions[type][req.params[paramName]]
            .validations.map(async (element) => {
            await element.run(req)
        }));
        var errors = validationResult(req).array()
        if (errors.length) {
            res.status(500).json({filterErrors: errors})
        }else {
            tableActions[type][req.params[paramName]].func(req, res, (err, results) =>{
                if(err) {
                    res.status(500).json({errors: tableActions['error'][req.params[paramName]](err)});
                }else {
                    var id = null;
                    if(results.rowCount == 1){
                        id = results.rows[0].id;
                    }
                    res.json({id: id, table: req.params[paramName]})
                }
            });
        }
    }
}

module.exports = router;
