var db = require('./db');

async function canLogin(username){
    await db.asyncQuery(`UPDATE users SET remaining_login_tries = 3 WHERE username = $1 
        AND COALESCE(last_login_attempt, to_timestamp(0)) + interval '1 day' < $2 
        AND remaining_login_tries = 0`, [username, new Date().toISOString()]);
    var res = await db.asyncQuery("SELECT remaining_login_tries FROM users WHERE username = $1", [username]);
    var canLogin = false;
    if(res.rowCount == 1){
        canLogin = res.rows[0].remaining_login_tries > 0;
    }
    return canLogin;
}

exports.createUser = (username, email, pass) => {
    return db.asyncQuery('INSERT INTO users (username, email, password, created_on) VALUES ($1, $2, $3, $4) RETURNING id',
        [username, email, pass, new Date().toISOString()]);
}
exports.loginUser = async (username, pass) => {
    var can_login = await canLogin(username);
    var result = null
    if(can_login) {
        result = await db.asyncQuery(`SELECT id, username, isverified FROM users 
            WHERE username = $1 AND password = $2`, [username, pass]);
        if (result.rowCount != 1){
            await db.asyncQuery(`UPDATE users SET remaining_login_tries = remaining_login_tries - 1,
             last_login_attempt = $1 WHERE username = $2`, [new Date().toISOString(), username]);
        }
    } 
    return result;
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