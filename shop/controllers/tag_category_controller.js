var db = require('./db');

function create(table, args, callback, cb_args){
    db.query('INSERT INTO ' + table + ' (name, color, visible) VALUES ($1, $2, $3)',
    args, (error, results) => {
        if (error) {
            throw error;
        }
        callback(...cb_args, error, results);
    });
}
function getAll(res, table){
    db.query('Select * FROM ' + table +' ;',
    (error, results) => {
        if (error) {
            throw error;
        }
        res.json({table: table, result: results.rows});
    });
}

function deleteTC(table, args, callback, cb_args){
    db.query('DELETE FROM ' + table + ' WHERE id = $1',
    args, (error, results) => {
        if (error) {
            throw error;
        }
        callback(...cb_args, error, results);
    });
}

function edit(table, args, callback, cb_args){
    db.query('UPDATE ' + table + ' SET name = $2, color = $3, visible = $4 WHERE id = $1',
    args, (error, results) => {
        if (error) {
            throw error;
        }
        callback(...cb_args, error, results);
    })
}

exports.createTag = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, color, visible } = req.body;
        create('tags', [name, color, visible], getAll, [res, 'tags']);
    }
}

exports.deleteTag = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body;
        deleteTC('tags', [id], getAll, [res, 'tags']);
    }
}

exports.getAllTags = (req, res) =>{
    getAll(res, 'tags');
}

exports.editTags = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, color, visible } = req.body;
        edit('tags', [id, name, color, visible], getAll, [res, 'tags']);
    }
}

exports.createCategory = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, color, visible } = req.body;
        create('categories', [name, color, visible], getAll, [res, 'categories']);
    }
}

exports.deleteCategory = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body;
        deleteTC('categories', [id], getAll, [res, 'categories']);
    }
}

exports.getAllCategories = (req, res) =>{
    getAll(res, 'categories');
}

exports.editCategory = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, color, visible } = req.body;
        edit('categories', [id, name, color, visible], getAll, [res, 'categories']);
    }
}