// This is the CRUD class for `event_members_history` table
const logger = require("./system_logs")
const mysql = require('mysql')
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// create is the CREATE operation that inserts a history of which member was selected into the `event_members_history` table
function create(event_id, member_id) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) {
              logger.Error("event_members_history", "create", "failed to getConnection for event_members_history event_members: " + JSON.stringify(err));
              return; 
            }
            connection.query(`
                INSERT INTO 
                    whosthehost.event_members_history (event_id, member_id) 
                VALUES (?, ?);
            `, [event_id, member_id], (err, rows) => {
                connection.release();
                if (err) {
                    logger.Error("event_members_history", "create", "failed to query create for event_members_history: " + JSON.stringify(err));
                    error(err)
                }
                resolve(rows)
            })
        })
    });
}

module.exports = {
    Create: function(event_id, member_id){
        create(event_id, member_id)
    },
}