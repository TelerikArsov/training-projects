var db = require('./db');

exports.handleError = (err) => {
    var errorMsg = '';
    console.log(err)
    switch(err.code){
        case '23505':
            errorMsg = "Username or email already in use";
            break;
        default:
            errorMsg = "Unknown server error";
    }
    return errorMsg
}

exports.createUser = (req, res, callback) => {
    const { username, email, pass } = req.body;
    db.query('INSERT INTO users (username, email, password, created_on) VALUES ($1, $2, $3, $4) RETURNING id',
     [username, email, pass, new Date().toISOString()], callback);
}
// to refactor reasue code?
exports.loginUser = (req, _res, callback) => {
    const { username, pass } = req.body;
    db.query('SELECT id, username, isverified FROM users WHERE username = $1 AND password = $2',
    [username, pass], callback);
}

exports.verifyUser = (id, callback) => {
    if(id){
        db.query('UPDATE users SET isverified = TRUE WHERE id = $1',
        [id], callback);
    }
}

exports.getUser = (req, callback) => {
    const username = req.session.user
    if (username) {
        db.query('SELECT id, username, email FROM users WHERE username = $1 ',
        [username], callback);
    }
}

exports.updateUser = (req, _res, callback) => {
    const { username, email, pass, newpass } = req.body
    const id = req.session.userId
    const newPassword = newpass == null ? pass : newpass;
    if(id){
        db.query('UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 AND password = $5',
        [username, email, newPassword, id, pass], (error, _results) => {
            callback(error, req.body)
        });
    }
    
}