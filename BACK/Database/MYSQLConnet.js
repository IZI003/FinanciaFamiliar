const mysql = require('mysql');
require('dotenv').config({ path: 'dev.env' });

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to the database!");
});

// Método de actualización unificado dentro de MYSQLConnet.js
con.update = function (table, data, conditions) {
    return new Promise((resolve, reject) => {
        const dataKeys = Object.keys(data).map(key => `${key} = ?`);
        const conditionKeys = Object.keys(conditions).map(key => `${key} = ?`);

        const query = `UPDATE ${table} SET ${dataKeys.join(', ')} WHERE ${conditionKeys.join(' AND ')}`;
        const values = [...Object.values(data), ...Object.values(conditions)];

        con.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

con.insert = function (table, data) {
    return new Promise((resolve, reject) => {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

        con.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

module.exports = con;