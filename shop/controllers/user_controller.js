var db = require('./db');

exports.createUser = (req, res) => {
    const { username, email, pass } = req.body;
    db.query('INSERT INTO users (username, email, password, created_on) VALUES ($1, $2, $3, $4)',
     [username, email, pass], (error, _results) => {
        if (error) {
          throw error;
        }
        res.redirect('/login');
    });
}
// to refactor reasue code?
exports.loginUser = (req, res) => {
    const { username, pass } = req.body;
    db.query('SELECT id, username FROM users WHERE username = $1 AND password = $2',
    [username, pass], (error, results) => {
        if (error) {
            throw error;
        }
        if (results.rowCount == 1) {
            req.session.user = results.rows[0]['username'];
            req.session.role = "user";
            req.session.userId = results.rows[0]['id']  ;
        }
        res.redirect('/');
    });
}

exports.getUser = (req, callback) => {
    const username = req.session.user
    if (username) {
        db.query('SELECT id, username, email FROM users WHERE username = $1 ',
        [username], (error, results)=> {
            if (error) {
                throw error;
            }
            if (results.rowCount == 1) {
                callback(results.rows[0]);
            }
        });
    }
}

exports.updateUser = (req, res) => {
    const { username, email, pass, newpass } = req.body
    const id = req.session.userId
    const newPassword = newpass == null ? pass : newpass;
    if(id){
        db.uquery('UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 AND password = $5',
        [username, email, newPassword, id, pass], (error, _results) => {
            if (error) {
                throw error
            }
            req.session.user = username;
            res.redirect('/account')
        });
    }
    
}