// This is the CRUD class for `channel` table
const mysql = require('mysql')
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// read is the READ operation that retrieves a specific channel and the linked members from `channel_members` table
function readAll() {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) { 
              console.log(err); 
              return; 
            }
            connection.query(`
            SELECT 
                A.id, A.cron_expression, A.is_active, A.name
            FROM
                whosthehost.channel AS A;
            `, (err, rows) => {
                connection.release();
                if (err) error(err)
                resolve(rows)
            })
        })
    });
}

module.exports = {
    ReadAll: function(){
        return readAll()
    }
}
