import Gameserver from "../gameserver/gameserver.js"
import { Server } from "socket.io"
import express from "express"
import * as url from "url"
import path from "path"
import http from "http"
import fs from "fs"
import os from "os"
import { fileURLToPath } from "url"
import qr from "qr-image"

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
        this.generateQr()
    }

    middleware = () => {
        this.app.use(express.static("public"))
    }

    generateQr = async () => {
        const response = await fetch("https://api.myip.com/")
        const data = await response.json()
        console.log("logging data", data)
        const ipv4address = data.ip
        const url = `http://${ipv4address}:3000`
        const savePath = path.join(process.cwd(), "/public/assets/qrcode.png")
        console.log(savePath)
        qr.image(url, { type: "png" }).pipe(fs.createWriteStream(savePath))
    }

    routes = () => {
        const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
        const options = { root: path.join(__dirname, "../../public") }

        this.app.get("/", (req, res) => {
            res.sendFile("index.html", options)
        })

        this.app.get("/api/leaderboard", (req, res) => {
            res.json(this.gameserver.leaderboard)
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
