var db = require('./db');

function create(table, args, callback){
    db.query('INSERT INTO ' + table + ' (name, color, visible) VALUES ($1, $2, $3) RETURNING id',
    args, callback);
}
function getAll(table, callback){
    db.query('Select * FROM ' + table +' ;', callback);
}

function deleteTC(table, args, callback){
    db.query('DELETE FROM ' + table + ' WHERE id = $1',
    args, callback);
}

function edit(table, args, callback){
    db.query('UPDATE ' + table + ' SET name = $2, color = $3, visible = $4 WHERE id = $1',
    args, callback);
}

exports.handleTagError = (err) => {
    var errorMsg = '';
    switch(err.code){
        case '23505':
            errorMsg = "Name already in use";
            break;
        default:
            errorMsg = "Unknown server error";
    }
    return errorMsg
}

exports.handleCategoryError = (err) => {
    var errorMsg = '';
    switch(err.code){
        case '23505':
            errorMsg = "Name already in use";
            break;
        default:
            errorMsg = "Unknown server error";
    }
    return errorMsg
}

exports.createTag = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, color, visible } = req.body;
        create('tags', [name, color, visible], callback);
    }
}

exports.deleteTag = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body;
        deleteTC('tags', [id], callback);
    }
}

exports.getAllTags = (_req, _res, callback) =>{
    getAll('tags', callback);
}

exports.editTags = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, color, visible } = req.body;
        edit('tags', [id, name, color, visible], callback);
    }
}

exports.createCategory = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, color, visible } = req.body;
        create('categories', [name, color, visible], callback);
    }
}

exports.deleteCategory = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body;
        deleteTC('categories', [id], callback);
    }
}

exports.getAllCategories = (_req, _res, callback) =>{
    getAll('categories', callback);
}

exports.editCategory = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, color, visible } = req.body;
        edit('categories', [id, name, color, visible], callback);
    }
}