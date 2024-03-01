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
        this.time = new Date().getTime()
        this.game = new Game(socketIds)
        this.events = {
            updatePlayerPosition: this.updatePlayerPosition,
            spellPickup: this.spellPickup,
            keyPickup: this.keyPickup,
            castSpell: this.castSpell,
            playerWon: this.playerWon,
            playerLeft: this.onLeave,
            dropKey: this.dropKey,
            disconnect: this.onDisconnect,
            applySpellEffect: this.applySpellEffect,
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

    applySpellEffect = (socket, spellType) => {
        const opponent = this.sockets.find(
            (_socket) => _socket.id !== socket.id
        )
        this.broadcast(socket, "applySpellEffect", {
            spellType,
            id: opponent.id,
        })
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

    playerWon = (socket, score) => {
        this.state = "Ended"

        const isLeaderboardEntry = this.gameserver.isLeaderboardEntry(score)
        if (isLeaderboardEntry) {
            this.gameserver.enableLeaderboardEntry(socket, score)
        }

        this.game.players[socket.id].isWinner = true
        this.broadcast(socket, "playerWon", socket.id)
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

    endSession = () => {
        this.sockets.forEach((socket) => {
            Object.keys(this.events).forEach((event) => {
                socket.removeAllListeners(event)
            })
            console.log(socket.eventNames())
        })
        this.namespace.socketsLeave(this.id)
        this.gameserver.endSession(this)
    }

    onDisconnect = (socket) => {
        console.log("Session", this.id, "Socket disconnected: ", socket.id)
        this.emit("sessionEnded")
        this.endSession()
    }

    updatePlayerPosition = (socket, coords) => {
        this.game.players[socket.id].x = coords.x
        this.game.players[socket.id].y = coords.y
        this.broadcast(socket, "updatePlayerPosition", {
            coords,
            id: socket.id,
        })
    }

    spectate = (socket) => {
        socket.join(this.id)
        socket.emit("gameData", this.game)

        socket.on("stopSpectate", () => {
            socket.leave(this.id)
        })
    }
}
