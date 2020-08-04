require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

exports.query = function(text, params, callback) {
    return pool.query(text, params, callback);
};

exports.asyncQuery = async function(text, param) {
    return await pool.query(text, param); 
};