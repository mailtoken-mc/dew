const config = require('../../config.json');
const mariadb = require("mariadb")
const Database = {};
Database.connect = async function() {
    Database.pool = mariadb.createPool({
        user: config.dbuser,
        password: config.dbpass
    })
    try {
        let conn = await Database.pool.getConnection()
        console.log("Successfully connected to database server")
        await conn.release()
    } catch(e) {
        console.error(e)
        console.error("Failed to connect to database server")
    }
}
Database.requestPlayer = async function(name) {
    try {
        return await Database.pool.query(
            "SELECT * FROM `" + config.dbname + "`.`" + config.dbtable + "` " +
            "WHERE `name` = ?", name)
    } catch (e) {
        console.error(e)
        return false
    }


}

module.exports = Database;