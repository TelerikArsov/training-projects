var db = require('./db');
var cartController = require('./cart_controller');
const { reset } = require('nodemon');

async function addToOrder(orderId, data){
    return await db.queryAsync(`INSERT INTO order_items (product_id, quantity, 
        created_date, order_id, price) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [data.productId, data.quantity, new Date().toISOString(), orderId, data.productPrice]);
}

exports.craeteOrder = async (req, _res, callback) => {
    var userId = req.session.userId
    if(userId){
        var {payed, reciever_name, address} = req.body;
        var orderId = await db.queryAsync(`INSERT INTO orders 
            (user_id, payed, reciever_name, address, created_date) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [userId, payed, reciever_name, address, new Date().toISOString()]);
        cartController.getCartItems(req, null, (err, res) => {
            if(err){
                callback(err, res);
            }
            if(res.rowCount > 0){
                for(row in res.rows){
                    try{
                       r = addToOrder(orderId, data)
                    }catch(e){
                        callback(e, r);
                    }
                }
                callback(null, orderId)
            }else {
                callback(err, res);
            }
        })
    }
}

exports.getOrder = (req, _res, callback) => {
    var userId = req.session.userId;
    if(userId){
        let id = req.body.id;
        db.query('SELECT * FROM orders WHERE user_id = $1 and id = $2', [userId, id], callback);
    }
}

exports.getOrderItems = (req, _res, callback) => {
    var userId = req.session.userId;
    if(userId){
        db.query('SELECT oi.id, p.name, p.id as product_id, oi.quantity, oi.price FROM order_items AS oi' 
        + ' LEFT JOIN products AS p ON oi.product_id = p.id' 
        + ' LEFT JOIN orders AS o on oi.cart_id = o.id WHERE o.user_id = $1', [userId], callback);
    }
}