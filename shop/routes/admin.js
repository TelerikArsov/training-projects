const express = require('express');
const validate = require('../utils/').Validate;
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
    validate.handleValidation(req, res, workerController.loginWorker, (err, result) => {
        if(err){
            res.status(500).json({errors: workerController.handleError(err)});
        }else{
            if (result.rowCount == 1) {
                req.session.user = result.rows[0]['username'];
                req.session.role = "admin";
                req.session.userId = result.rows[0]['id'];
                res.status(200).send({result: 'redirect', url:'/admin'})
            }else {
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

router.get('/getAll/:table', async function(req, res){
    if(tableActions.get[req.params['table']]){
        tableActions.get[req.params['table']](req, res, (err, results) =>
         res.json({table: req.params['table'], result: results.rows}))
    }
});
router.post('/delete/:table', async function(req, res){
    await validateReq('table', 'delete', req, res);
});

router.post('/edit/:table', async function(req, res){
    await validateReq('table', 'edit', req, res);
});

router.post('/create/:table' , async function(req, res){
    await validateReq('table', 'create', req, res);
});

router.post('/product/ammount', function(req, res) {

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
            tableActions[type][req.params[paramName]].func(req, res, (err, _results) =>{
                if(err) {
                    res.status(500).json({errors: tableActions['error'][req.params[paramName]](err)});
                }else {
                    res.json({table: req.params[paramName]})
                }
            });
        }
    }
}

module.exports = router;
