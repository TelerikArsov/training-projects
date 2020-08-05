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
        var propInfo = {};
        if(getPropInfo){
            for( prop in productController.filterProps){
                let err = null, res = null;
                if(productController.filterProps[prop]['type'] == 'dropdown') {
                    [err, res] = await productController.getDropdownPropBy(prop, req.body.category);
                    propInfo[prop] = {};
                    propInfo[prop]['type'] = 'dropDown';
                }else if(productController.filterProps[prop]['type'] == 'range') {
                    [err, res] = await productController.getRangeProp(prop, req.body.category);
                    propInfo[prop] = {};
                    propInfo[prop]['type'] = 'range';
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
})

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
})

module.exports = router;