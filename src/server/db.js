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
        throw e
    }
}
Database.requestPlayer = async function(conn, name) {
    try {
        return await conn.query(
            "SELECT * FROM `" + config.dbname + "`.`" + config.dbplayertable + "` " +
            "WHERE `name` = ?", name)
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.requestHistory = async function(conn, count) {
    try {
        return await conn.query(
            "SELECT * " +
            "FROM `" + config.dbname + "`.`" + config.dbhistorytable + "` " +
            "ORDER BY `i` " +
            "DESC LIMIT ?", count)
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.requestPopulation = async function(conn) {
    try {
        return await conn.query(
            "SELECT COUNT(`name`) " +
            "AS 'population' " +
            "FROM `" + config.dbname + "`.`" + config.dbplayertable + "` ")
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.requestPopulationAlive = async function(conn) {
    try {
        return await conn.query(
            "SELECT COUNT(`name`) " +
            "AS 'alive' " +
            "FROM `" + config.dbname + "`.`" + config.dbplayertable + "` " +
            "WHERE `alive` = 1")
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.requestAdvancementScore = async function(conn, count) {
    try {
        return await conn.query(
            "SELECT `name`, `advancement_count` " +
            "FROM `" + config.dbname + "`.`" + config.dbplayertable + "` " +
            "ORDER BY `advancement_count` " +
            "DESC LIMIT ?", count)
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.requestExperienceScore = async function(conn, count) {
    try {
        return await conn.query(
            "SELECT `name`, `experience` " +
            "FROM `" + config.dbname + "`.`" + config.dbplayertable + "` " +
            "ORDER BY `experience` " +
            "DESC LIMIT ?", count)
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.requestKillsScore = async function(conn, count) {
    try {
        return await conn.query(
            "SELECT `name`, `kills` " +
            "FROM `" + config.dbname + "`.`" + config.dbplayertable + "` " +
            "ORDER BY `kills` " +
            "DESC LIMIT ?", count)
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.requestTimeScore = async function(conn, count) {
    try {
        return await conn.query(
            "SELECT `name`, `time` " +
            "FROM `" + config.dbname + "`.`" + config.dbplayertable + "` " +
            "ORDER BY `time` " +
            "DESC LIMIT ?", count)
    } catch (e) {
        console.error(e)
        throw e
    }
}
module.exports = Database;