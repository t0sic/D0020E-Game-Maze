import WebsocketRoom from "./websocketRoom.js"
import { v4 as uuid } from "uuid"
import Session from "./session.js"

export default class Gameserver {
    constructor(webserver) {
        this.queue = []
        this.sessions = []
        this.webserver = webserver

        this.websocketRoom = new WebsocketRoom(
            "gameserver",
            this.eventHandler,
            this.webserver.io,
        )

        console.log("Gameserver started")
    }

    eventHandler = (socket, event, data) => {
        console.log("new event", socket.id, event, data)

        switch (event) {
            case "connection":
                this.onJoinQueue(socket)
                break
            case "disconnect":
                this.onLeaveQueue(socket)
                break
        }
    }

    onLeaveQueue = (socket) => {
        this.queue = this.queue.filter((_socket) => socket.id !== _socket.id)

        console.log(this.queue)
    }

    createSession = () => {
        const pair = this.getPlayerPair()
        const id = uuid()
        this.sessions.push(new Session(null, this, id))
        pair.forEach((socket) => {
            socket.emit("callToSession", id)
        })

        console.log("Creating new session", pair.length)
    }

    onJoinQueue = (socket) => {
        this.queue.push(socket)
        if (this.queue.length >= 2) this.createSession()
    }

    getPlayerPair = () => {
        if (this.queue.length < 2)
            throw new Error("Atleast 2 players must be in queue to get pair")

        return this.queue.splice(0, 2)
    }
}
