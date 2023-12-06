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
        console.log(webserver)
    }

    eventHandler(event, data) {}
}
