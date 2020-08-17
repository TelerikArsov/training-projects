var db = require('./db');

exports.createUser = (username, email, pass) => {
    return db.asyncQuery('INSERT INTO users (username, email, password, created_on) VALUES ($1, $2, $3, $4) RETURNING id',
        [username, email, pass, new Date().toISOString()]);
}
// to refactor reasue code?
exports.loginUser = (username, pass) => {
    return db.asyncQuery(`SELECT id, username, isverified FROM users 
        WHERE username = $1 AND password = $2`, [username, pass]);
}

exports.verifyUser = (id) => {
    return db.asyncQuery('UPDATE users SET isverified = TRUE WHERE id = $1', [id]);
}

exports.getUser = (username) => {
    return db.asyncQuery('SELECT id, username, email FROM users WHERE username = $1 ',
        [username]);
}

exports.updateUser = (userId, username, email, pass, newpass) => {
    const newPassword = newpass == null ? pass : newpass;
    return db.asyncQuery(`UPDATE users SET username = $1, email = $2, password = $3
        WHERE id = $4 AND password = $5 RETURNING username, email`,
        [username, email, newPassword, userId, pass]);
}