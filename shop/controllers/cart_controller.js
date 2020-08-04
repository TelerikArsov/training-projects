var db = require('./db');

async function createCart(userId){
    var err = null, res = null;
    try{
        res = await db.asyncQuery('INSERT INTO cart (user_id, created_date) VALUES ($1, $2)',
        [userId, new Date().toISOString()]);
    } catch(e){
        err = e;
    }
    return [err, res];
}

async function getCartId(userId){
    var err = null, res = null;
    var exists = null;
    try{
        res = await db.asyncQuery('SELECT * FROM CART WHERE user_id = $1', [userId])
    } catch(e){
        err = e;
    }
    if(err == null && res.rowCount == 1){
        exists = res.rows[0].id;
    }
    return exists;
}

exports.addToCart = async (req, res, callback) => {
    var userId = req.session.userId
    if(userId){
        var cartId = await getCartId(userId);
        if(!cartId){
            let [err, res] = await createCart(userId);
            if(err) {
                callback(err, res);
            }
            cartId = await getCartId(userId);
        }
        var productId = req.body.productId;
        db.query('INSERT INTO cart_items (product_id, quantity, created_date, cart_id, price) VALUES ($1, $2, $3, $4, $5)',
        [productId, 1, new Date().toISOString(), cartId, 1], callback);
    }
}