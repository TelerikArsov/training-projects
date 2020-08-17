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

async function fetchPropBy(query, leadingValue){
   return await db.asyncQuery(query, [leadingValue]);
}


function addAmmount(ammount, product_id, callback, result) {
    return db.asyncQuery('INSERT INTO product_quantity (product_id, quantity) VALUES ($1, $2)',
        [product_id, ammount]);
}


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

exports.filterProps = Object.assign({}, ...Object.entries(filterProps).map(([k, v]) => {
        if(!v['invisible']){
            return ({[k]: {
                name: k[0].toUpperCase() + k.slice(1), 
                type: v['type'],
                fetchQuery: v['fetchQuery']
            }});
        }
    }));
exports.fetchableTypes = [
    this.types.range, this.types.dropdown, this.types.multiDropdown
]

exports.editAmmount = (id, ammount) => {
    return db.asyncQuery('UPDATE product_quantity SET quantity = $2 WHERE product_id = $1 ', [id, ammount]);
}

exports.createProduct = async (name, manifacturer, description, cost, category, visible, ammount) => {
    const result = await db.asyncQuery(`INSERT INTO products (name, manifacturer, description, cost,
        category_id, visible) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [name, manifacturer, description, cost, category, visible]);
    return addAmmount(ammount, result.rows[0].id);
        
}

exports.deleteProduct = (id) => {
    db.asyncQuery('DELETE FROM products WHERE id = $1', [id]);
}
exports.getAllProducts = (role) => {
    var query = `SELECT p.id, p.name, manifacturer, description, cost, c.name AS
    category, p.visible, pq.quantity AS ammount FROM products AS p LEFT JOIN categories AS c ON c.id = p.category_id
    LEFT JOIN product_quantity AS pq ON pq.product_id = p.id`;
    if(role != "admin") {
        query += ' WHERE p.visible = TRUE';
    }
    query += ';';
    return db.asyncQuery(query);
}
exports.editProduct = (id, name, manifacturer, description, cost, category, visible) => {
    return db.asyncQuery(`UPDATE products SET name = $2, manifacturer = $3, 
        description = $4, cost = $5, category_id = $6, visible = $7 WHERE id = $1`,
        [id, name, manifacturer, description, cost, category, visible]);
}

exports.getProductsByFilter = async (filters, role, getPropInfo) => {
    
    //console.log(req.body)
    var query = `SELECT p.id, p.name, manifacturer, description, cost, c.name AS category, AVG(pr.rating) AS product_rating,
    p.visible FROM products AS p
    LEFT JOIN product_tags AS pt ON pt.product_id = p.id
    LEFT JOIN tags AS t ON t.id = pt.tag_id 
    LEFT JOIN categories AS c ON c.id = p.category_id
    LEFT JOIN product_ratings AS pr on p.id = pr.product_id`;
    var whereSet = false;
    if(role != "admin") {
        query += ' WHERE p.visible = TRUE';
        whereSet = true;
    }
    var count = 1;
    var intersection = 0;
    for(let filter in filters) {
        if(filterProps[filter] && filters[filter] != ''){
            if(!whereSet){
                query += ' WHERE ';
                whereSet = true;
            }else {
                query += ' AND ';
            }
            if(filterProps[filter]['type'] == this.types.text || filterProps[filter]['type'] == this.types.dropdown){
                query += `${filterProps[filter]['dbQuery']} LIKE '%' || $${count} || '%'`;
            }else if(filterProps[filter]['type'] == this.types.exactText){
                query += `${filterProps[filter]['dbQuery']} = $${count}`;
            }else if(filterProps[filter]['type'] == this.types.range){
                query += `${filterProps[filter]['dbQuery']} >= $${count} AND `;
                count++;
                query += `${filterProps[filter]['dbQuery']} <= $${count}`;
            }else if(filterProps[filter]['type'] == this.types.multiDropdown){
                query += `${filterProps[filter]['dbQuery']}`;
                for(let i = 0; i < (Array.isArray(filters[filter]) ? filters[filter].length - 1 : 0); i++){
                    query += ` $${count}, `;
                    count++;
                }
                query += `$${count}))`;
                //should be option from req body
                intersection = (Array.isArray(filters[filter]) ? filters[filter].length : 1);
            }
            count++;
        }
    }
    var data = Object.values(filters).filter(
        function (el) { return el != '';}).reduce((acc, val) => acc.concat(val), []);
    query += ' GROUP BY p.id, c.name';
    if(intersection) {
        query += ` HAVING COUNT( p.id ) = $${count}`;
        data.push(intersection)
    }
    query += ';';

    let result = {}
    result.rows = (await db.asyncQuery(query, data)).rows;
    result.propInfo = {};

    if(getPropInfo){
        for(let filter in this.filterProps){
            if(this.fetchableTypes.includes(this.filterProps[filter]['type'])) {
                try{
                    res = await fetchPropBy(this.filterProps[filter]['fetchQuery'],
                            filters.category);
                    result.propInfo[filter] = {};
                    result.propInfo[filter]['type'] = this.filterProps[filter]['type'];
                    result.propInfo[filter]['values'] = res.rows;
                }catch(err) {
                    result.propInfo[filter]['err'] = err;
                }
            }
        }
    }
    return result
}

exports.assignTag = (id, tag_id) => {
    return db.asyncQuery(`INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)`,
     [id, tag_id]);
}

exports.removeTag = (id, tag_id) => {
    return db.asyncQuery('DELETE FROM product_tags WHERE product_id = $1 and tag_id = $2',
        [id, tag_id]);
}

exports.getAssignedTags = (role, id) => {
    if(role == "admin"){
        return db.asyncQuery(`SELECT * FROM tags WHERE id IN (
            SELECT tag_id FROM product_tags
            WHERE product_id = $1)`, [id]);
    }else 
        return undefined;
}

exports.getNotAssignedTags = (role, id) => {
    if(role == "admin"){
        return db.asyncQuery(`SELECT * FROM tags WHERE id NOT IN (
            SELECT tag_id FROM product_tags
            WHERE product_id = $1)`, [id]);
    }else
        return undefined
}

async function ratingExists(userId, product_id){
    let exists = null;
    res = await db.asyncQuery(`SELECT * FROM product_ratings WHERE 
            user_id = $1 AND product_id = $2`, [userId, product_id])
    if(res.rowCount == 1){
        exists = res.rows[0].id;
    }
    return exists;
}

exports.addRating = async (userId, productId, rating) => {
    var exists = await ratingExists(userId, productId);
    var query = `INSERT INTO product_ratings (user_id, product_id, rating)
    VALUES ($1, $2, $3)`
    if(exists){
        query = `UPDATE product_ratings SET rating = $3 WHERE user_id = $1 
        AND product_id = $2`
    }
    return db.asyncQuery(query, [userId, productId, rating]);
}
