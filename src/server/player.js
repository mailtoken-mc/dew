const Database = require("./db")

module.exports = Player
async function Player(req, res) {
    let name = req.params.name
    if (!name) return
    let conn = await Database.pool.getConnection()
    let data = await Database.requestPlayer(conn, name)
    await conn.release()
    if (data && data[0]) {
        res.render("player", {player: data[0]})
    }
}
