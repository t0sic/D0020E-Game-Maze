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
        this.time = new Date().getTime()
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
                this.castSpell(socket, data)
                break
            case "playerWon":
                this.playerWon(socket)
                break
            case "dropKey":
                this.dropKey(socket, data)
                break
            case "spectate":
                this.spectate(socket)
                break
        }
    }

    spectate = (socket) => {
        console.log("Spectator joined")
        socket.emit("data", this.game)
    }

    playerWon = (socket) => {
        socket.broadcast.emit("playerWon")
        this.gameserver.endSession(this)
    }

    castSpell = (socket, projectile) => {
        socket.broadcast.emit("castSpell", { ...projectile, id: socket.id })
    }

    dropKey = (socket, data) => {
        console.log("drop key", data, socket.id)
        this.game.players[socket.id].hasKey = false
        this.game.map.key = data
        socket.broadcast.emit("dropKey", { ...data, id: socket.id })
    }

    spellPickup = (socket, spell) => {
        this.game.spells = this.game.spells.filter((s) => {
            if (
                s.x === spell.x &&
                s.y === spell.y &&
                s.spellType === spell.spellType
            ) {
                return false
            }
            return true
        })

        this.game.players[socket.id].spells.push(spell.spellType)
        socket.broadcast.emit("spellPickup", { spell, id: socket.id })
    }

    keyPickup = (socket) => {
        this.game.players[socket.id].hasKey = true
        this.game.map.key = null
        socket.broadcast.emit("keyPickup", socket.id)
    }

    onDisconnect = (socket) => {
        console.log("Session Disconnect", socket.id)

        const isPlayer = this.users.some((user) => user.id === socket.id)

        if (!isPlayer) return console.log("Spectator left")

        this.users.forEach((user) => {
            if (user.id !== socket.id)
                this.websocketRoom.sendEvent("endSession")
        })

        this.gameserver.endSession(this)
    }

    updatePlayerPosition = (socket, data) => {
        this.game.players[socket.id].x = data.x
        this.game.players[socket.id].y = data.y
        socket.broadcast.emit("updatePlayerPosition", {
            coords: data,
            id: socket.id,
        })
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
