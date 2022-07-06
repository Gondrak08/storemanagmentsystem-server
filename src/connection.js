// connect to db;

const mysql = require('mysql');
require('dotenv').config;


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'vitor',
    password: 'abra123456',
    database: 'store_db'
});

connection.connect((err) => {
    if (!err) {
        console.log("Connected!")
    } else {
        console.log(err)
    }
})


module.exports = connection;