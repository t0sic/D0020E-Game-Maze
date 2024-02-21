import { preload, createProjectileAnimations } from "./shared.js"
import eventEmitter from "../eventEmitter.js"
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
        this.projectiles = this.add.group()
    }

    preload = () => {
        preload(this)
    }

    create = () => {
        this.map = new Map(this)

        createProjectileAnimations(this)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.emit("sceneCreated")
    }

    onPlayerMove = (coords, playerId) => {
        this.players[playerId].updatePlayerPosition(coords)
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

    onCastSpell = (spell) => {
        this.players[spell.id].castSpell(spell)
    }

    onKeyDrop = (coords) => {
        this.map.createKey(coords.x, coords.y, [])
    }

    createSpell = (spell) => {
        this.map.createSpell(spell, [])
    }

    setGameData = (gameData) => {
        const { map, players, spells } = gameData

        this.map.createMap(map.name)

        const ids = Object.keys(players)

        this.players = {
            [ids[0]]: new Player(this, players[ids[0]].x, players[ids[0]].y),
            [ids[1]]: new Player(this, players[ids[1]].x, players[ids[1]].y),
        }

        this.players[ids[0]].opponent = this.players[ids[1]]
        this.players[ids[1]].opponent = this.players[ids[0]]

        this.players[ids[0]].playIdleAnimation(new Phaser.Math.Vector2(1, 0))
        this.players[ids[1]].playIdleAnimation(new Phaser.Math.Vector2(1, 0))

        spells.forEach((spell) => this.map.createSpell(spell, []))

        if (map.key) {
            this.map.createKey(map.key.x, map.key.y, [])
        }

        eventEmitter.on("updatePlayerPosition", this.onPlayerMove)
        eventEmitter.on("castSpell", this.onCastSpell)
        eventEmitter.on("keyPickup", this.map.destroyKey)
        eventEmitter.on("spellPickup", this.map.destroySpell)
        eventEmitter.on("cameraFocusPlayer", this.addCamera)
        eventEmitter.on("cameraZoom", this.zoomCamera)
        eventEmitter.on("dropKey", this.onKeyDrop)
        eventEmitter.on("spawnSpell", this.createSpell)

        this.addCamera()
    }
}
