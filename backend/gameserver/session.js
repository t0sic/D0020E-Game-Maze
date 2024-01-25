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
            case "updatePlayerPosition":
                this.updatePlayerPosition(socket, data)
                break
            case "playerLeft":
                this.onLeave()
                break
            case "playerReady":
                this.onPlayerReady(socket)
                break
            case "keyPickup":
                this.keyPickup(socket)
                break
            case "spellPickup":
                this.spellPickup(socket, data)
                break
            case "castSpell":
                console.log(data)
                this.castSpell(socket, data)
                break
        }
    }

    castSpell = (socket, projectile) => {
        // sends event to other front end client to spawn spell casted by other client
        socket.broadcast.emit("castSpell", projectile)
    }

    spellPickup = (socket, spell) => {
        this.game.spells = this.game.spells.filter(
            (s) => s.x !== spell.x && s.y !== spell.y
        )

        this.game.players[socket.id].spells.push(spell.spellType)
        socket.broadcast.emit("spellPickup", spell)
    }

    keyPickup = (socket) => {
        this.game.players[socket.id].hasKey = true
        socket.broadcast.emit("keyPickup")
    }

    onDisconnect = (socket) => {
        console.log("Session Disconnect", socket.id)

        this.users.forEach((user) => {
            if (user.id !== socket.id)
                this.websocketRoom.sendEvent("endSession")
        })

        this.gameserver.endSession(this)
    }

    updatePlayerPosition = (socket, data) => {
        this.game.players[socket.id].x = data.x
        this.game.players[socket.id].y = data.y
        socket.broadcast.emit("updatePlayerPosition", data)
    }

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
