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

exports.createWorker = (req,_res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { username, email, pass } = req.body;
        db.query('INSERT INTO workers (username, email, password, created_on) VALUES ($1, $2, $3, $4)',
        [username, email, pass, new Date().toISOString()], callback);
    }
}

exports.updateWorker = (req, _res, callback) => {
    if(req.session.user && req.session.role == "admin"){
        const { username, email, pass, newpass } = req.body
        const id = req.session.userId
        const newPassword = newpass == null ? pass : newpass;
        if(id){
            db.query('UPDATE workers SET username = $1, email = $2, password = $3 WHERE id = $4 AND password = $5',
            [username, email, newPassword, id, pass], (error, _results) => {
                callback(error, req.body)
            });
        }
    }
}
exports.loginWorker = (req, _res, callback) => {
    const { username, pass } = req.body;
    db.query('Select id, username FROM workers WHERE username = $1 and password = $2',
    [username, pass], callback);
}