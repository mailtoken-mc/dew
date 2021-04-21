const Database = require("./db")

module.exports = Index
async function Index(req, res) {
    res.render("index")
}