// This is the CRUD class for `system_logs` table
const mysql = require('mysql')
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// createLog is the CREATE operation that inserts a log into the `system_log` table
function createLog(class_name, method, type, log) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) {
              console.log(err); 
              return; 
            }
            connection.query(`
                INSERT INTO 
                    whosthehost.system_logs (class, method, type, log) 
                VALUES (?, ?, ?, ?);
            `, [class_name, method, type, log], (err, rows) => {
                connection.release();
                if (err) error(err)
                resolve(rows)
            })
        })

        console.log(class_name, method, type, log); 
    });
}

module.exports = {
    Info: function(class_name, method, log){
        createLog(class_name, method, "info", log)
    },
    Error: function(class_name, method, log){
        createLog(class_name, method, "error", log)
    },
}