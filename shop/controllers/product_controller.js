var db = require('./db');

var filterProps = {
    'name': {dbQuery: 'p.name', type: 'text'},
    'category': {dbQuery: 'c.name', type: 'exactText', invisible: true},
    'manifacturer': {dbQuery: 'manifacturer', type: 'dropdown'},
    'cost': {dbQuery: 'cost', type: 'range'}
};

exports.handleError = (err) => {
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

exports.filterProps = Object.assign({}, ...Object.entries(filterProps)
    .map(([k, v]) => {
        if(!v['invisible']){
            return ({[k]: {
                name: k[0].toUpperCase() + k.slice(1), 
                type: v['type']
            }});
        }
    }));

function addAmmount(ammount, product_id, callback, result) {
    if(ammount && product_id){
        db.query('INSERT INTO product_quantity (product_id, quantity) VALUES ($1, $2)',
        [product_id, ammount],(error, res) => {
            if (error) {
                callback(error, res);
            }
            callback(error, result)
        });
    }
}

exports.editAmmount = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        db.query('UPDATE product_quantity SET quantity = $2 WHERE product_id = $1 ',
        Object.values(req.body), callback);
    }
}

exports.createProduct = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, manifacturer, description, cost, category, visible, ammount } = req.body;
        db.query('INSERT INTO products (name, manifacturer, description, cost, category_id, visible) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [name, manifacturer, description, cost, category, visible], (error, results) => {
            if (error) {
                callback(error, results);
            }
            addAmmount(ammount, results.rows[0].id, callback, results)
        })
    }
}

exports.deleteProduct = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body
        db.query('DELETE FROM products WHERE id = $1',
        [id], callback);
    }
}

exports.getAllProducts = (req, res, callback) => {
    var query = `SELECT p.id, p.name, manifacturer, description, cost, c.name AS
    category, p.visible, pq.quantity AS ammount FROM products AS p LEFT JOIN categories AS c ON c.id = p.category_id
    LEFT JOIN product_quantity AS pq ON pq.product_id = p.id`;
    if(req.session.role != "admin") {
        query += ' WHERE p.visible = TRUE';
    }
    query += ';';
    db.query(query, callback);
}

exports.getProductsByFilter = (req, res, callback) => {
    if (req.body) {
        for (var key in req.body) {
            if (/\[\]$/.test(key)) {
            req.body[key.replace(/\[\]$/, '')] = req.body[key] || [];
            delete req.body[key];
            }
        }
    }
    //console.log(req.body)
    var query = `SELECT p.id, p.name, manifacturer, description, cost, c.name AS category, AVG(pr.rating) AS product_rating,
    p.visible FROM products AS p LEFT JOIN categories AS c ON c.id = p.category_id
    LEFT JOIN product_ratings AS pr on p.id = pr.product_id`;
    var whereSet = false;
    if(req.session.role != "admin") {
        query += ' WHERE p.visible = TRUE';
        whereSet = true;
    }
    var count = 1;
    for(var prop in req.body) {
        if(filterProps[prop] && req.body[prop] != ''){
            if(!whereSet){
                query += ' WHERE ';
                whereSet = true;
            }else {
                query += ' AND ';
            }
            if(filterProps[prop]['type'] == 'text' || filterProps[prop]['type'] == 'dropdown'){
                query += `${filterProps[prop]['dbQuery']} LIKE '%' || $${count} || '%'`;
            }else if(filterProps[prop]['type'] == 'exactText'){
                query += `${filterProps[prop]['dbQuery']} = $${count}`;
            }else if(filterProps[prop]['type'] == 'range'){
                query += `${filterProps[prop]['dbQuery']} >= $${count} AND `;
                count++;
                query += `${filterProps[prop]['dbQuery']} <= $${count}`;
            }
            count++;
        }
    }
    query += 'GROUP BY p.id, c.name;';
    //console.log(query, Object.values(req.body).filter(
        //function (el) { return el != '';}).reduce((acc, val) => acc.concat(val), []))
    db.query(query, Object.values(req.body).filter(
        function (el) { return el != '';}).reduce((acc, val) => acc.concat(val), []),
    callback);
}

exports.getDropdownPropBy = async (field, leadingValue) => {
    var query = `SELECT DISTINCT ${field} FROM products 
    LEFT JOIN categories AS c on c.id = category_id
    WHERE c.name = $1`;
    var err = null;
    var rows = null;
    try{
        rows = await db.asyncQuery(query, [leadingValue]);
    }catch(e){
        err = e;
    }
    return [err, rows];
}

exports.getRangeProp = async (field, leadingValue) => {
    var query = `SELECT MAX(${field}), MIN(${field}) FROM products 
    LEFT JOIN categories AS c on c.id = category_id
    WHERE c.name = $1`;
    var err = null;
    var rows = null;
    try{
        rows = await db.asyncQuery(query, [leadingValue]);
    }catch(e){
        err = e;
    }
    return [err, rows];
}

exports.assignTag = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, tag_id } = req.body;
        if(id !== '' && tag_id !== ''){
            db.query(`INSERT INTO product_tags 
            (product_id, tag_id) VALUES ($1, $2)`, [id, tag_id], callback);
        }
    }
}

exports.removeTag = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, tag_id } = req.body
        db.query('DELETE FROM product_tags WHERE product_id = $1 and tag_id = $2',
        [id, tag_id], callback);
    }
}

exports.getAssignedTags = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.query;
        db.query(`SELECT * FROM tags WHERE id IN (
            SELECT tag_id FROM product_tags
            WHERE product_id = $1)`, [id], callback);
    }
}

exports.getNotAssignedTags = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.query;
        db.query(`SELECT * FROM tags WHERE id NOT IN (
            SELECT tag_id FROM product_tags
            WHERE product_id = $1)`, [id], callback);
    }
}

exports.editProduct = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, manifacturer, description, cost, category, visible } = req.body
        db.query(`UPDATE products SET name = $2, manifacturer = $3, description = $4,
        cost = $5, category_id = $6, visible = $7 WHERE id = $1`,
        [id, name, manifacturer, description, cost, category, visible], callback);
    }
}

exports.addRating = (req, res, callback) => {
    var userId = req.session.userId;
    var {productId, rating} = req.body
    if(userId){
        db.query(`INSERT INTO product_ratings 
        (user_id, product_id, rating) VALUES ($1, $2, $3)`, [userId, productId, rating], callback);
    }
}
