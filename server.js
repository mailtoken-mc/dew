const path = require("path")
const express = require("express")
const app = express()
const multer = require('multer')
const Database = require("./src/server/db")
//multer
const storage = multer.memoryStorage()
const upload = multer({storage: storage})
//pages
const Player = require("./src/server/player")
const Index = require("./src/server/index")
const Register = require("./src/server/register")
const RegisterPost = require("./src/server/register_post")
const Recover = require("./src/server/recover")
const RecoverPost = require("./src/server/recover_post")

class HttpServer {
    constructor() {
        console.log("httpserver")
    }
    async start() {
        await Database.connect()
        app.use(express.static(__dirname + "/dist"))
        app.use(express.static(__dirname + "/public"))
        app.use(express.urlencoded({extended: true}))
        app.set("view engine", "pug")
        app.set("views", path.join(__dirname, "./src/server/template"))
        app.get("/", Index)
        app.get("/player/:name", Player)
        app.get("/recover", Recover)
        app.post("/recover", upload.none(), RecoverPost)
        app.get("/register/:token", Register)
        app.post("/register", upload.single("skin"), RegisterPost)
        app.listen(8080);
    }
}
main = new HttpServer();
main.start();