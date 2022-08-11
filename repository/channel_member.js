// This is the CRUD class for `channel_member` table
const logger = require("../repository/system_logs")
const mysql = require('mysql')
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// read is the READ operation that retrieves a specific channel and the linked members from `channel_members` table
function read(channel_id) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) { 
              console.log(err); 
              return; 
            }
            connection.query(`
                SELECT 
                    A.id AS 'channel_member_id',
                    A.is_active AS 'is_channel_member_active',
                    B.id AS 'channel_id',
                    B.name AS 'channel_name',
                    B.cron_expression,
                    B.hook_base_url,
                    B.hook_path,
                    B.is_fortnightly,
                    B.is_active AS 'is_channel_active',
                    C.id AS 'member_id',
                    C.messenger_user_id,
                    C.name AS 'member_name',
                    C.is_active AS 'is_member_active'
                FROM
                    whosthehost.channel_members AS A
                        LEFT JOIN
                    whosthehost.channel AS B ON A.channel_id = B.id
                        LEFT JOIN
                    whosthehost.member AS C ON A.member_id = C.id
                WHERE
                    A.channel_id = ?;
            `, [channel_id], (err, rows) => {
                connection.release();
                if (err){
                    logger.Error("client", "hook", "failed to query for channel_members: " + JSON.stringify(err));
                    error(err)
                }
                resolve(rows)
            })
        })
    });
}

// updateIsActive is the UPDATE operation that updates the value of is_active in `channel_members` table for specific member in a channel
function updateIsActive(channel_id, member_id, is_active) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) { 
              console.log(err); 
              return; 
            }
            connection.query(`
                UPDATE whosthehost.channel_members 
                SET 
                    is_active = ?
                WHERE
                    channel_id = ? and member_id = ?;
            `, [is_active, channel_id, member_id], (err, result) => {
                connection.release();
                if (err){
                    logger.Error("client", "hook", "failed to query for channel_members: " + JSON.stringify(err));
                    error(err)
                }
                resolve(result)
            })
        })
    });
}

// updateAllChannelIsActive is the UPDATE operation that updates the value of is_active in `channel_members` table for ALL member in a channel
function updateAllChannelIsActive(channel_id, is_active) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) { 
              console.log(err); 
              return; 
            }
            connection.query(`
                UPDATE whosthehost.channel_members 
                SET 
                    is_active = ?
                WHERE
                    channel_id = ?;
            `, [is_active, channel_id], (err, result) => {
                connection.release();
                if (err){
                    logger.Error("client", "hook", "failed to query for channel_members: " + JSON.stringify(err));
                    error(err)
                }
                resolve(result)
            })
        })
    });
}

module.exports = {
    Read: function(channel_id){
        return read(channel_id)
    },
    UpdateIsActive: function(channel_id, member_id, is_active){
        return updateIsActive(channel_id, member_id, is_active)
    },
    UpdateAllChannelIsActive: function(channel_id, is_active){
        return updateAllChannelIsActive(channel_id, is_active)
    }
}