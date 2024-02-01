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
        const player = this.players[playerId]
        const dx = coords.x - player.x
        const dy = coords.y - player.y
        const resultantVector = new Phaser.Math.Vector2(dx, dy)

        const frameIndex = player.calculateFrameIndex(resultantVector)

        if (player.activeFrameIndex !== frameIndex) {
            player.activeFrameIndex = frameIndex

            const animations = {
                0: "down",
                4: "left",
                8: "right",
                12: "up",
            }

            const animationKey = animations[frameIndex]
            player.play(`${animationKey}_animation`, true)
        }

        player.setPosition(coords.x, coords.y)
        setTimeout(() => {
            if (coords.x === player.x && coords.y === player.y) {
                player.anims.stop()
            }
        }, 100)
    }

    addCamera = (player) => {
        const camera = this.cameras.main
        const mapWidth = this.map.width
        const mapHeight = this.map.height

        if (player) {
            camera.startFollow(this.players[player])
            camera.setZoom(this.zoom || 2)
        } else {
            console.log(mapWidth, mapHeight)
            camera.stopFollow()
            camera.centerOn(mapWidth / 2, mapHeight / 2)
            camera.setZoom(this.zoom || 1)
        }
    }

    zoomCamera = (zoom) => {
        this.zoom = zoom
        this.cameras.main.setZoom(zoom)
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

        if (map.key) {
            this.map.createKey(map.key.x, map.key.y, [])
        }

        eventEmitter.on("updatePlayerPosition", this.updatePlayerPosition)
        eventEmitter.on("keyPickup", this.map.destroyKey)
        eventEmitter.on("spellPickup", this.map.destroySpell)
        eventEmitter.on("cameraFocusPlayer", this.addCamera)
        eventEmitter.on("cameraZoom", this.zoomCamera)

        this.addCamera()
    }
}
