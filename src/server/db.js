const config = require('../../config.json');
const mariadb = require("mariadb")
const Database = {};
Database.connect = async function() {
    Database.pool = mariadb.createPool({
        user: config.dbUser,
        password: config.dbPass
    })
    try {
        let conn = await Database.pool.getConnection()
        console.log("Successfully connected to database server")
        let query
        query =
            "CREATE OR REPLACE FUNCTION `" + config.db + "`.`registerAccount`(token TINYTEXT, username TINYTEXT, pass TINYTEXT, org INT, year INT) RETURNS INT " +
            "BEGIN " +
            " IF EXISTS(SELECT 1 FROM `" + config.db + "`.`" + config.tableAccount + "` WHERE `user` = username LIMIT 1) THEN " +
            "  RETURN 0;" +
            " END IF;" +
            " UPDATE `" + config.db + "`.`" + config.tableToken + "` SET `registered` = 1, `user` = username WHERE `registered` = 0 AND LEFT(`hash`, 5) = token LIMIT 1;" +
            " IF (ROW_COUNT() = 0) THEN " +
            "  RETURN 1;" +
            " ELSE " +
            "  INSERT INTO `" + config.db + "`.`" + config.tableAccount + "` (`user`,`pass`,`org`,`year`) VALUES (username, pass, org, year);" +
            "  RETURN 2;" +
            " END IF;" +
            "END"
        await conn.query(query)
        query =
            "CREATE OR REPLACE FUNCTION `" + config.db + "`.`recoverAccount`(token TINYTEXT, username TINYTEXT, hash TINYTEXT) RETURNS INT " +
            "BEGIN " +
            " IF NOT EXISTS (SELECT 1 FROM `" + config.db + "`.`" + config.tableToken + "` WHERE `token` = token AND `user` = username) THEN " +
            "  RETURN 0;" +
            " END IF;" +
            " IF EXISTS (SELECT 1 FROM `" + config.db + "`.`" + config.tableRecover + "` WHERE `user` = username AND `expires` > CURRENT_TIMESTAMP()) THEN " +
            "  RETURN 1;" +
            " END IF;" +
            " SET @time = TIMESTAMPADD(HOUR, 1, CURRENT_TIMESTAMP());" +
            " INSERT INTO `" + config.db + "`.`" + config.tableRecover + "` (`hash`, `user`, `expires`) VALUES (hash, username, @TIME) ON DUPLICATE KEY UPDATE `hash` = hash, `expires` = @time;" +
            " RETURN 2;" +
            "END"
        await conn.query(query)
        query =
            "CREATE OR REPLACE FUNCTION `" + config.db + "`.`resetAccount`(hash TINYTEXT, username TINYTEXT, pass TINYTEXT) RETURNS INT " +
            "BEGIN " +
            " IF NOT EXISTS (SELECT 1 FROM `" + config.db + "`.`" + config.tableRecover + "` WHERE `hash` = hash AND `user` = username AND `expires` > CURRENT_TIMESTAMP()) THEN " +
            "  RETURN 0;" +
            " END IF;" +
            " DELETE FROM `" + config.db + "`.`" + config.tableRecover + "` WHERE `user` = username;" +
            " UPDATE `" + config.db + "`.`" + config.tableAccount + "` SET `pass` = pass WHERE `user` = username;" +
            " RETURN 1;" +
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
            "SELECT * FROM `" + config.db + "`.`" + config.tablePlayer + "` " +
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
            "FROM `" + config.db + "`.`" + config.tableHistory + "` " +
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
            "FROM `" + config.db + "`.`" + config.tablePlayer + "` ")
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
            "FROM `" + config.db + "`.`" + config.tablePlayer + "` " +
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
            "FROM `" + config.db + "`.`" + config.tablePlayer + "` " +
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
            "FROM `" + config.db + "`.`" + config.tablePlayer + "` " +
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
            "FROM `" + config.db + "`.`" + config.tablePlayer + "` " +
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
            "FROM `" + config.db + "`.`" + config.tablePlayer + "` " +
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
        throw e
    }
}
Database.recoverAccount = async function(conn, params) {
    try {
        return await conn.query(
            "SELECT `" + config.db + "`.`recoverAccount`(?, ?, ?) AS result",
            [params.token, params.user, params.hash]
        )
    } catch (e) {
        throw e
    }
}
Database.resetAccount = async function(conn, params) {
    try {
        return await conn.query(
            "SELECT `" + config.db + "`.`resetAccount`(?, ?, ?) AS result",
            [params.hash, params.user, params.pass]
        )
    } catch (e) {
        throw e
    }
}
module.exports = Database;