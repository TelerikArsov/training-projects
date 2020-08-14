var db = require('./db');
var cartController = require('./cart_controller');

async function addToOrder(orderId, data){
    return await db.asyncQuery(`INSERT INTO order_items (product_id, quantity, 
        created_date, order_id, price) VALUES ($1, $2, $3, $4, $5)`,
    [data.product_id, data.quantity, new Date().toISOString(), orderId, data.price]);
}

async function getOrderId(userId, name, paid, address, cartId){
    const result = await db.asyncQuery(`SELECT * FROM orders WHERE user_id = $1 AND reciever_name = $2 
    AND address = $3 AND orignal_cart_id = $4`, [userId, name, address, cartId]);
    let orderId = null;
    if(result.rowCount == 1){
        orderId = result.rows[0].id;
    }
    if(!orderId){
        result = await db.asyncQuery(`INSERT INTO orders (user_id, paid, reciever_name, address,
             created_date, orignal_cart_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, paid, name, address, new Date().toISOString(), cartId]);
        if(result.rowCount == 1) {
            orderId = result.rows[0].id;
        }
    }
    return orderId;
}

async function addCartItems(userId, name, paid, address, cartId){
    const orderId = await getOrderId(userId, name, paid, address, cartId);
    const cartItems = await cartController.getCartItems(userId);
    if(cartItems.rowCount <= 0){
        throw new Error("Empty Cart");
    }
    for(row in cartItems.rows){
        await addToOrder(orderId, cartItems.rows[row])
    }
    await cartController.deleteCart(userId, cartId);
    return "Created order";
}

exports.createOrder = async (userId, paid, name, address) => {
    const result = await cartController.getCartId(userId);
    const cartId = result.rows[0].id;
    return addCartItems(userId, name, paid, address, cartId);
}

exports.getOrders = (userId, role) => {
    let query = 'SELECT id, user_id, paid, reciever_name, address FROM orders';
    let params = [];
    if(userId && role != "admin"){
        query += ' WHERE user_id = $1';
        params = [userId,];
    }
    return db.asyncQuery(query, params);
}

exports.getOrderItems = (userId, role, orderId) => {
    var query = 'SELECT p.name, oi.quantity, oi.price FROM order_items AS oi' 
    + ' LEFT JOIN products AS p ON oi.product_id = p.id' 
    + ' LEFT JOIN orders AS o on oi.order_id = o.id WHERE o.id = $1';
    let params = [orderId]
    if(userId && role != "admin"){
        params = [orderId, userId];
        query += " AND o.user_id = $2";
    }
    return  db.asyncQuery(query, params);
}