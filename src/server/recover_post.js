const Database = require("./db")
const config = require('../../config.json')
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const RecoverShared = require("../shared/recover")
const Response = require("./response_post")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.mailuser,
        pass: config.mailpass
    }
})

module.exports = RecoverPost
async function RecoverPost(req, res) {
    //Check input
    try {
        RecoverShared.checkInput(req.body)
    } catch (e) {
        Response.error(res, e.message)
        return
    }
    Response.success(res)
    //Check if account exists
    let conn = null
    let queryResult
    try {
        conn = Database.pool.getConnection()
        let token = crypto.createHmac("sha256", config.tokenSeed).update(req.body.mail).digest("hex")
        queryResult = Database.searchAccount(conn, {token: token, user: req.body.user})
        if (queryResult[0].found) {
            //Creates a new recovery token or update existing one

            //Send mail
            await transporter.sendMail({
                from: config.mail,
                to: req.body.mail,
                subject: "Recuperar",
                html: "pa"
            })
        }
    } catch (e) {
        console.error(e)
        return
    } finally {
        if (conn)
            await conn.release()
    }
}