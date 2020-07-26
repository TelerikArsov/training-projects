const express = require('express');
const workerController = require('../controllers/worker_controller');
const productController = require('../controllers/product_controller');
const tagCategoryController = require('../controllers/tag_category_controller');
const router = express.Router();
const { check, validationResult} = require('express-validator');

router.get('/', function(req, res){
    res.render('admin_panel', {admin: req.session.role == "admin" ? true : false});
});


router.get('/login', function(req, res){
    res.render('login_worker');
});


router.get('/create/worker', function(req, res){
    res.render('register_worker');
});
router.get('/create', function(req, res){
    res.render('create');
});

//AUTH

router.post('/login', [
    check('username').notEmpty().withMessage('Username is required'),
    check('pass').notEmpty().withMessage('Password is required')
],  function(req, res) {
    handleErrors(req, res, workerController.loginWorker, 'login_worker');
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

var tableActions = {
    get: 
    {
        tags: tagCategoryController.getAllTags,
        categories: tagCategoryController.getAllCategories,
        products: productController.getAllProducts,
    },
    delete: 
    {
        tags: tagCategoryController.deleteTag,
        categories: tagCategoryController.deleteCategory,
        products: productController.deleteProduct
    },
    edit:
    {
        tags: tagCategoryController.editTags,
        categories: tagCategoryController.editCategory,
        products: productController.editProduct
    }
};

router.get('/getAll/:table', function(req, res){
    if(tableActions.get[req.params['table']]){
        tableActions.get[req.params['table']](req, res)
    }
});
router.post('/delete/:table', function(req, res){
    if(tableActions.delete[req.params['table']]){
        tableActions.delete[req.params['table']](req, res)
    }
});

router.post('/edit/:table', function(req, res){
    if(tableActions.edit[req.params['table']]){
        tableActions.edit[req.params['table']](req, res)
    }
});

router.post('/create/tag', [
    check('name').notEmpty().withMessage('Username is required'),
    check('color').notEmpty().withMessage('Color is required')
],  function(req, res){
        var errors = validationResult(req).array()
        console.log(errors)
        if (errors.length) {
            res.json({errors: errors})
        }else {
            tagCategoryController.createTag(req, res)
        }
})

router.post('/create/category', [
    check('name').notEmpty().withMessage('Username is required'),
    check('color').notEmpty().withMessage('Color is required')
],  function(req, res){
        var errors = validationResult(req).array()
        console.log(errors)
        if (errors.length) {
            res.json({errors: errors})
        }else {
            tagCategoryController.createCategory(req, res)
        }
})

router.post('/create/product', [
    check('name').notEmpty().withMessage('Username is required'),
    check('manifacturer').notEmpty().withMessage('Manufacturer is required'),
    check('description').notEmpty().withMessage('Description is required'),
    check('cost').notEmpty().withMessage('Cost is required'),
    check('category').notEmpty().withMessage('Category is required'),
    check('visible').notEmpty().withMessage('Visibillity is required')
],  function(req, res){
        var errors = validationResult(req).array()
        console.log(errors)
        if (errors.length) {
            res.json({errors: errors})
        }else {
            productController.createProduct(req, res)
        }
})

router.post('/create/worker', [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').notEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is not valid'),
    check('pass').notEmpty().withMessage('Password is required').custom((value, {req}) => {
        if(value !== req.body.repass){
            throw new Error("Passwords do not match");
        }
        return true;
    })
],  function(req, res){
        var errors = validationResult(req).array()
        console.log(errors)
        if (errors.length) {
            res.json({errors: errors})
        }else {
            workerController.createWorker(req, res)
        }
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
/*
// refactor be like at the top
router.post('/admin/tagCreate', [
   
], function(req, res) {
    console.log(req.body)
    handleErrors(req, res, db.createTag, 'create');
});

router.post('/admin/categoryCreate', [
    
], function(req, res) {
    console.log(req.body)
    handleErrors(req, res, db.createCategory, 'create');
});

router.post('/admin/productCreate', [
    
], function(req, res) {
    console.log(req.body)
    handleErrors(req, res, db.createProduct, 'create');
});

router.post('/admin/create/worker', [
   
], function(req, res) {
    handleErrors(req, res, db.createWorker, 'register_worker');
});*/
