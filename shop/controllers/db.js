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

class DBerror extends Error{
    constructor(errorCode, errorCodes) {
        this.ErrorCodeMap = {
            NotNullViolation: 23502,
            UniqueViolation: 23505,
            InvalidForeignKey: 42830 
        }
        this.error_codes = {
            [this.ErrorCodeMap.NotNullViolation]: "Empty values are not allowed!",
            [this.ErrorCodeMap.UniqueViolation]: "Already exists!",
            [this.ErrorCodeMap.InvalidForeignKey]: "Invalid connection ERROR CODE 42830"
        }
        this.assignErrorCodes(errorCodes);
        super(this.getErrorMsg(errorCode))
        this.name = 'ValidateError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError)
        }
    };
    getErrorCodeMap(){
        return { ...this.ErrorCodeMap}
    }
    assignErrorCodes(errorCodes){
        for(const code in errorCodes){
            if(errorCodes[code]) {
                errorCodes[code] = errorCodes[code];
            }
        }
    }
    getErrorMsg(error_code){
        return this.error_codes[error_code] || "Unexpected error occured!"
    }
}

exports.ErrorCodeMap = {
    NotNullViolation: 23502,
    UniqueViolation: 23505,
    InvalidForeignKey: 42830 
}
exports.DBerror = DBerror
