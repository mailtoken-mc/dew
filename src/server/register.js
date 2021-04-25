const fs = require('fs').promises
const os = require('os')

const Database = require("./db")

module.exports = Register
async function Register(req, res) {
    try {
        let orgs = await fs.readFile("src/server/org.txt", "utf8")
        res.render("register", {
            token: req.params.token,
            orgs: orgs.toString().split(os.EOL)
        })
    } catch (e) {
        console.error(e)
        res.send(e)
    }
}
