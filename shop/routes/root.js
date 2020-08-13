const express = require("express");
const validate = require('../utils/').Validate;
const productController = require('../controllers/product_controller');
const cartController = require('../controllers/cart_controller');
const orderController = require('../controllers/order_controller')
const tagCategoryController = require('../controllers/tag_category_controller');
const root = require('../utils/routes').routes.root
const router = express.Router();

const { check, validationResult} = require('express-validator');

router.get(root.get.root, function(req, res){
    console.log(req.session.user)
    res.render('index', {title: "Hey", message: "Hello there!", username: req.session.user});
});

router.use((req, res, next) => {
    if(req.originalUrl == root.get.catalog){
        res.locals.filterProps = productController.filterProps;
        res.locals.filterTypes = productController.types;
    }
    next();
})

router.get(root.get.catalog, function(req, res){
    //console.log(productController.filterProps);
    tagCategoryController.getAllCategories(req, res, (err, results) =>
     res.render('catalog', {categories: results.rows}));
});
router.get(root.get.orders, function(req, res){
    res.render('ordersUser');
})

router.post(root.post.catalog, function(req, res){
    var getPropInfo = req.body.getPropInfo;
    delete req.body.getPropInfo;
    productController.getProductsByFilter(req, res, async (err, results) =>
    {   
        if(err){
            console.log(err);
            res.status(500).json({errors: "Something went wrong"});
        }
        var propInfo = {};
        if(getPropInfo){
            for( prop in productController.filterProps){
                let err = null, res = null;
                if(productController.fetchableTypes.includes(productController.filterProps[prop]['type'])) {
                    [err, res] = await productController.fetchPropBy(productController.filterProps[prop]['fetchQuery'],
                         req.body.category);
                    propInfo[prop] = {};
                    propInfo[prop]['type'] = productController.filterProps[prop]['type'];
                }
                if(err) {
                    propInfo[prop]['err'] = err;
                }else if(res) {
                    propInfo[prop]['values'] = res.rows;
                }
            }
        }
        //console.log(propInfo)
        res.json({result: results.rows, propInfo: propInfo})
    });
});

router.post(root.post.addToCart, function(req, res){
    if(req.session.user){
        cartController.addToCart(req, res, (err, result) => {
            if(err){
                console.log(err);
                res.status(500).json({errors: "Something went wrong"});
            }
            res.status(200).json({result: result.rows[0]});
        })
    }else {
        res.status(500).json({errors: "Not logged in!"});
    }
});

router.get(root.get.cart, function(req, res) {
    if(req.session.user){
        cartController.getCartItems(req, res, (err, result) => {
            if(err){
                console.log(err)
                res.status(500).json({errors: "Oops Cant get cart"});
            }
            res.status(200).json({result: result.rows});
        })
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
});


router.get(root.get.orders, function(req, res){
    if(req.session.user){
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

router.get(root.get.order, function(req, res){
    if(req.session.user){
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

router.post(root.post.cartChangeQuantity, function(req, res){
    if(req.session.user){
        cartController.changeQuantity(req, res, (err, result) => {
            if(err){
                console.log(err)
                res.status(500).json({errors: "Oops Cant change"});
            }
            res.status(200).json({result: result.rows});
        })
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
});

router.post(root.post.deleteCartItem, function(req, res){
    if(req.session.user){
        cartController.deleteCartItem(req, res, (err, result) => {
            if(err){
                res.status(500).json({errors: "Cant delete"});
            }
            res.status(200).json({result: result.rows});
        });
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
});

router.post(root.post.rateProduct, function(req, res){
    if(req.session.user){
        productController.addRating(req, res, (err, result) => {
            if(err){
                console.log(err)
                res.status(500).json({errors: "Oops Cant rate"});
            }
            res.status(200).json({success: true});
        })
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
})

router.post(root.post.createOrder, [
    check('paid').notEmpty().withMessage('Payment must be made'),
    check('name').notEmpty().withMessage('Name is required'),
    check('address').notEmpty().withMessage('Address is not valid'),
], function(req, res){
    if(req.session.user){
        validate.handleValidation(req, res, orderController.createOrder, (err, result) => {
            console.log(err)
            if(err){
                res.status(500).json({error:" Cant make order"});
            }else{
                res.status(200).json({result: result});
            }
        });
    }else{
        res.status(500).json({errors: "Not logged in!"})
    }
})

module.exports = router;