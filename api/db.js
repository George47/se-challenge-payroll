var config = require('./config');
var mysql = require('mysql');
var db = mysql.createConnection(config.db);

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('connected!');
})

module.exports = db;