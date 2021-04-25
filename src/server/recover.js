module.exports = Recover
async function Recover(req, res) {
    try {
        res.render("recover")
    } catch (e) {
        console.error(e)
        res.send(e)
    }
}