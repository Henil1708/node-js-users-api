require("dotenv").config();
const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.MYSQL_DATABASE_HOST,
    user: process.env.MYSQL_DATABASE_USERNAME,
    password: process.env.MYSQL_DATABASE_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME,
    connectTimeout: 10000
});

db.connect((error) => {
    if (!error) {
        console.log("Database connection succcessed");
    } else {
        console.log("error: " + error);
    }
});

module.exports = db;