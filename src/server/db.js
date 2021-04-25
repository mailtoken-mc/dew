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
        let query =
            "CREATE OR REPLACE FUNCTION `" + config.db + "`.`registerAccount`(token TINYTEXT, username TINYTEXT, pass TINYTEXT, org INT, year INT) RETURNS INT " +
            "BEGIN " +
            " IF EXISTS(SELECT 1 FROM `" + config.db + "`.`" + config.accountTable + "` WHERE `user` = username LIMIT 1) THEN " +
            "  RETURN 0;" +
            " END IF;" +
            " UPDATE `" + config.db + "`.`" + config.tokenTable + "` SET `registered` = 1, `user` = username WHERE `registered` = 0 AND LEFT(`hash`, 5) = token LIMIT 1;" +
            " IF (ROW_COUNT() = 0) THEN " +
            "  RETURN 1;" +
            " ELSE " +
            "  INSERT INTO `" + config.db + "`.`" + config.accountTable + "` (`user`,`pass`,`org`,`year`) VALUES (username, pass, org, year);" +
            "  RETURN 2;" +
            " END IF;" +
            "END"
        await conn.query(query)
        await conn.release()
    } catch(e) {
        console.error(e)
        throw e
    }
}
Database.requestPlayer = async function(conn, name) {
    try {
        return await conn.query(
            "SELECT * FROM `" + config.db + "`.`" + config.playerTable + "` " +
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
            "FROM `" + config.db + "`.`" + config.historyTable + "` " +
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
            "FROM `" + config.db + "`.`" + config.playerTable + "` ")
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
            "FROM `" + config.db + "`.`" + config.playerTable + "` " +
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
            "FROM `" + config.db + "`.`" + config.playerTable + "` " +
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
            "FROM `" + config.db + "`.`" + config.playerTable + "` " +
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
            "FROM `" + config.db + "`.`" + config.playerTable + "` " +
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
            "FROM `" + config.db + "`.`" + config.playerTable + "` " +
            "ORDER BY `time` " +
            "DESC LIMIT ?", count)
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.registerAccount = async function(conn, params) {
    try {
        return await conn.query(
            "SELECT `" + config.db + "`.`registerAccount`(?, ?, ?, ?, ?) AS result",
            [params.token, params.user, params.pass, params.org, params.year]
        )
    } catch (e) {
        console.error(e)
        throw e
    }
}
Database.searchAccount = async function(conn, params) {
    try {
        return await conn.query(
            "SELECT COUNT(*) AS found " +
            "FROM `" + config.db + "`.`" + config.tokenTable + "` " +
            "WHERE `token` = ? AND `user` = ? " +
            "LIMIT 1;", params.token, params.user
        )
    } catch (e) {
        console.error(e)
        throw e
    }
}
module.exports = Database;