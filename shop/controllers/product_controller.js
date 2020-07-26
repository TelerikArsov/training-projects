var db = require('./db');

exports.createProduct = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { name, manifacturer, description, cost, category, visible } = req.body;
        db.query('INSERT INTO products (name, manifacturer, description, cost, category_id, visible) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, manifacturer, description, cost, category, visible], (error, results) => {
            if (error) {
                throw error;
            }
            this.getAllProducts(req, res);
        })
    }
}

exports.deleteProduct = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id } = req.body
        db.query('DELETE FROM products WHERE id = $1',
        [id], (error, results) => {
            if (error) {
                throw error;
            }
            this.getAllProducts(req, res);
        })
    }
}

exports.getAllProducts = (req, res) =>{
    if(req.session.user && req.session.role == "admin"){
        db.query(`SELECT p.id, p.name, manifacturer, description, cost, c.name AS
        category, p.visible FROM products AS p LEFT JOIN categories AS c ON c.id = p.category_id;`,
        (error, results)=> {
            if (error) {
                throw error;
            }
            res.json({table: 'products', result: results.rows});
        });
    }
}

exports.editProduct = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { id, name, manifacturer, description, cost, category, visible } = req.body
        db.query(`UPDATE products SET name = $2, manifacturer = $3, description = $4,
        cost = $5, category_id = $6, visible = $7 WHERE id = $1`,
        [id, name, manifacturer, description, cost, category, visible], (error, results) => {
            if (error) {
                throw error;
            }
            this.getAllProducts(req, res);
        })
    }
}
