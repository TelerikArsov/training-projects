var db = require('./db');

var filterProps = {
    'name': {dbQuery: 'p.name', type: 'text'},
    'category': {dbQuery: 'c.name', type: 'text', invisible: true},
    'manifacturer': {dbQuery: 'manifacturer', type: 'text'},
    'price': {dbQuery: 'cost', type: 'range'}
};

exports.filterProps = Object.assign({}, ...Object.entries(filterProps)
    .map(([k, v]) => {
        if(!v['invisible']){
            return ({[k]: {
                name: k[0].toUpperCase() + k.slice(1), 
                type: v['type']
            }});
        }
    }));

exports.createProduct = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, manifacturer, description, cost, category, visible } = req.body;
        db.query('INSERT INTO products (name, manifacturer, description, cost, category_id, visible) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, manifacturer, description, cost, category, visible], (error, results) => {
            if (error) {
                throw error;
            }
            callback(error, results);
        })
    }
}

exports.deleteProduct = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body
        db.query('DELETE FROM products WHERE id = $1',
        [id], (error, results) => {
            if (error) {
                throw error;
            }
            callback(error, results);
        })
    }
}

exports.getAllProducts = (req, res, callback) => {
    var query = `SELECT p.id, p.name, manifacturer, description, cost, c.name AS
    category, p.visible FROM products AS p LEFT JOIN categories AS c ON c.id = p.category_id`;
    if(req.session.role != "admin") {
        query += ' WHERE p.visible = TRUE';
    }
    query += ';';
    db.query(query,
    (error, results)=> {
        if (error) {
            throw error;
        }
        callback(error, results);
    });
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
    console.log(req.body)
    var query = `SELECT p.id, p.name, manifacturer, description, cost, c.name AS
    category, p.visible FROM products AS p LEFT JOIN categories AS c ON c.id = p.category_id`;
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
            if(filterProps[prop]['type'] == 'text'){
                query += `${filterProps[prop]['dbQuery']} LIKE $${count}`;
            }else if(filterProps[prop]['type'] == 'range'){
                query += `${filterProps[prop]['dbQuery']} >= $${count} AND `;
                count++;
                query += `${filterProps[prop]['dbQuery']} <= $${count}`;
            }
            count++;
        }
    }
    query += ';';
    console.log(query)
    console.log( Object.values(req.body).filter(
        function (el) { return el != null;}).reduce((acc, val) => acc.concat(val), []))
    db.query(query, Object.values(req.body).filter(
        function (el) { return el != '';}).reduce((acc, val) => acc.concat(val), []),
    (error, results)=> {
        if (error) {
            throw error;
        }
        callback(error, results);
    });
}

exports.editProduct = (req, res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, manifacturer, description, cost, category, visible } = req.body
        db.query(`UPDATE products SET name = $2, manifacturer = $3, description = $4,
        cost = $5, category_id = $6, visible = $7 WHERE id = $1`,
        [id, name, manifacturer, description, cost, category, visible], (error, results) => {
            if (error) {
                throw error;
            }
            callback(error, results);
        })
    }
}
