const Database = require("./db")
const UserError = require("../shared/usererror")
const RegisterShared = require("../shared/register")
const Response = require("./response_post")

const sharp = require("sharp")

module.exports = RegisterPost
async function RegisterPost(req, res) {
    //Check form input
    try {
        RegisterShared.checkInput(req.body)
    } catch (e) {
        Response.error(res, e.message)
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
        Response.error(res, e.message)
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
        console.log(queryResult[0].result)
        switch (queryResult[0].result) {
            case 0:
                throw new UserError("Username unavailable", "UNAVAILABLEUSER")
            case 1:
                throw new UserError("Invalid token", "UNAVAILABLETOKEN")
            case 2:
                Response.success(res)
        }
    } catch (e) {
        if (e instanceof UserError) {
            Response.error(res, e.message)
        } else {
            console.log(e)
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