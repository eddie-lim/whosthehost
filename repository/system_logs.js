// This is the CRUD class for `system_logs` table
const mysql = require('mysql')
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// read is the READ operation that retrieves a specific channel and the linked members from `channel_members` table
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
            ;
            `, [class_name, method, type, log], (err, rows) => {
                connection.release();
                if (err) error(err)
                resolve(rows)
            })
        })
    });
}

module.exports = {
    CreateLog: function(class_name, method, type, log){
        createLog(class_name, method, type, log)
    }
}