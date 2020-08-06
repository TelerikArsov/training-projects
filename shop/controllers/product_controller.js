var db = require('./db');


exports.types = {
    text: 0,
    exactText: 1,
    dropdown: 2,
    range: 3,
    multiDropdown: 4
}

var filterProps = {
    'name': {dbQuery: 'p.name', type: this.types.text},
    'category': {dbQuery: 'c.name', type: this.types.exactText, invisible: true},
    'manifacturer': {dbQuery: 'manifacturer', type: this.types.dropdown, fetchQuery: "SELECT DISTINCT manifacturer FROM products LEFT JOIN categories AS c on c.id = category_id WHERE c.name = $1"},
    'cost': {dbQuery: 'cost', type: this.types.range, fetchQuery: "SELECT MAX(cost), MIN(cost) FROM products LEFT JOIN categories AS c on c.id = category_id WHERE c.name = $1"},
    'tags': {dbQuery: 't.id = pt.tag_id AND p.id = pt.product_id AND (t.name IN(',
        type: this.types.multiDropdown, fetchQuery: "SELECT DISTINCT t.name FROM products AS p LEFT JOIN product_tags AS pt ON pt.product_id = p.id LEFT JOIN tags AS t ON t.id = pt.tag_id WHERE p.category_id IN (SELECT id FROM categories WHERE name = $1)"}
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
                type: v['type'],
                fetchQuery: v['fetchQuery']
            }});
        }
    }));
exports.fetchableTypes = [
    this.types.range, this.types.dropdown, this.types.multiDropdown]


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
    if(req.session.role != "admin") {getRangeProp
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
    p.visible FROM products AS p
    LEFT JOIN product_tags AS pt ON pt.product_id = p.id
    LEFT JOIN tags AS t ON t.id = pt.tag_id 
    LEFT JOIN categories AS c ON c.id = p.category_id
    LEFT JOIN product_ratings AS pr on p.id = pr.product_id`;
    var whereSet = false;
    if(req.session.role != "admin") {
        query += ' WHERE p.visible = TRUE';
        whereSet = true;
    }
    var count = 1;
    var intersection = 0;
    for(var prop in req.body) {
        if(filterProps[prop] && req.body[prop] != ''){
            if(!whereSet){
                query += ' WHERE ';
                whereSet = true;
            }else {
                query += ' AND ';
            }
            if(filterProps[prop]['type'] == this.types.text || filterProps[prop]['type'] == this.types.dropdown){
                query += `${filterProps[prop]['dbQuery']} LIKE '%' || $${count} || '%'`;
            }else if(filterProps[prop]['type'] == this.types.exactText){
                query += `${filterProps[prop]['dbQuery']} = $${count}`;
            }else if(filterProps[prop]['type'] == this.types.range){
                query += `${filterProps[prop]['dbQuery']} >= $${count} AND `;
                count++;
                query += `${filterProps[prop]['dbQuery']} <= $${count}`;
            }else if(filterProps[prop]['type'] == this.types.multiDropdown){
                query += `${filterProps[prop]['dbQuery']}`;
                for(let i = 0; i < (Array.isArray(req.body[prop]) ? req.body[prop].length - 1 : 0); i++){
                    query += ` $${count}, `;
                    count++;
                }
                query += `$${count}))`;
                //should be option from req body
                intersection = (Array.isArray(req.body[prop]) ? req.body[prop].length : 1);
            }
            count++;
        }
    }
    var data = Object.values(req.body).filter(
        function (el) { return el != '';}).reduce((acc, val) => acc.concat(val), []);
    query += ' GROUP BY p.id, c.name';
    if(intersection) {
        query += ` HAVING COUNT( p.id ) = $${count}`;
        data.push(intersection)
    }
    query += ';';
    /*
    console.log(req.body)
    console.log(query);
    console.log(data);
    */
    //console.log(query, Object.values(req.body).filter(
        //function (el) { return el != '';}).reduce((acc, val) => acc.concat(val), []))
    db.query(query, data,
    callback);
}

exports.fetchPropBy = async (query, leadingValue) => {
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

async function ratingExists(userId, product_id){
    var err = null, res = null;
    var exists = null;
    try{
        res = await db.asyncQuery(`SELECT * FROM product_ratings WHERE 
            user_id = $1 AND product_id = $2`, [userId, product_id])
    } catch(e){
        err = e;
    }
    if(err == null && res.rowCount == 1){
        exists = res.rows[0].id;
    }
    return exists;
}

exports.addRating = async (req, res, callback) => {
    var userId = req.session.userId;
    var {productId, rating} = req.body
    if(userId){
        var exists = await ratingExists(userId, productId);
        if(exists){
            db.query(`UPDATE product_ratings SET rating = $3 WHERE user_id = $1 
                AND product_id = $2`, [userId, productId, rating], callback);
        }else{
            db.query(`INSERT INTO product_ratings (user_id, product_id, rating)
                VALUES ($1, $2, $3)`, [userId, productId, rating], callback);
        }
        
    }
}
