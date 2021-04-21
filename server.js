const path = require("path")
const express = require("express")
const app = express()
const Database = require("./src/server/db")
//pages
const Player = require("./src/server/player")
const Index = require("./src/server/index")

class HttpServer {
    constructor() {
        console.log("httpserver")
    }
    async start() {
        await Database.connect();
        app.use(express.static(__dirname + "/dist"))
        app.set("view engine", "pug")
        app.set("views", path.join(__dirname, "./src/server/template"))
        app.get("/", Index)
        app.get("/player/:name", Player)
        app.listen(8080);
    }
}
main = new HttpServer();
main.start();