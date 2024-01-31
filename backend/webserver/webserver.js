import Gameserver from "../gameserver/gameserver.js"
import { Server } from "socket.io"
import express from "express"
import * as url from "url"
import path from "path"
import http from "http"

export default class Webserver {
    constructor(port) {
        this.port = port
        this.app = express()
    }

    start = async () => {
        this.routes()
        this.middleware()

        this.server = http.createServer(this.app).listen(this.port, () => {
            console.log("Started Webserver on port:", this.port)
            console.log("Starting websocket server...")
            this.io = new Server(this.server)
            this.gameserver = new Gameserver(this)
        })
    }

    middleware = () => {
        this.app.use(express.static("public"))
    }

    routes = () => {
        const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
        const options = { root: path.join(__dirname, "../../public") }

        this.app.get("/", (req, res) => {
            res.sendFile("index.html", options)
        })

        this.app.get("/api/sessions", (req, res) => {
            const sessions = [...this.gameserver.sessions].map((session) => ({
                id: session.id,
                time: session.time,
            }))

            res.send(sessions)
        })
    }
}
