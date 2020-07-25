require('dotenv').config();
const express = require('express');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

app.use(session({secret: process.env.SESSIONSECRET,
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260}),
    saveUninitialized: false,
    resave: false}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))
app.set('views', './views');
app.set('view engine', 'pug');


const { check, validationResult} = require('express-validator');


const db = require('./queries');

app.listen(port, () => console.log(`Server started on port: ${port}`));

app.get('/', function(req, res){
    console.log(req.session.user)
    res.render('index', {title: "Hey", message: "Hello there!", username: req.session.user});
});

app.get('/register', function(req, res){
    res.render('register');
});

app.get('/worker/login', function(req, res){
    res.render('login_worker');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/admin', function(req, res){
    res.render('admin_panel', {username: req.session.user});
});
app.get('/admin/create_worker', function(req, res){
    res.render('register_worker');
});
app.get('/admin/create', function(req, res){
    res.render('create');
});


app.get('/account', function(req, res) {
    if(req.session.user){
        db.getUser(req, (prop) => res.render('account', prop));
    }
});

app.post('/register', [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').notEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is not valid'),
    check('pass').notEmpty().withMessage('Password is required').custom((value, {req}) => {
        if(value !== req.body.repass){
            throw new Error("Passwords do not match");
        }
        return true;
    })
], function(req, res) {
    handleErrors(req, res, db.createUser, 'register');
});

app.post('/account', [
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
    handleErrors(req, res, db.updateUser, 'account');
});

app.post('/logout', function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
})

app.post('/worker/login', [
    check('username').notEmpty().withMessage('Username is required'),
    check('pass').notEmpty().withMessage('Password is required')
],  function(req, res) {
    handleErrors(req, res, db.loginWorker, 'login_worker');
});

app.post('/admin/create_worker', [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').notEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is not valid'),
    check('pass').notEmpty().withMessage('Password is required').custom((value, {req}) => {
        if(value !== req.body.repass){
            throw new Error("Passwords do not match");
        }
        return true;
    })
], function(req, res) {
    handleErrors(req, res, db.createWorker, 'register_worker');
});


var tableActions = {get: 
    {
        tags: db.getAllTags,
        categories: db.getAllCategories,
        products: db.getAllProducts
    },
    delete: 
    {
        tags: db.deleteTag,
        categories: db.deleteCategory,
        products: db.deleteProduct
    },
    edit:
    {
        tags: db.editTags,
        categories: db.editCategory,
        products: db.editProduct
    }
};

app.post('/admin/getAll/:table', function(req, res){
    if(tableActions.get[req.params['table']]){
        tableActions.get[req.params['table']](req, res)
    }
});
app.post('/admin/delete/:table', function(req, res){
    if(tableActions.delete[req.params['table']]){
        tableActions.delete[req.params['table']](req, res)
    }
});

app.post('/admin/edit/:table', function(req, res){
    if(tableActions.edit[req.params['table']]){
        tableActions.edit[req.params['table']](req, res)
    }
});


// refactor be like at the top
app.post('/admin/tagCreate', [
    check('name').notEmpty().withMessage('Username is required'),
    check('color').notEmpty().withMessage('Color is required')
], function(req, res) {
    console.log(req.body)
    handleErrors(req, res, db.createTag, 'create');
});

app.post('/admin/categoryCreate', [
    check('name').notEmpty().withMessage('Username is required'),
    check('color').notEmpty().withMessage('Color is required')
], function(req, res) {
    console.log(req.body)
    handleErrors(req, res, db.createCategory, 'create');
});

app.post('/admin/productCreate', [
    check('name').notEmpty().withMessage('Username is required'),
    check('manifacturer').notEmpty().withMessage('Manufacturer is required'),
    check('description').notEmpty().withMessage('Description is required'),
    check('cost').notEmpty().withMessage('Cost is required'),
    check('category').notEmpty().withMessage('Category is required'),
    check('visible').notEmpty().withMessage('Visibillity is required')
], function(req, res) {
    console.log(req.body)
    handleErrors(req, res, db.createProduct, 'create');
});

app.post('/login', [
    check('username').notEmpty().withMessage('Username is required'),
    check('pass').notEmpty().withMessage('Password is required')
],  function(req, res) {
    handleErrors(req, res, db.loginUser, 'login');
});


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