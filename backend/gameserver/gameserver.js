import { v4 as uuid } from "uuid"
import Session from "./session.js"

export default class Gameserver {
    constructor(io) {
        this.queue = []
        this.sessions = []
        this.leaderboard = []
        this.newLeaderboardEntries = []
        this.namespace = io.of("/gameserver")

        console.log("Gameserver started")

        this.namespace.on("connection", this.onConnection)
    }

    createEventHandlers = (socket) => {
        socket.on("joinQueue", () => {
            if (!this.isInQueue(socket)) {
                this.onJoinQueue(socket)
                socket.on("disconnect", () => {
                    if (this.isInQueue(socket)) {
                        this.leaveQueue(socket)
                    }
                })
            }
        })
        socket.on("leaveQueue", () => {
            if (this.isInQueue(socket)) {
                this.leaveQueue(socket)
                socket.removeAllListeners("disconnect")
            }
        })

        socket.on("spectate", (sessionId) => {
            console.log(
                "Session spectate request from: ",
                socket.id,
                " to room ",
                sessionId
            )
            const session = this.sessions.find(
                (session) => session.id === sessionId
            )

            if (session) session.spectate(socket)
        })
    }

    onSpectate = (socket, data) => {
        console.log(
            "recieved request to spectate game from: ",
            socket.id,
            " Wanting to spectate session : ",
            data
        )
    }

    onConnection = (socket) => {
        this.createEventHandlers(socket)
    }

    isInQueue = (socket) => {
        return this.queue.some((_socket) => socket.id === _socket.id)
    }

    leaveQueue = (socket) => {
        this.queue = this.queue.filter((_socket) => socket.id !== _socket.id)
        console.log(
            "Gameserver Player leaving queue: ",
            socket.id,
            "Queue size:",
            this.queue.length
        )
    }

    onJoinQueue = (socket) => {
        this.queue.push(socket)
        console.log(
            "Gameserver Player joining queue",
            socket.id,
            "Queue size:",
            this.queue.length
        )
        if (this.queue.length >= 2) this.createSession()
    }

    endSession = (session) => {
        console.log("Gameserver Removing session, id:", session.id)

        this.sessions = this.sessions.filter(
            (_session) => session.id !== _session.id
        )
    }

    createSession = () => {
        const pair = this.getPlayerPair()
        pair.forEach(this.leaveQueue)
        this.sessions.push(new Session(this, pair))
    }

    getPlayerPair = () => {
        if (this.queue.length < 2) {
            throw new Error("Atleast 2 players must be in queue to get pair")
        }

        return this.queue.splice(0, 2)
    }
}
