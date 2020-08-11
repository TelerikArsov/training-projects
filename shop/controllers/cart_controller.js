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

exports.getCartId =  async (userId) => {
    var err = null, res = null;
    var id = null;
    try{
        res = await db.asyncQuery('SELECT * FROM CART WHERE user_id = $1', [userId])
    } catch(e){
        err = e;
    }
    if(err == null && res.rowCount == 1){
        id = res.rows[0].id;
    }
    return id;
}

async function getCartItemById(id){
    var err = null, res = null;
    try{
        res = await db.asyncQuery('SELECT ci.id, p.name, p.id as product_id, ci.quantity, ci.price FROM cart_items AS ci' 
        + ' LEFT JOIN products AS p ON ci.product_id = p.id WHERE ci.id = $1', [id])
    }catch(e){
        err = e
    }
    
    return [err, res]
}

async function getProductPrice(id){
    var err = null, res = null;
    var price = 1;
    try{
        res = await db.asyncQuery('SELECT cost FROM products WHERE id = $1', [id])
    }catch(e){
        err = e
    }
    if(err == null && res.rowCount == 1){
        price = res.rows[0].cost;
    }
    return price;
}

async function deleteZeroQuantity(id){
    var err = null, res = null;
    try{
        res = await db.asyncQuery('DELETE FROM cart_items WHERE id = $1 AND quantity = 0 RETURNING id AS deleted_id', [id]);
    }catch(e){
        err = e;
    }
    return [err, res];
}


exports.deleteCartItem = async (req, _res, callback) => {
    var userId = req.session.userId
    if(userId){
        var cartId = await this.getCartId(userId);
        var productId = req.body.productId;
        if(cartId){
            db.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING id AS deleted_id',
            [cartId, productId], callback);
        }else{
            callback(true, null)
        }
    }
}

exports.changeQuantity = async (req, _res, callback) => {
    var userId = req.session.userId
    if(userId){
        var cartId = await this.getCartId(userId);
        var productId = req.body.productId;
        var incr = req.body.incr;
        if(cartId){
            db.query('UPDATE cart_items SET quantity = quantity + $3 WHERE cart_id = $1 AND product_id = $2 RETURNING id',
            [cartId, productId, incr], async (err, res) =>  {
                if(err){
                    callback(err, res);
                }
                if(res.rowCount > 0){
                    var [deleteErr, deleteValue] = await deleteZeroQuantity(res.rows[0].id)
                    if(deleteErr || deleteValue.rowCount > 0){
                        callback(deleteErr, deleteValue);
                    }else{
                        callback(...await getCartItemById(res.rows[0].id));
                    }
                }else {
                    callback(true, null)
                }
            })
        }else{
            callback(true, null)
        }
    }
}

exports.addToCart = async (req, _res, callback) => {
    var userId = req.session.userId
    if(userId){
        var cartId = await this.getCartId(userId);
        var productId = req.body.productId;
        if(productId != null) {
            var productPrice = await getProductPrice(productId)
            if(!cartId){
                let [err, res] = await createCart(userId);
                if(err) {
                    callback(err, res);
                }
                cartId = await this.getCartId(userId);
            }
            //can refactor prob just update and if it fails create new entry
            db.query('UPDATE cart_items SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2 RETURNING id',
            [cartId, productId], async (err, res) =>  {
                if(err){
                    callback(err, res);
                }
                if(res.rowCount == 0){
                    db.query('INSERT INTO cart_items (product_id, quantity, created_date, cart_id, price) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [productId, 1, new Date().toISOString(), cartId, productPrice], async (err, res) => {
                        if(err){
                            callback(err, res);
                        }
                        callback(...await getCartItemById(res.rows[0].id));
                    });
                }else {
                    callback(...await getCartItemById(res.rows[0].id));
                }
            });
        }else{
            callback(true, null)
        }
    }
}

exports.getCartItems = (req, _res, callback) => {
    var userId = req.session.userId;
    if(userId){
        db.query('SELECT ci.id, p.name, p.id as product_id, ci.quantity, ci.price FROM cart_items AS ci' 
        + ' LEFT JOIN products AS p ON ci.product_id = p.id' 
        + ' LEFT JOIN cart AS c on ci.cart_id = c.id WHERE c.user_id = $1', [userId], callback);
    }
}

exports.deleteCartItem = (req, _res, callback) => {
    var userId = req.session.userId;
    if(userId){
        var cartId = req.body.cartId
        console.log(cartId, userId);
        db.query('DELETE FROM cart WHERE id = $1 and user_id = $2', [cartId, userId], callback)
    }
}