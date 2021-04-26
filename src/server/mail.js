const config = require('../../config.json')
const Database = require("./db")
const crypto = require("crypto")
const imaps = require("imap-simple")
const nodemailer = require("nodemailer")

authconfig = {
    imap: {
        user: config.mail,
        password: config.mailPass,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions : {
            rejectUnauthorized: false
        },
        authTimeout: 3000
    }
}
transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.mail,
        pass: config.mailPass
    }
})

const Mail = {}
Mail.process = async function() {
    let addresses
    try {
        console.log("Fetching emails...")
        addresses = await Mail.fetch()
    } catch (e) {
        console.error(e)
        console.error("Failed to fetch emails")
        return
    }
    let conn = null
    try {
        if (addresses.length > 0) {
            conn = await Database.pool.getConnection()
            for (const address of addresses) {
                //Check if address is eligible for a code
                let hash = crypto.createHmac("sha256", config.seedToken)
                    .update(address)
                    .digest('hex')
                    .toUpperCase()
                let queryResult = await Database.checkMail(conn, hash)
                let eligible = Boolean(queryResult[0].result)
                //Send mail with the results
                console.log("Sending mail to " + address)
                await Mail.send(address, hash, eligible)
            }
        } else {
            console.log("No new emails")
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (conn)
            await conn.release()
    }
}
Mail.fetch = async function() {
    let conn = null
    try {
        let senders = []
        conn = await imaps.connect(authconfig)
        let box = await conn.openBox('INBOX')
        let searchCriteria = [["UNSEEN"], ["HEADER", "SUBJECT", "REGISTRO"]]
        let fetchOptions = {
            markSeen: true,
            envelope: true,
            bodies: ['HEADER', 'TEXT'],
        }
        let mails = await conn.search(searchCriteria, fetchOptions)
        for (let mail of mails) {
            let sender = mail.attributes.envelope.sender[0].mailbox + "@" + mail.attributes.envelope.sender[0].host
            //Check if sender is not already on senders list
            let alreadyQueued = false
            for (let queuedSender of senders) {
                if (queuedSender === sender) {
                    alreadyQueued = true
                    break
                }
            }
            if (!alreadyQueued) {
                senders.push(sender)
            }
        }
        return senders
    } catch(e) {
        throw(e)
    } finally {
        if (conn)
            conn.end()
    }
}
Mail.send = async function(address, hash, eligible) {
    let code = hash.substring(0, 5).toUpperCase()
    let message
    if (eligible) {
        message = "<p>Tu codigo es " + code + "</p>"
    } else {
        message = "<p>Ya no es posible crear una cuenta</p>"
    }
    let mailOptions = {
        from: config.email,
        to: address,
        subject: "Minecraft hardcore pruebas",
        html: message
    }
    try {
        await transporter.sendMail(mailOptions)
    } catch(e) {
        throw e
    }
}
Mail.sendRecover = async function(address, hash) {
    try {
        await transporter.sendMail({
            from: config.mail,
            to: address,
            subject: "Recuperar",
            html: hash
        })
    } catch(e) {
        throw e
    }
}
module.exports = Mail