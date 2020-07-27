var db = require('./db');

function create(table, args, callback){
    db.query('INSERT INTO ' + table + ' (name, color, visible) VALUES ($1, $2, $3)',
    args, (error, results) => {
        if (error) {
            throw error;
        }
        callback(error, results);
    });
}
function getAll(res, table, callback){
    db.query('Select * FROM ' + table +' ;',
    (error, results) => {
        if (error) {
            throw error;
        }
        callback(error, results);

            //res.json({table: table, result: results.rows});
    });
}

function deleteTC(table, args, callback){
    db.query('DELETE FROM ' + table + ' WHERE id = $1',
    args, (error, results) => {
        if (error) {
            throw error;
        }
        callback(error, results);
    });
}

function edit(table, args, callback){
    db.query('UPDATE ' + table + ' SET name = $2, color = $3, visible = $4 WHERE id = $1',
    args, (error, results) => {
        if (error) {
            throw error;
        }
        callback(error, results);
    })
}

exports.createTag = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, color, visible } = req.body;
        create('tags', [name, color, visible], callback);
    }
}

exports.deleteTag = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body;
        deleteTC('tags', [id], callback);
    }
}

exports.getAllTags = (req, res, callback) =>{
    getAll(res, 'tags', callback);
}

exports.editTags = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, color, visible } = req.body;
        edit('tags', [id, name, color, visible], callback);
    }
}

exports.createCategory = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, color, visible } = req.body;
        create('categories', [name, color, visible], callback);
    }
}

exports.deleteCategory = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body;
        deleteTC('categories', [id], callback);
    }
}

exports.getAllCategories = (req, res, callback) =>{
    getAll(res, 'categories', callback);
}

exports.editCategory = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, color, visible } = req.body;
        edit('categories', [id, name, color, visible], callback);
    }
}