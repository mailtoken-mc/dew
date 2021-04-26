const Database = require("./db")
const config = require('../../config.json')
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const RecoverShared = require("../shared/recover")
const Response = require("./response_post")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.mail,
        pass: config.mailPass
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
    let conn = null
    try {
        conn = await Database.pool.getConnection()
        let token = crypto.createHmac("sha256", config.seedToken)
            .update(req.body.mail)
            .digest("hex")
            .substring(0, 5)
            .toUpperCase()
        let hash = crypto.createHmac("sha256", Date.now().toString())
            .update(req.body.mail)
            .digest("hex")
        let queryResult = await Database.recoverAccount(conn, {token: token, user: req.body.user, hash: hash})
        //Found nonexistent/expired hash, send new one
        if (queryResult[0].result === 2) {
            await transporter.sendMail({
                from: config.mail,
                to: req.body.mail,
                subject: "Recuperar",
                html: hash
            })
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (conn)
            await conn.release()
    }
}