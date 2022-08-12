// This is the CRUD class for `channel_members_history` table
const mysql = require('mysql')
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// create is the CREATE operation that inserts a history of which member was randomly selected into the `channel_members_history` table
function create(channel_id, member_id) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) {
              logger.Error("channel_members_history", "create", "failed to getConnection for channel_members_history channel_members: " + JSON.stringify(err));
              return; 
            }
            connection.query(`
                INSERT INTO 
                    whosthehost.channel_members_history (channel_id, member_id) 
                VALUES (?, ?);
            `, [channel_id, member_id], (err, rows) => {
                connection.release();
                if (err) {
                    logger.Error("channel_members_history", "create", "failed to query create for channel_members_history: " + JSON.stringify(err));
                    error(err)
                }
                resolve(rows)
            })
        })
    });
}

module.exports = {
    Create: function(channel_id, member_id){
        create(channel_id, member_id)
    },
}