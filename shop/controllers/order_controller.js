var db = require('./db');
var cartController = require('./cart_controller');

async function addToOrder(orderId, data){
    return await db.asyncQuery(`INSERT INTO order_items (product_id, quantity, 
        created_date, order_id, price) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [data.product_id, data.quantity, new Date().toISOString(), orderId, data.price]);
}

 async function getOrderId(userId, name, address, cartId){
    var err = null, res = null;
    var id = null;
    try{
        res = await db.asyncQuery(`SELECT * FROM orders WHERE user_id = $1 AND reciever_name = $2 AND address = $3
        AND orignal_cart_id = $4`, [userId, name, address, cartId])
    } catch(e){
        err = e;
    }
    if(err == null && res.rowCount == 1){
        id = res.rows[0].id;
    }
    return id;
}



exports.createOrder = (req, _res, callback) => {
    var userId = req.session.userId
    if(userId){
        ;(async (callback, req, userId) => {
            var cartId = await cartController.getCartId(userId)
            if(cartId){
                var {paid, name, address} = req.body;
                var orderId = await getOrderId(userId, name, address, cartId)
                console.log("FIrst:", orderId, cartId)
                if(!orderId){
                    try{
                        result = await db.asyncQuery(`INSERT INTO orders 
                        (user_id, paid, reciever_name, address, created_date, orignal_cart_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                        [userId, paid, name, address, new Date().toISOString(), cartId]);
                        if(result.rowCount == 1) {
                            orderId = result.rows[0].id
                        }
                    }catch(e){
                        console.log(e)
                        callback(e, null)
                    }
                }
                console.log(orderId, cartId)
                cartController.getCartItems(req, null, async (err, res) => {
                    if(err){
                        callback(err, res);
                    }
                    if(res.rowCount > 0){
                        for(row in res.rows){
                            try{
                            var r = await addToOrder(orderId, res.rows[row])
                            //deleteCartItem = db.queryAsync('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING id AS deleted_id',
                            //[row.cartId, row.productId]);
                            //console.log(r)
                            }catch(e){
                                callback(e, r);
                                return;
                            }
                        }
                        cartController.deleteCartItem({session: req.session, body: {cartId: cartId}}, null, (err, res)=> {
                            if(err) {
                                callback(err, null);
                            }else {
                                callback(null, true);
                            }
                        });
                    }else {
                        callback(err, res);
                    }
                })
            }
        })(callback, req, userId)
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