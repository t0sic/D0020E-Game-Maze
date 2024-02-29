import Gameserver from "../gameserver/gameserver.js"
import bodyParser from "body-parser"
import { Server } from "socket.io"
import express from "express"
import * as url from "url"
import qr from "qr-image"
import path from "path"
import http from "http"
import fs from "fs"

export default class Webserver {
    constructor(port) {
        this.port = port
        this.app = express()
        this.server = null
        this.io = null
    }

    start = async () => {
        this.middleware()
        this.routes()

        this.server = http.createServer(this.app).listen(this.port, () => {
            console.log("Started Webserver on port:", this.port)
            console.log("Starting websocket server...")
            this.io = new Server(this.server)
            this.gameserver = new Gameserver(this.io)
        })
        this.generateQr()
    }

    middleware = () => {
        const { urlencoded } = bodyParser

        this.app.use(express.static("public"))
        this.app.use(urlencoded({ extended: true }))
        this.app.use(express.json())
    }

    generateQr = async () => {
        const response = await fetch("https://api.myip.com/")
        const data = await response.json()
        const ipv4address = data.ip
        const url = `http://${ipv4address}:3000`
        const savePath = path.join(process.cwd(), "/public/assets/qrcode.png")
        qr.image(url, { type: "png" }).pipe(fs.createWriteStream(savePath))
    }

    routes = () => {
        const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
        const options = { root: path.join(__dirname, "../../public") }

        this.app.get("/", (_req, res) => {
            res.sendFile("index.html", options)
        })

        this.app.get("/api/leaderboard", (_req, res) => {
            res.json(this.gameserver.leaderboard)
        })

        this.app.post("/api/leaderboard", (req, res) => {
            const { name, id } = req.body

            if (!name || !id) {
                return res.sendStatus(400)
            }

            this.gameserver.addLeaderboardEntry(name, id)
            res.sendStatus(200)
        })

        this.app.get("/api/sessions", (_req, res) => {
            const sessions = [...this.gameserver.sessions].map((session) => ({
                id: session.id,
                time: session.time,
            }))

            res.send(sessions)
        })
    }
}
