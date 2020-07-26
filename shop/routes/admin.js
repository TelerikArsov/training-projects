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
        tag: { func: tagCategoryController.createTag, validations: [
            check('name').notEmpty().withMessage('Username is required'),
            check('color').notEmpty().withMessage('Color is required')
        ]},
        category: { func: tagCategoryController.createCategory, validations: [
            check('name').notEmpty().withMessage('Username is required'),
            check('color').notEmpty().withMessage('Color is required')
        ]},
        product: { func: productController.createProduct, validations:[
            check('name').notEmpty().withMessage('Username is required'),
            check('manifacturer').notEmpty().withMessage('Manufacturer is required'),
            check('description').notEmpty().withMessage('Description is required'),
            check('cost').notEmpty().withMessage('Cost is required'),
            check('category').notEmpty().withMessage('Category is required'),
            check('visible').notEmpty().withMessage('Visibillity is required')
        ]},
        worker: { func: workerController.createWorker, validations:[
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
    }
};

router.get('/getAll/:table', async function(req, res){
    if(tableActions.get[req.params['table']]){
        tableActions.get[req.params['table']](req, res)
    }
});
router.post('/delete/:table', async function(req, res){
    await validateReq('table', 'delete', req, res);
});

router.post('/edit/:table', async function(req, res){
    await validateReq('table', 'edit', req, res);
});

router.post('/create/:type' , async function(req, res){
    await validateReq('type', 'create', req, res);
})

async function validateReq(paramName, type, req, res){
    if(tableActions[type][req.params[paramName]]){
        await Promise.all(tableActions[type][req.params[paramName]]
            .validations.map(async (element) => {
            await element.run(req)
        }));
        var errors = validationResult(req).array()
        console.log(errors)
        if (errors.length) {
            res.json({errors: errors})
        }else {
            tableActions[type][req.params[paramName]].func(req, res)
        }
    }
}

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
