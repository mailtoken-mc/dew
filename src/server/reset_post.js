const Database = require("./db")
const UserError = require("../shared/usererror")
const ResetShared = require("../shared/reset")
const Response = require("./response_post")

module.exports = ResetPost
async function ResetPost(req, res) {
    //Check form input
    try {
        ResetShared.checkInput(req.body)
    } catch (e) {
        Response.error(res, e.message)
        return
    }
    //Attempt to change password
    let conn = null
    try {
        conn = await Database.pool.getConnection()
        let queryResult = await Database.resetAccount(conn, {hash: req.body.hash, user: req.body.user, pass: req.body.pass})
        switch (queryResult[0].result) {
            case 0:
                throw new UserError("Wrong hash or username", "FAIL")
            case 1:
                Response.success(res)
        }
    } catch (e) {
        if (e instanceof UserError) {
            Response.error(res, e.message)
        } else {
            console.error(e)
        }
    } finally {
        if (conn)
            await conn.release()
    }
}