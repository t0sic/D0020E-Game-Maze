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
        console.log("Gameserver Event:", socket.id, event, data)

        switch (event) {
            case "joinQueue":
                if (!this.isInQueue(socket)) {
                    this.onJoinQueue(socket)
                }
                break
            case "leaveQueue":
                if (this.isInQueue(socket)) {
                    this.onLeaveQueue(socket)
                }
            case "connection":
                console.log("Gameserver Player connected:", socket.id)
                break
            case "disconnect":
                if (this.isInQueue(socket)) {
                    this.onLeaveQueue(socket)
                }
                break
        }
    }

    isInQueue = (socket) => {
        return this.queue.some((_socket) => socket.id === _socket.id)
    }

    onLeaveQueue = (socket) => {
        this.queue = this.queue.filter((_socket) => socket.id !== _socket.id)
        console.log(
            "Gameserver Player leaving queue: ",
            socket.id,
            "Queue size:",
            this.queue.length,
        )
    }

    onJoinQueue = (socket) => {
        this.queue.push(socket)
        console.log(
            "Gameserver Player joining queue",
            socket.id,
            "Queue size:",
            this.queue.length,
        )
        if (this.queue.length >= 2) this.createSession()
    }

    endSession = (session) => {
        console.log("Gameserver Removing session, id:", session.id)

        this.sessions = this.sessions.filter(
            (_session) => session.id !== _session.id,
        )

        console.log(this.sessions)
    }

    createSession = () => {
        const pair = this.getPlayerPair()
        const id = uuid()
        this.sessions.push(new Session(null, this, id))
        pair.forEach((socket) => {
            socket.emit("callToSession", id)
            this.onLeaveQueue(socket)
        })

        console.log("Gameserver Creating new session, id:", id)
    }

    getPlayerPair = () => {
        if (this.queue.length < 2)
            throw new Error("Atleast 2 players must be in queue to get pair")

        return this.queue.splice(0, 2)
    }
}
