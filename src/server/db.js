const config = require('../../config.json')
const mariadb = require("mariadb")
const Database = {}
Database.connect = async function() {
    Database.pool = mariadb.createPool({
        user: config.dbUser,
        password: config.dbPass
    })
    try {
        let conn = await Database.pool.getConnection()
        await Database.setup(conn)
        await conn.release()
        console.log("Successfully connected to database server")
    } catch(e) {
        console.error(e)
        throw e
    }
}
Database.setup = async function(conn) {
    let query;
    //Set up all tables
    //tableAccount
    query =
        "CREATE TABLE IF NOT EXISTS `" + config.db + "`.`" + config.tableAccount + "` (" +
        "`user` TINYTEXT," +
        "`pass` TEXT(32)," +
        "`org` TINYINT," +
        "`year` INT," +
        "CONSTRAINT UNIQUE (user)" +
        ")"
    await conn.query(query)
    //tableToken
    query =
        "CREATE TABLE IF NOT EXISTS `" + config.db + "`.`" + config.tableToken + "` (" +
        "`token` TEXT(32)," +
        "`registered` BOOLEAN NOT NULL DEFAULT '0'," +
        "`user` TINYTEXT," +
        "CONSTRAINT UNIQUE (token)" +
        ")"
    await conn.query(query)
    //Register account function
    //First it checks if an account with the chosen name already exists, and returns 0 if so
    //Then it tries to consumes a token, if it fails to do so it returns 1
    //Finally if there's no account with the name, and a token was successfully consumed it registers the new account, and returns 2
    query =
        "CREATE OR REPLACE FUNCTION `" + config.db + "`.`registerAccount`(hash TINYTEXT, username TINYTEXT, pass TINYTEXT, org INT, year INT) RETURNS INT " +
        "BEGIN " +
        " IF EXISTS(SELECT 1 FROM `" + config.db + "`.`" + config.tableAccount + "` WHERE `user` = username LIMIT 1) THEN " +
        "  RETURN 0;" +
        " END IF;" +
        " UPDATE `" + config.db + "`.`" + config.tableToken + "` SET `registered` = 1, `user` = username WHERE `registered` = 0 AND LEFT(`token`, 5) = hash LIMIT 1;" +
        " IF (ROW_COUNT() = 0) THEN " +
        "  RETURN 1;" +
        " ELSE " +
        "  INSERT INTO `" + config.db + "`.`" + config.tableAccount + "` (`user`,`pass`,`org`,`year`) VALUES (username, pass, org, year);" +
        "  RETURN 2;" +
        " END IF;" +
        "END"
    await conn.query(query)
    //Recover account function
    //First it checks if there's a token - name match, returns 0 if there isn't
    //Then it checks if there's an active recovery already issued, if so it returns 1
    //If there's a recovery attempt but expired, or no attempt at all then create a new issue and return 2
    query =
        "CREATE OR REPLACE FUNCTION `" + config.db + "`.`recoverAccount`(searchtoken TINYTEXT, username TINYTEXT, resethash TINYTEXT) RETURNS INT " +
        "BEGIN " +
        " IF NOT EXISTS (SELECT 1 FROM `" + config.db + "`.`" + config.tableToken + "` WHERE LEFT(`token`, 5) = searchtoken AND `user` = username) THEN " +
        "  RETURN 0;" +
        " END IF;" +
        " IF EXISTS (SELECT 1 FROM `" + config.db + "`.`" + config.tableRecover + "` WHERE `user` = username AND `expires` > CURRENT_TIMESTAMP()) THEN " +
        "  RETURN 1;" +
        " END IF;" +
        " SET @time = TIMESTAMPADD(HOUR, 1, CURRENT_TIMESTAMP());" +
        " INSERT INTO `" + config.db + "`.`" + config.tableRecover + "` (`hash`, `user`, `expires`) VALUES (resethash, username, @TIME) ON DUPLICATE KEY UPDATE `hash` = resethash, `expires` = @time;" +
        " RETURN 2;" +
        "END"
    await conn.query(query)
    //Reset account function
    //First check if there's a hash - name match, return 0 if there isn't
    //If there is, delete the reset hash and change the account password
    query =
        "CREATE OR REPLACE FUNCTION `" + config.db + "`.`resetAccount`(resethash TINYTEXT, username TINYTEXT, newpass TINYTEXT) RETURNS INT " +
        "BEGIN " +
        " IF NOT EXISTS (SELECT 1 FROM `" + config.db + "`.`" + config.tableRecover + "` WHERE `hash` = resethash AND `user` = username AND `expires` > CURRENT_TIMESTAMP()) THEN " +
        "  RETURN 0;" +
        " END IF;" +
        " DELETE FROM `" + config.db + "`.`" + config.tableRecover + "` WHERE `user` = username;" +
        " UPDATE `" + config.db + "`.`" + config.tableAccount + "` SET `pass` = newpass WHERE `user` = username;" +
        " RETURN 1;" +
        "END"
    await conn.query(query)
    //Check mail function
    //If the hash has already been used to register an account return 0
    //If there's no record of the mail hash at all, create a new record
    //Finally return 1 meaning that a code can be sent
    query =
        "CREATE OR REPLACE FUNCTION `" + config.db + "`.`checkMail`(hash TINYTEXT) RETURNS INT " +
        "BEGIN " +
        " IF EXISTS (SELECT 1 FROM `" + config.db + "`.`" + config.tableToken + "` WHERE `token` = hash AND `registered` = 1) THEN " +
        "  RETURN 0;" +
        " END IF;" +
        " IF NOT EXISTS(SELECT 1 FROM `" + config.db + "`.`" + config.tableToken + "` WHERE `token` = hash) THEN " +
        "  INSERT INTO `" + config.db + "`.`" + config.tableToken + "` (`token`) VALUES (hash);" +
        " END IF;" +
        " RETURN 1;" +
        "END"
    await conn.query(query)
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
Database.checkMail = async function(conn, hash) {
    try {
        return await conn.query(
            "SELECT `" + config.db + "`.`checkMail`(?) AS result",
            hash
        )
    } catch (e) {
        throw e
    }
}
module.exports = Database