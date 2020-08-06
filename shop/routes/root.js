const express = require("express");
const productController = require('../controllers/product_controller');
const cartController = require('../controllers/cart_controller');
const tagCategoryController = require('../controllers/tag_category_controller');
const router = express.Router();

router.get('/', function(req, res){
    console.log(req.session.user)
    res.render('index', {title: "Hey", message: "Hello there!", username: req.session.user});
});

router.use((req, res, next) => {
    if(req.originalUrl == '/catalog'){
        res.locals.filterProps = productController.filterProps;
        res.locals.filterTypes = productController.types;
    }
    next();
})

router.get('/catalog', function(req, res){
    //console.log(productController.filterProps);
    tagCategoryController.getAllCategories(req, res, (err, results) =>
     res.render('catalog', {categories: results.rows}));
});

router.post('/catalog', function(req, res){
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

router.post('/catalog/addToCart', function(req, res){
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

router.get('/catalog/getCart', function(req, res) {
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

router.post('/catalog/cartChangeQuantity', function(req, res){
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

router.post('/catalog/deleteCartItem', function(req, res){
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

router.post('/catalog/rateProduct', function(req, res){
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

module.exports = router;