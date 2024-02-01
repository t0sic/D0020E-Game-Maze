import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"
import Map from "./Map.js"
import { preload } from "./shared.js"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })
    }

    preload = () => {
        preload(this)
    }

    init = () => {
        this.websocketRoom = this.registry.get("websocketRoom")
        this.socketId = this.websocketRoom.namespace.id
        this.projectiles = this.add.group()
        this.spells = []
    }

    create = () => {
        this.map = new Map(this)
        this.createProjectileAnimations()
        this.scene.launch("UIScene")

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.emit("sceneCreated")
    }

    createProjectileAnimations = () => {
        this.anims.create({
            key: "stunAnimation",
            frames: this.anims.generateFrameNumbers("stun_projectile", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        })
        this.anims.create({
            key: "slowAnimation",
            frames: this.anims.generateFrameNumbers("slow_projectile", {
                start: 0,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        })
        this.anims.create({
            key: "confuseAnimation",
            frames: this.anims.generateFrameNumbers("confuse_projectile", {
                start: 17,
                end: 20,
            }),
            frameRate: 10,
            repeat: -1,
        })
    }

    setGameData = (gameData) => {
        this.gameData = gameData

        const { players, map, spells } = this.gameData
        const ids = Object.keys(players)

        this.opponentId = ids[0] === this.socketId ? ids[1] : ids[0]

        this.map.createMap(map.asset)

        this.player = new Player(
            this,
            players[this.socketId].x,
            players[this.socketId].y
        )
        this.opponent = new Player(
            this,
            players[this.opponentId].x,
            players[this.opponentId].y
        )

        this.map.addCollisions([this.player])

        eventEmitter.on("moveOpponent", this.opponent.updatePlayerPosition)
        eventEmitter.on("keyPickup", this.map.destroyKey)
        eventEmitter.on("spellPickup", this.map.destroySpell)
        eventEmitter.on(
            "onSpellButtonClicked",
            this.player.onSpellButtonClicked
        )
        eventEmitter.on("castSpell", this.opponent.castSpell)
        eventEmitter.on("playerWon", this.onPlayerWon)

        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.player.joystickMove)

        this.addCamera()

        spells.forEach((spell) => this.map.createSpell(spell, [this.player]))

        this.map.createKey(map.key.x, map.key.y, [this.player])
    }

    addCamera = () => {
        const camera = this.cameras.main
        camera.startFollow(this.player)
        camera.setZoom(5)
    }

    handleDoorCollision = (player, tile) => {
        if (this.player.hasKey) {
            this.websocketRoom.sendEvent("playerWon")
            this.onPlayerWon(true)
        }
    }

    onPlayerWon = (isWinner) => {
        this.scene.remove("UIScene")
        this.scene.start("EndScene", { win: isWinner })
    }
}

export default GameScene
