const Database = require("./db")

module.exports = Index
async function Index(req, res) {
    let latest = await Database.requestHistory(10)
    let entries = []
    latest.forEach((event) => {
        let data = JSON.parse(event.json)
        switch (event.event) {
            case "ADVANCEMENT":
                entries.push([
                    {type: "player", data: event.player1},
                    {type: "text", data: " desbloquio el logro "},
                    {type: "advancement", data: data.advancement}
                ])
                break
            case "JOIN":
                entries.push([
                    {type: "player", data: event.player1},
                    {type: "text", data: " ha ingresado por primera vez"}
                ])
                break
            case "DEATH": {
                    if (event.player2) {
                        entries.push([
                            {type: "player", data: event.player1},
                            {type: "text", data: " fue asesinado por "},
                            {type: "player", data: event.player2}
                        ])
                    } else {
                        let entry = [
                            {type: "player", data: event.player1},
                            {type: "text", data: " murio de "},
                            {type: "damage", data: data.reason}
                        ]
                        if (data.by !== "UNKNOWN") {
                            entry.push(
                                {type: "text", data: " por "},
                                {type: "entity", data: data.by}
                            )
                        }
                        entries.push(entry)
                    }
                }
                break
        }
    })
    res.render("index", {entries: entries})
}