const Database = require("./db")

module.exports = Index
async function Index(req, res) {
    let conn = await Database.pool.getConnection()
    let latest = await Database.requestHistory(conn, 10)
    let population = await Database.requestPopulation(conn)
    let alive = await Database.requestPopulationAlive(conn)
    let top_advancement = await Database.requestAdvancementScore(conn, 10)
    let top_experience = await Database.requestExperienceScore(conn, 10)
    let top_kills = await Database.requestKillsScore(conn, 10)
    let top_time = await Database.requestTimeScore(conn, 10)
    await conn.release()
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
    res.render("index", {
        entries: entries,
        population: population[0].population,
        alive: alive[0].alive,
        top_advancement: top_advancement,
        top_experience: top_experience,
        top_kills: top_kills,
        top_time: top_time
    })
}