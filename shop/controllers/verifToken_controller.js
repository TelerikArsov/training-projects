var db = require('./db');


exports.createToken = (data, callback) => {
    const { user_id, token } = data;
    db.query('INSERT INTO verification_token (user_id, token, created_on) VALUES ($1, $2, $3)',
     [user_id, token, new Date().toISOString()], callback);
}

exports.getToken = (req, _res, callback) => {
    const { token } = req.params;
    db.query('SELECT user_id, token FROM verification_token WHERE token = $1',
    [token], callback);
}