var db = require('./db');
/**
 * @param {string} table    - Name of the edited table
 * @param {Array} args      - Array containing [name, color, visible]
 * @returns {Promise}       Promise containing id
 */
function create(table, args){
    return db.asyncQuery('INSERT INTO ' + table + ' (name, color, visible) VALUES ($1, $2, $3) RETURNING id',
    args);
}
/**
 * @param {string} table    - Name of the edited table
 * @returns {Promise}       Promise containing all the entries in the given table
 */
function getAll(table){
    return db.asyncQuery('Select * FROM ' + table +' ;');
}
/**
 * @param {string} table    - Name of the edited table
 * @param {Array} args      - Array containing [name, color, visible]
 * @returns {Promise}       Promise containing id
 */
function deleteTC(table, args){
    return db.asyncQuery('DELETE FROM ' + table + ' WHERE id = $1 RETURNING id',
    args);
}
/**
 * @param {string} table    - Name of the edited table
 * @param {Array} args      - Array containing [id, name, color, visible]
 * @returns {Promise}       Promise containing id
 */
function edit(table, args){
    return db.query('UPDATE ' + table + ' SET name = $2, color = $3, visible = $4 WHERE id = $1 RETURNING id',
    args);
}
/**
 * @param {string} name     - The tag's name
 * @param {string} color    - Color of the tag
 * @param {boolean} visible - whether the tag is visible to the user
 * @returns {Promise}       Promise containing the id of the created tag
 */
exports.createTag = (name, color, visible) => {
    // MOVE TO MAIN METHOS
    //if(req.session.user && req.session.role == "admin"){
    return create('tags', [name, color, visible]);
}
/**
 * @param {Number} id       - The tag's Id
 * @returns {Promise}       Promise containing the id of the deleted tag
 */
exports.deleteTag = (id) => {
   // if(req.session.user && req.session.role == "admin"){
    return deleteTC('tags', [id]);
    //}
}
/**
 * @returns {Promise}       Promise containing all the entries in tags table
 */
exports.getAllTags = () =>{
    return getAll('tags');
}
/**
 * @param {Number} id       - The tag's Id
 * @param {string} name     - The tag name
 * @param {string} color    - Color of the tag
 * @param {boolean} visible - whether the tag is visible to the user
 * @returns {Promise}       Promise containing the id of the edited tag
 */
exports.editTags = (id, name, color, visible) => {
    //if(req.session.user && req.session.role == "admin"){
    return edit('tags', [id, name, color, visible]);
    //}
}
/**
 * @param {string} name     - The category's name
 * @param {string} color    - Color of the category
 * @param {boolean} visible - whether the category is visible to the user
 * @returns {Promise}       Promise containing the id of the created category
 */
exports.createCategory = (name, color, visible) => {
    //if(req.session.user && req.session.role == "admin"){
    return create('categories', [name, color, visible]);
    //}
}
/**
 * @param {Number} id       - The category's Id
 * @returns {Promise}       Promise containing the id of the deleted category
 */
exports.deleteCategory = (id) => {
    //if(req.session.user && req.session.role == "admin"){
    return deleteTC('categories', [id]);
   // }
}
/**
 * @returns {Promise}       Promise containing all the entries in categories table
 */
exports.getAllCategories = () =>{
    return getAll('categories');
}
/**
 * @param {Number} id       - The categorys' Id
 * @param {string} name     - The category's name
 * @param {string} color    - Color of the category
 * @param {boolean} visible - whether the category is visible to the user
 * @returns {Promise}       Promise containing the id of the edited category
 */
exports.editCategory = (id, name, color, visible) => {
    return edit('categories', [id, name, color, visible]);
    //}
}