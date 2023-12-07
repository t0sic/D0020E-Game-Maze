import WebsocketRoom from "./websocketRoom.js"
import { v4 as uuid } from "uuid"

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

    eventHandler = (userId, event, data) => {
        console.log("new event", userId, event, data)

        switch (event) {
            case "connection":
                this.onJoinQueue(userId)
                break
            case "disconnect":
                this.onLeaveQueue(userId)
                break
        }
    }

    onLeaveQueue = (userId) => {
        this.queue = this.queue.filter((id) => userId !== id)

        console.log(this.queue)
    }

    createSession = () => {
        const pair = this.getPlayerPair()
        const id = uuid()

        console.log("Creating new session", id, pair)
    }

    onJoinQueue = (userId) => {
        this.queue.push(userId)

        if (this.queue.length >= 2) this.createSession()
    }

    getPlayerPair = () => {
        if (this.queue.length < 2)
            throw new Error("Atleast 2 players must be in queue to get pair")

        return this.queue.splice(0, 2)
    }
}
