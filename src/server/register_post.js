const Database = require("./db")
const UserError = require("../shared/usererror")
const RegisterShared = require("../shared/register")

const sharp = require("sharp")

module.exports = RegisterPost
async function RegisterPost(req, res) {
    //Check form input
    try {
        RegisterShared.checkInput(req.body)
    } catch (e) {
        sendError(res, e.message)
        return
    }
    //Check image
    let image = null
    try {
        if (req.file) {
            let result = await checkImage(req.file.buffer)
            image = result.toString("base64")
        }
    } catch (e) {
        sendError(res, e.message)
        return
    }
    //Issue registration
    let conn = null
    try {
        //Connect to database
        conn = await Database.pool.getConnection()
        //Attempt to register
        let queryResult = await Database.registerAccount(conn, req.body)
        //Check how registration went
        switch (queryResult[0].result) {
            case 0:
                throw new UserError("Username unavailable", "UNAVAILABLEUSER")
            case 1:
                throw new UserError("Invalid token", "UNAVAILABLETOKEN")
            case 2:
                sendSuccess(res)
        }
    } catch (e) {
        if (e instanceof UserError) {
            sendError(res, e.message)
        }
    } finally {
        if (conn)
            await conn.release()
    }
}

async function checkImage(buffer) {
    try {
        let image = await sharp(buffer)
        let metadata = await image.metadata()
        if ((metadata.height !== 64) || (metadata.width !== 64))
            throw Error("Wrong image dimensions")
        let resized = image.resize(64, 64)
        return await resized.toBuffer()
    } catch (e) {
        throw e
    }
}

function sendError(res, error) {
    let response = {}
    response.success = 0
    response.exception = error
    res.send(JSON.stringify(response))
}

function sendSuccess(res) {
    let response = {}
    response.success = 1
    res.send(JSON.stringify(response))
}