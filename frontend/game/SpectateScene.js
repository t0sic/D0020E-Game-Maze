import eventEmitter from "../eventEmitter.js"
import { preload } from "./shared.js"
import Player from "./Player.js"
import Phaser from "phaser"
import Map from "./Map.js"

export default class SpectateScene extends Phaser.Scene {
    constructor() {
        super("SpectateScene")
    }

    init = () => {
        this.spells = []
        this.players = []
    }

    preload = () => {
        preload(this)
    }

    create = () => {
        this.map = new Map(this)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.emit("sceneCreated")
    }

    updatePlayerPosition = (coords, playerId) => {
        this.players[playerId].setPosition(coords.x, coords.y)
    }

    addCamera = (player) => {
        const camera = this.cameras.main
        const mapWidth = this.map.width
        const mapHeight = this.map.height

        if (player) {
            camera.startFollow(this.players[player])
            camera.setZoom(2)
        } else {
            console.log(mapWidth, mapHeight)
            camera.stopFollow()
            camera.centerOn(mapWidth / 2, mapHeight / 2)
            camera.setZoom(1)
        }
    }

    setGameData = (gameData) => {
        const { map, players, spells } = gameData

        this.map.createMap(map.asset)

        const ids = Object.keys(players)

        this.players = {
            [ids[0]]: new Player(this, players[ids[0]].x, players[ids[0]].y),
            [ids[1]]: new Player(this, players[ids[1]].x, players[ids[1]].y),
        }

        spells.forEach((spell) => this.map.createSpell(spell, []))
        this.map.createKey(map.key.x, map.key.y, [])

        eventEmitter.on("updatePlayerPosition", this.updatePlayerPosition)
        eventEmitter.on("keyPickup", this.map.destroyKey)
        eventEmitter.on("spellPickup", this.map.destroySpell)
        eventEmitter.on("cameraFocusPlayer", this.addCamera)

        this.addCamera()
    }
}
