var db = require('./db');

exports.createWorker = (req, res) => {
    if(req.session.user && req.session.role == "admin"){
        const { username, email, pass } = req.body;
        db.query('INSERT INTO workers (username, email, password, created_on) VALUES ($1, $2, $3, $4)',
        [username, email, pass, new Date().toISOString()], (error, _results) => {
            if (error) {
                throw error;
            }
            res.redirect('/admin');
        });
    }
}

exports.loginWorker = (req, res) => {
    const { username, pass } = req.body;
    db.query('Select id, username FROM workers WHERE username = $1 and password = $2',
    [username, pass], (error, results) => {
        if (error) {
            throw error;
        }
        if (results.rowCount == 1) {
            req.session.user = results.rows[0]['username'];
            req.session.role = "admin";
            req.session.userId = results.rows[0]['id'];
            res.redirect('/admin');
        }
    })
}