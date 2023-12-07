import express from "express"
import cookieParser from "cookie-parser"
import { v4 as uuid } from "uuid"
import http from "http"

export default class Webserver {
    constructor(port) {
        this.port = port
        this.app = express()
    }

    start() {
        this.middleware()
        this.routes()
        this.server = http.createServer(this.app).listen(this.port, () => {
            console.log("Started Webserver on port:", this.port)
        })
    }

    middleware() {
        this.app.use(express.static("public"))
        this.app.use(cookieParser())
        this.app.use(this.setUser)
    }

    setUser(req, res, next) {
        let userId = req.cookies.userId

        if (!userId) {
            userId = uuid()
            res.cookie("userId", userId)
        }
        req.user = userId
        next()
    }

    routes() {
        this.app.get("/test", (req, res) => {
            console.log(req.user)
            res.sendStatus(200)
        })
    }
}

// //const app = express() // Create webserver
// //const PORT = process.env["PORT"] || 3000 // Define port

// app.use(express.static("public")) // Create static routes

// // Start listening on port for connections
// app.listen(PORT, () => {
//     console.log("Started webserver on port:", PORT)
// })
