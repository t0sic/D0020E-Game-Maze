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
        this.readyPlayers = []
        this.game
    }

    eventHandler = (socket, event, data) => {
        console.log("new event in Session", socket.id, event, data)

        switch (event) {
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

    onPlayerMove = () => {}

    onLeave = () => {}

    onPlayerReady = (socket) => {
        // Once both clients have sent a message stating they are ready The game object is created and passed back
        this.readyPlayers.push(socket.id)
        if (this.readyPlayers.length == 2) {
            this.game = new Game(this.readyPlayers)
            this.state = "Started"
            console.log("Both Players ready, Starting Game")
            this.websocketRoom.sendEvent("startGame", this.game)
        }
    }
}
