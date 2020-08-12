var db = require('./db');

exports.getProductStats = async (date) => {
    return await db.asyncQuery(`SELECT EXTRACT(MONTH FROM created_date) AS Month, p.name, SUM(oi.quantity) AS Sales
        FROM products AS p 
        LEFT JOIN order_items AS oi ON oi.product_id = p.id 
        WHERE oi.created_date >= $1::date 
        GROUP BY month, p.name;`, date);
}

exports.getTotalSales = async (date) => {
    return await db.asyncQuery(`SELECT EXTRACT(MONTH FROM created_date) AS Month, SUM(quantity) AS Sales FROM order_items
    WHERE created_date >= $1::date
    GROUP BY month`, date)
}

exports.getMoneyMade = async (date) => {
    return await db.asyncQuery(`SELECT EXTRACT(MONTH FROM created_date) AS Month, SUM(paid) FROM orders 
    WHERE created_date >= $1::date GROUP BY month;`, date);
}