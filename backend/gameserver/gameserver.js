import Session from "./session.js"
import { v4 as uuid } from "uuid"

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
                socket.on("leaveQueue", () => {
                    if (this.isInQueue(socket)) {
                        this.leaveQueue(socket)
                        socket.removeAllListeners("disconnect")
                    }
                })
                this.onJoinQueue(socket)
                socket.on("disconnect", () => {
                    if (this.isInQueue(socket)) {
                        this.leaveQueue(socket)
                    }
                })
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
        socket.removeAllListeners("leaveQueue")
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

    isLeaderboardEntry = (score) => {
        return this.leaderboard.length < 10 || score > this.leaderboard[9].score
    }

    enableLeaderboardEntry = (socket, score) => {
        const id = uuid()
        const place = this.getLeaderboardPlace(score)
        const entry = { score, place, id }

        this.newLeaderboardEntries.push(entry)

        socket.emit("enableLeaderboardEntry", entry)
    }

    getLeaderboardPlace = (score) => {
        const place = this.leaderboard.findIndex((entry) => entry.score < score)
        return place === -1 ? this.leaderboard.length + 1 : place + 1
    }

    addLeaderboardEntry = (name, id) => {
        const entry = this.newLeaderboardEntries.find(
            (entry) => entry.id === id
        )
        entry.name = name
        this.newLeaderboardEntries = this.newLeaderboardEntries.filter(
            (_entry) => entry.id !== _entry.id
        )

        this.leaderboard.push(entry)
        this.leaderboard.sort((a, b) => b.score - a.score)
        this.leaderboard = this.leaderboard.slice(0, 10)
        console.log("Gameserver Leaderboard updated")
    }
}
