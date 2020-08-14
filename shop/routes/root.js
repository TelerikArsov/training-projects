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

router.get(root.get.catalog, function(req, res, next){
    //console.log(productController.filterProps);
    tagCategoryController.getAllCategories(req, res)
        .then(result => res.render('catalog', {categories: result}))
        .catch(err => next(err));
});
router.get(root.get.orders, function(_req, res){
    res.render('ordersUser');
})

router.post(root.post.catalog, function(req, res, next){
    var getPropInfo = req.body.getPropInfo;
    delete req.body.getPropInfo;
    if (req.body) {
        for (var key in req.body) {
            if (/\[\]$/.test(key)) {
            req.body[key.replace(/\[\]$/, '')] = req.body[key] || [];
            delete req.body[key];
            }
        }
    }
    productController.getProductsByFilter(req.body, req.session.role, getPropInfo)
    .then(result => {  
        res.json({result: result.rows, propInfo: result.propInfo})
    }).catch(err => next(err))
});

router.post(root.post.addToCart, function(req, res, next){
    if(req.session.user){
        cartController.addToCart(req, res,)
            .then(result => res.status(200).json({result: result.rows[0]}))
            .catch(err => next(err))
    }else {
        res.status(500).json({errors: "Not logged in!"});
    }
});

router.get(root.get.cart, function(req, res, next) {
    if(req.session.user){
        cartController.getCartItems(req.session.userId, req.body.productId)
            .then(result => res.status(200).json({result: result.rows}))
            .catch(err => next(err))  
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
});


router.get(root.get.ordersTable, function(req, res, next){
    if(req.session.user){
        orderController.getOrders(req.session.userId, req.session.role, req.params.id)
            .then(result => res.status(200).json({result: result.rows}))
            .catch(err => next(err))
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
})

router.get(root.get.order, function(req, res, next){
    if(req.session.user){
        orderController.getOrderItems(req.session.userId, req.session.role)
            .then(result => res.status(200).json({result: result.rows}))
            .catch(err => next(err));
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
})

router.post(root.post.cartChangeQuantity, function(req, res, next){
    if(req.session.user){
        cartController.changeQuantity(req.session.userId, req.body.productId, req.body.incr)
            .then(result => res.status(200).json({result: result.rows}))
            .catch(err => next(err));
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
});

router.post(root.post.deleteCartItem, function(req, res, next){
    if(req.session.user){
        cartController.deleteCartItem(req.session.userId, res.body.productId)
            .then(result => res.status(200).json({result: result.rows}))
            .catch(err => next(err));
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
});

router.post(root.post.rateProduct, function(req, res, next){
    if(req.session.user){
        var {productId, rating} = req.body
        productController.addRating(req.session.userId, productId, rating)
            .then(() => res.status(200).json({success: true}))
            .catch(err => next(err))
    }else{
        res.status(500).json({errors: "Not logged in!"});
    }
})

router.post(root.post.createOrder, [
        check('paid').notEmpty().withMessage('Payment must be made'),
        check('name').notEmpty().withMessage('Name is required'),
        check('address').notEmpty().withMessage('Address is not valid'),
], function(req, res, next){
        if(req.session.user){
            let errors = validate.handleValidation(req, res)
            if(errors){
                res.status(500).json({filterErrors: errors})
            }else{
                let userId = req.session.userId
                let {paid, name, address} = req.body;
                orderController.createOrder(userId)
                    .then(result =>  res.status(200).json({result: result}))
                    .catch(err => next(err)) 
            }
        }else{
            res.status(500).json({errors: "Not logged in!"})
        }
    })

module.exports = router;