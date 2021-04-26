module.exports = Reset
async function Reset(req, res) {
    try {
        res.render("reset", {
            hash: req.params.hash
        })
    } catch (e) {
        console.error(e)
        res.send(e)
    }
}
