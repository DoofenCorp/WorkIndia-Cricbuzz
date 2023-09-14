const sql = require('mysql2');

const db = sql.createConnection({
    host: 'localhost',
    user: 'NodeJS',
    password: "",
    database: 'workindia',
    port: 3306
})

module.exports = db;