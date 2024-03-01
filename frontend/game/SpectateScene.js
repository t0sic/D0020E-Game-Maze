import {
    preload,
    createProjectileAnimations,
    createKeyAnimations,
} from "./shared.js"
import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"
import Map from "./Map.js"

export default class SpectateScene extends Phaser.Scene {
    constructor() {
        super("SpectateScene")
        this.socketListeners = [
            "updatePlayerPosition",
            "castSpell",
            "keyPickup",
            "spellPickup",
            "dropKey",
            "spawnSpell",
            "playerWon",
            "gameData",
            "sessionEnded",
            "applySpellEffect",
        ]
    }

    init = () => {
        this.spells = []
        this.players = []
        this.projectiles = this.add.group()
        this.socket = this.registry.get("socket")
    }

    preload = () => {
        preload(this)
    }

    create = () => {
        this.map = new Map(this)

        createProjectileAnimations(this)
        createKeyAnimations(this)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.emit("sceneCreated")
    }

    onPlayerMove = (data) => {
        this.players[data.id].updatePlayerPosition(data)
    }

    addCamera = (player) => {
        const camera = this.cameras.main
        const mapWidth = this.map.width
        const mapHeight = this.map.height

        if (player) {
            camera.startFollow(this.players[player])
            camera.setZoom(this.zoom || 2)
        } else {
            camera.stopFollow()
            camera.centerOn(mapWidth / 2, mapHeight / 2)
            camera.setZoom(this.zoom || 1)
        }
    }

    zoomCamera = (zoom) => {
        this.zoom = zoom
        this.cameras.main.setZoom(zoom)
    }

    onCastSpell = (data) => {
        this.gameData.players[data.id].spells = this.gameData.players[
            data.id
        ].spells.filter((spell) => spell !== data.spellType)
        eventEmitter.emit("gameData", this.gameData)
        this.players[data.id].castSpell(data)
    }

    onKeyDrop = ({ x, y, id }) => {
        this.gameData.players[id].hasKey = false
        eventEmitter.emit("gameData", this.gameData)
        this.map.createKey(x, y, [])
    }

    createSpell = (spell) => {
        this.map.createSpell(spell, [])
    }

    destroySpell = ({ spell, id }) => {
        this.gameData.players[id].spells.push(spell.spellType)
        eventEmitter.emit("gameData", this.gameData)
        this.map.destroySpell(spell)
    }

    keyPickup = (id) => {
        this.gameData.players[id].hasKey = true
        this.map.destroyKey()
        eventEmitter.emit("gameData", this.gameData)
    }

    setGameData = (gameData) => {
        this.gameData = gameData
        const { map, players, spells } = this.gameData

        this.map.createMap(map.name)

        const ids = Object.keys(players)

        this.players = {
            [ids[0]]: new Player(
                this,
                players[ids[0]].x,
                players[ids[0]].y,
                false,
                "opponent"
            ),
            [ids[1]]: new Player(
                this,
                players[ids[1]].x,
                players[ids[1]].y,
                false,
                "player"
            ),
        }

        this.players[ids[0]].opponent = this.players[ids[1]]
        this.players[ids[1]].opponent = this.players[ids[0]]

        this.players[ids[0]].playIdleAnimation(new Phaser.Math.Vector2(1, 0))
        this.players[ids[1]].playIdleAnimation(new Phaser.Math.Vector2(1, 0))

        spells.forEach((spell) => this.map.createSpell(spell, []))

        if (map.key) {
            this.map.createKey(map.key.x, map.key.y, [])
        }

        this.socket.on("updatePlayerPosition", this.onPlayerMove)
        this.socket.on("castSpell", this.onCastSpell)
        this.socket.on("keyPickup", this.keyPickup)
        this.socket.on("spellPickup", this.destroySpell)
        this.socket.on("dropKey", this.onKeyDrop)
        this.socket.on("spawnSpell", this.createSpell)
        this.socket.on("playerWon", this.onPlayerWon)
        this.socket.on("sessionEnded", this.endSession)
        this.socket.on("applySpellEffect", this.applySpellEffect)

        eventEmitter.on("cameraFocusPlayer", this.addCamera)
        eventEmitter.on("cameraZoom", this.zoomCamera)
        eventEmitter.on("leaveGame", this.leaveGame)
        this.addCamera()
    }

    applySpellEffect = ({ spellType, id }) => {
        const player = players[id]
        player.applySpellEffect(spellType, player)
    }

    leaveGame = () => {
        this.removeAllGameListeners()
        eventEmitter.emit("leftGame")
    }

    onPlayerWon = (socketId) => {
        this.removeAllGameListeners()
        const spritesheet = this.players[socketId].spritesheet
        const winner = spritesheet === "opponent" ? "red" : "blue"
        eventEmitter.emit("gameEnded", winner)
    }

    endSession = () => {
        this.removeAllGameListeners()
        eventEmitter.emit("sessionEnded")
    }

    removeAllGameListeners = () => {
        this.socketListeners.forEach((event) => {
            // Deregisters All socket listeners related to gamescene for this client.
            this.socket.off(event)
        })
    }
}
