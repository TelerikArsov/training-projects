require('dotenv').config();
const { Pool } = require('pg');
const { compileClientWithDependenciesTracked } = require('pug');
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});
//USERS
const createUser = (req, res) => {
    const { username, email, pass } = req.body
    pool.query('INSERT INTO users (username, email, password, created_on) VALUES ($1, $2, $3, $4)',
    [username, email, pass, new Date().toISOString()], (error, results) => {
      if (error) {
        throw error
      }
      res.redirect('/login')
    })
}
// to refactor reasue code?
const loginUser = (req, res) => {
    const { username, pass } = req.body
    pool.query('Select id, username FROM users WHERE username = $1 and password = $2', [username, pass],
    (error, results)=> {
        if (error) {
            throw error
        }
        if (results.rowCount == 1) {
            req.session.user = username;
            req.session.role = "user"
            req.session.userId = results.rows[0]['id']  
        }
        res.redirect('/')
    })

}

var getUser = (req, callback) => {
    const username = req.session.user
    if (username) {
        pool.query('Select id, username, email FROM users WHERE username = $1 ', [username],
        (error, results)=> {
            if (error) {
                throw error
            }
            if (results.rowCount == 1) {
                callback(results.rows[0])
            }
        })
    }
}

const updateUser = (req, res) => {
    const { username, email, pass, newpass } = req.body
    const id = req.session.userId
    const newPassword = newpass == null ? pass : newpass;
    if(id){
        pool.query('UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 and password = $5',
        [username, email, newPassword, id, pass], (error, results) => {
            if (error) {
                throw error
            }
            req.session.user = username;
            res.redirect('/account')
        })
    }
    
}

// WORKERS

const createWorker = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { username, email, pass } = req.body
        pool.query('INSERT INTO workers (username, email, password, created_on) VALUES ($1, $2, $3, $4)',
        [username, email, pass, new Date().toISOString()], (error, results) => {
            if (error) {
                throw error
            }
            res.redirect('/admin')
        })
    }
}

const loginWorker = (req, res) => {
    const { username, pass } = req.body
    pool.query('Select id, username FROM workers WHERE username = $1 and password = $2', [username, pass],
    (error, results)=> {
        if (error) {
            throw error
        }
        if (results.rowCount == 1) {
            req.session.user = username;
            req.session.role = "admin"
            req.session.userId = results.rows[0]['id'];
            res.redirect('/admin')
        }
    })

}

//TAGS

function tcCreate(table, args, callback, cb_args){
    pool.query('INSERT INTO ' + table + ' (name, color, visible) VALUES ($1, $2, $3)',
    args, (error, results) => {
        if (error) {
            throw error
        }
        callback(...cb_args)
    })
}
function getAll(req, res, table){
    pool.query('Select * FROM ' + table +' ;',
    (error, results)=> {
        if (error) {
            throw error
        }
        res.json({table: table, result: results.rows})
    })
}

function tcDelete(table, args, callback, cb_args){
    pool.query('DELETE FROM ' + table + ' WHERE id = $1',
    args, (error, results) => {
        if (error) {
            throw error
        }
        callback(...cb_args)
    })
}

function tcEdit(table, args, callback, cb_args){
    pool.query('UPDATE ' + table + ' SET name = $2, color = $3, visible = $4 WHERE id = $1',
    args, (error, results) => {
        if (error) {
            throw error
        }
        callback(...cb_args)
    })
}

const createTag = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, color, visible } = req.body
        tcCreate('tags', [name, color, visible], getAll, [req, res, 'tags'])
    }
}

const deleteTag = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body
        tcDelete('tags', [id], getAll, [req, res, 'tags'])
    }
}

const getAllTags = (req, res) =>{
    if(req.session.user && req.session.role == "admin"){
        getAll(req, res, 'tags')
    }
}

const editTags = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, color, visible } = req.body
        tcEdit('tags', [id, name, color, visible], getAll, [req, res, 'tags'])
    }
}

const createCategory = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, color, visible } = req.body
        tcCreate('categories', [name, color, visible], getAll, [req, res, 'categories'])
    }
}

const deleteCategory = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body
        tcDelete('categories', [id], getAll, [req, res, 'categories'])
    }
}

const getAllCategories = (req, res) =>{
    if(req.session.user && req.session.role == "admin"){
        getAll(req, res, 'categories')
    }
}

const editCategory = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, color, visible } = req.body
        tcEdit('categories', [id, name, color, visible], getAll, [req, res, 'categories'])
    }
}

//product

function getAllProductsFunc(req, res){ 
    pool.query('Select p.id, p.name, manifacturer, description, cost, c.name as category, p.visible FROM products as p LEFT JOIN categories as c ON c.id = p.category_id;',
    (error, results)=> {
        if (error) {
            throw error
        }
        res.json({table: 'products', result: results.rows})
    })
}

const createProduct = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, manifacturer, description, cost, category, visible } = req.body
        pool.query('INSERT INTO products (name, manifacturer, description, cost, category_id, visible) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, manifacturer, description, cost, category, visible], (error, results) => {
            if (error) {
                throw error
            }
            getAllProductsFunc(req, res)
        })
    }
}

const deleteProduct = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body
        console.log(id)
        pool.query('DELETE FROM products WHERE id = $1',
        [id], (error, results) => {
            if (error) {
                throw error
            }
            getAllProductsFunc(req, res)
        })
    }
}

const getAllProducts = (req, res) =>{
    if(req.session.user && req.session.role == "admin"){
        getAllProductsFunc(req, res)
    }
}

const editProduct = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, manifacturer, description, cost, category, visible } = req.body
        pool.query('UPDATE products SET name = $2, manifacturer = $3, description = $4, cost = $5, category_id = $6, visible = $7 WHERE id = $1',
        [id, name, manifacturer, description, cost, category, visible], (error, results) => {
            if (error) {
                throw error
            }
            getAllProductsFunc(req, res)
        })
    }
}

module.exports = {
    createUser,
    loginUser,
    getUser,
    updateUser,
    createWorker,
    loginWorker,
    createTag,
    deleteTag,
    getAllTags,
    editTags,
    createCategory,
    deleteCategory,
    getAllCategories,
    editCategory,
    createProduct,
    deleteProduct,
    getAllProducts,
    editProduct
}