import WebsocketRoom from "./websocketRoom.js"
import Game from "./game.js"

export default class Session {
    constructor(spectator, gameserver, id) {
        this.spectator = spectator
        this.gameserver = gameserver
        const io = gameserver.webserver.io
        this.websocketRoom = new WebsocketRoom(id, this.eventHandler, io) // needs to create websocket room with id
        this.state = "Not Started"
        this.id = id
        this.users = []
        this.game
    }

    eventHandler = (socket, event, data) => {
        console.log("Session Event", socket.id, event, data)

        switch (event) {
            case "disconnect":
                this.onDisconnect(socket)
                break
            case "movePlayer":
                this.onPlayerMove()
                break
            case "playerLeft":
                this.onLeave()
                break
            case "playerReady":
                this.onPlayerReady(socket)
                break
        }
    }

    onDisconnect = (socket) => {
        console.log("Session Disconnect", socket.id)

        this.users.forEach((user) => {
            if (user.id !== socket.id)
                this.websocketRoom.sendEvent("endSession")
        })

        this.gameserver.endSession(this)
    }

    onPlayerMove = () => {}

    onLeave = () => {}

    onPlayerReady = (socket) => {
        // Once both clients have sent a message stating they are ready The game object is created and passed back
        this.users.push(socket)
        if (this.users.length == 2) {
            this.game = new Game(this.users.map((user) => user.id))
            this.state = "Started"
            console.log("Session Starting game, both players ready")
            this.websocketRoom.sendEvent("startGame", this.game)
        }
    }
}
