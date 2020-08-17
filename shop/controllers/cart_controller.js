var db = require('./db');

async function createCart(userId){
    let res = await db.asyncQuery('INSERT INTO cart (user_id, created_date) VALUES ($1, $2) RETURNING id',
        [userId, new Date().toISOString()]);
    let id = undefined
    if(res.rowCount == 1){
        id = res.rows[0].id;
    }
    return id;
}

async function getCartItemById(id){
    return await db.asyncQuery('SELECT ci.id, p.name, p.id as product_id, ci.quantity, ci.price FROM cart_items AS ci' 
        + ' LEFT JOIN products AS p ON ci.product_id = p.id WHERE ci.id = $1', [id]);
}

async function getProductPrice(id){
    var price = null
    res = await db.asyncQuery('SELECT cost FROM products WHERE id = $1', [id])
    if(res.rowCount == 1){
        price = res.rows[0].cost;
    }
    return price;
}

function deleteZeroQuantity(id){
    return db.asyncQuery('DELETE FROM cart_items WHERE id = $1 AND quantity = 0 RETURNING id AS deleted_id', [id]);
}

exports.getCartId =  async (userId) => {
    let res = await db.asyncQuery('SELECT id FROM cart WHERE user_id = $1', [userId]);
    let id = undefined
    if(res.rowCount == 1){
        id = res.rows[0].id;
    }
    return id;
}




exports.deleteCartItem = async (userId, productId) => {
    var cartId = await this.getCartId(userId);
    return db.asyncQuery(`DELETE FROM cart_items WHERE cart_id = $1 
        AND product_id = $2 RETURNING id AS deleted_id`, [cartId, productId]);
}

exports.changeQuantity = async (userId, productId, incr) => {
    var cartId = await this.getCartId(userId);
    const res = await db.asyncQuery(`UPDATE cart_items SET quantity = quantity + $3 
        WHERE cart_id = $1 AND product_id = $2 RETURNING id`, [cartId, productId, incr])
    if(res.rowCount <= 0){
        throw new Error("No such product in cart");
    }
    const deleteValue = await deleteZeroQuantity(res.rows[0].id)    
    if(deleteValue.rowCount > 0){
        return deleteValue
    }else{
        return await getCartItemById(res.rows[0].id);
    }
}

exports.addToCart = async (userId, productId) => {
    var cartId = await this.getCartId(userId);
    var productPrice = await getProductPrice(productId)
    if(!cartId){
        cartId = await createCart(userId);
    }
    const updateRes = await db.asyncQuery('UPDATE cart_items SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2 RETURNING id',
    [cartId, productId])
    if(updateRes.rowCount == 0){
        const insertRes = await db.asyncQuery(`INSERT INTO cart_items (product_id, quantity, 
            created_date, cart_id, price) VALUES ($1, $2, $3, $4, $5) RETURNING id`, 
            [productId, 1, new Date().toISOString(), cartId, productPrice]);
        return await getCartItemById(insertRes.rows[0].id);
    }else {
        return await getCartItemById(updateRes.rows[0].id);
    }
}

exports.getCartItems = (userId) => {
    return db.asyncQuery('SELECT ci.id, p.name, p.id as product_id, ci.quantity, ci.price FROM cart_items AS ci' 
        + ' LEFT JOIN products AS p ON ci.product_id = p.id' 
        + ' LEFT JOIN cart AS c on ci.cart_id = c.id WHERE c.user_id = $1', [userId]);
}

exports.deleteCart = (userId, cartId) => {
    return db.asyncQuery('DELETE FROM cart WHERE id = $1 and user_id = $2', [cartId, userId])
}