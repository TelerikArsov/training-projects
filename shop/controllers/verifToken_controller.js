var db = require('./db');


exports.createToken = (user_id, token) => {
    return db.asyncQuery(`INSERT INTO verification_token (user_id, token, created_on) 
    VALUES ($1, $2, $3)`, [user_id, token, new Date().toISOString()]);
}

exports.getToken = (token) => {
    return db.asyncQuery('SELECT user_id, token FROM verification_token WHERE token = $1', [token]);
}