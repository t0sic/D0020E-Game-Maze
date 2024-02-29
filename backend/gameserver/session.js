import { v4 as uuid } from "uuid"
import Game from "./game.js"

export default class Session {
    constructor(gameserver, sockets) {
        const socketIds = sockets.map((socket) => socket.id)

        this.gameserver = gameserver
        this.namespace = gameserver.namespace
        this.state = "Started"
        this.sockets = sockets
        this.id = uuid()
        this.game = new Game(socketIds)
        this.events = {
            updatePlayerPosition: this.updatePlayerPosition,
            spellPickup: this.spellPickup,
            keyPickup: this.keyPickup,
            castSpell: this.castSpell,
            playerWon: this.playerWon,
            playerLeft: this.onLeave,
            dropKey: this.dropKey,
        }

        this.sockets.forEach((socket) => {
            socket.join(this.id)
            this.createEventHandlers(socket)
        })

        console.log("Session created with id:", this.id, "Sockets:", socketIds)
    }

    broadcast = (socket, event, data) => {
        console.log(
            "Broadcasting to session:",
            this.id,
            "Event:",
            event,
            "Data:",
            data
        )
        socket.to(this.id).emit(event, data)
    }

    emit = (event, data) => {
        console.log(
            "Emitting to session:",
            this.id,
            "Event:",
            event,
            "Data:",
            data
        )
        this.namespace.to(this.id).emit(event, data)
    }

    createEventHandlers = (socket) => {
        Object.entries(this.events).forEach(([event, handler]) => {
            socket.on(event, (data) => handler(socket, data))
        })
        this.emit("startGame", this.game)
    }

    playerWon = (socket) => {
        this.state = "Ended"

        this.game.players[socket.id].isWinner = true

        this.broadcast(socket, "playerWon")
        this.endSession()
    }

    castSpell = (socket, projectile) => {
        this.broadcast(socket, "castSpell", { ...projectile, id: socket.id })
    }

    dropKey = (socket, data) => {
        this.game.players[socket.id].hasKey = false
        this.game.map.key = data
        this.broadcast(socket, "dropKey", { ...data, id: socket.id })
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

        setTimeout(() => {
            if (this.state === "Started") {
                this.emit("spawnSpell", spell)
            }
        }, 15000)

        this.game.players[socket.id].spells.push(spell.spellType)
        this.broadcast(socket, "spellPickup", { spell, id: socket.id })
    }

    keyPickup = (socket) => {
        this.game.players[socket.id].hasKey = true
        this.game.map.key = null
        this.broadcast(socket, "keyPickup", socket.id)
    }

    endSession = () => {}

    updatePlayerPosition = (socket, coords) => {
        this.game.players[socket.id].x = coords.x
        this.game.players[socket.id].y = coords.y
        this.broadcast(socket, "updatePlayerPosition", {
            coords,
            id: socket.id,
        })
    }
}
