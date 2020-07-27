const express = require("express");
const productController = require('../controllers/product_controller');
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
    productController.getProductsByFilter(req, res, (err, results) =>
        res.json({result: results.rows}));
});

module.exports = router;