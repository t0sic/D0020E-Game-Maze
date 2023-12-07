import { Server } from "socket.io"
import WebsocketRoom from "./websocketRoom.js"

export default class Gameserver {
    constructor(webserver) {
        this.queue = []
        this.sessions = []
        this.webserver = webserver
        this.io = new Server(webserver.server)

        this.websocketRoom = new WebsocketRoom(
            "gameserver",
            this.eventHandler,
            this.io,
        )

        console.log("Gameserver started")
    }

    eventHandler = (event, data) => {
        switch (event) {
            case "connection":
                this.onConnection(data)
                break
            case "disconnect":
                this.onDisconnect(data)
                break
        }
    }

    onDisconnect = (userId) => {
        this.queue = this.queue.filter((id) => userId !== id)

        console.log(this.queue)
    }

    onConnection = (userId) => {
        if (this.queue.includes(userId)) return

        this.queue.push(userId)

        console.log(this.queue)
    }
}
