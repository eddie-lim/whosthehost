// This is the CRUD class for `event_member` table
const logger = require("./system_logs")
const mysql = require('mysql')
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// read is the READ operation that retrieves a specific event and the linked members from `event_members` table
function read(event_id) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) {
              logger.Error("event_member", "read", "failed to getConnection for read event_members: " + JSON.stringify(err));
              return; 
            }
            connection.query(`
                SELECT 
                    A.id AS 'event_member_id',
                    A.is_active AS 'is_event_member_active',
                    B.id AS 'event_id',
                    B.name AS 'event_name',
                    B.cron_expression,
                    B.hook_base_url,
                    B.hook_path,
                    B.is_fortnightly,
                    B.is_fortnightly_even_week,
                    B.is_active AS 'is_event_active',
                    B.pick_by_alphabetical,
                    C.id AS 'member_id',
                    C.messenger_user_id,
                    C.name AS 'member_name',
                    C.is_active AS 'is_member_active'
                FROM
                    whosthehost.event_members AS A
                        LEFT JOIN
                    whosthehost.event AS B ON A.event_id = B.id
                        LEFT JOIN
                    whosthehost.member AS C ON A.member_id = C.id
                WHERE
                    A.event_id = ?
                ORDER BY C.name ASC;
            `, [event_id], (err, rows) => {
                connection.release();
                if (err){
                    logger.Error("event_member", "read", "failed to query read for event_members: " + JSON.stringify(err));
                    error(err)
                }
                resolve(rows)
            })
        })
    });
}

// updateIsActive is the UPDATE operation that updates the value of is_active in `event_members` table for specific member in a event
function updateIsActive(event_id, member_id, is_active) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) {
              logger.Error("event_member", "updateIsActive", "failed to getConnection for updateIsActive event_members: " + JSON.stringify(err));
              return; 
            }
            connection.query(`
                UPDATE whosthehost.event_members 
                SET 
                    is_active = ?
                WHERE
                    event_id = ? and member_id = ?;
            `, [is_active, event_id, member_id], (err, result) => {
                connection.release();
                if (err){
                    logger.Error("event_member", "updateIsActive", "failed to query updateIsActive for event_members: " + JSON.stringify(err));
                    error(err)
                }
                resolve(result)
            })
        })
    });
}

// updateAlleventIsActive is the UPDATE operation that updates the value of is_active in `event_members` table for ALL member in a event
function updateAlleventIsActive(event_id, is_active) {
    return new Promise(function(resolve, error) {
        pool.getConnection(function(err, connection) {
            if(err) {
              logger.Error("event_member", "updateAlleventIsActive", "failed to getConnection for updateAlleventIsActive event_members: " + JSON.stringify(err));
              return; 
            }
            connection.query(`
                UPDATE whosthehost.event_members 
                SET 
                    is_active = ?
                WHERE
                    event_id = ?;
            `, [is_active, event_id], (err, result) => {
                connection.release();
                if (err){
                    logger.Error("event_member", "updateAlleventIsActive", "failed to query updateAlleventIsActive for event_members: " + JSON.stringify(err));
                    error(err)
                }
                resolve(result)
            })
        })
    });
}

module.exports = {
    Read: function(event_id){
        return read(event_id)
    },
    UpdateIsActive: function(event_id, member_id, is_active){
        return updateIsActive(event_id, member_id, is_active)
    },
    UpdateAlleventIsActive: function(event_id, is_active){
        return updateAlleventIsActive(event_id, is_active)
    }
}