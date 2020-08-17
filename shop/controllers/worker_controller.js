var db = require('./db');

exports.handleError = (err) => {
    var errorMsg = '';
    switch(err.code){
        case '23505':
            errorMsg = "Username or email already in use";
            break;
        default:
            errorMsg = "Unknown server error";
    }
    return errorMsg
}

exports.createWorker = (username, email, pass) => {
    return db.asyncQuery(`INSERT INTO workers (username, email, password, created_on) 
        VALUES ($1, $2, $3, $4) RETURNING id`, [username, email, pass, new Date().toISOString()]);
}

exports.updateWorker = (userId, username, email, pass, newpass) => {
    const newPassword = newpass == null ? pass : newpass;
    return db.asyncQuery(`UPDATE workers SET username = $1, email = $2, password = $3 
        WHERE id = $4 AND password = $5 RETURNING username, email, password`,
        [username, email, newPassword, userId, pass]);

}
exports.loginWorker = (username, pass) => {
    return db.asyncQuery('Select id, username FROM workers WHERE username = $1 and password = $2',
        [username, pass]);
}