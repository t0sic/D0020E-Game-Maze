import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })
    }

    preload = () => {
        this.load.image("player", "/assets/test.png")
        this.load.image("background", "/assets/background.png")
    }

    init = () => {
        this.websocketRoom = this.registry.get("websocketRoom")
        this.socketId = this.websocketRoom.namespace.id
    }

    create = () => {
        this.add.image(0, 0, "background").setOrigin(0, 0)

        this.player = new Player(this, 100, 100)
        this.opponent = new Player(this, 0, 0)
        this.addCamera()

        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.updatePlayerPosition)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.on("moveOpponent", this.moveOpponent)

        eventEmitter.emit("sceneCreated")
    }

    setGameData = (gameData) => {
        this.gameData = gameData

        const { players } = this.gameData
        const ids = Object.keys(this.gameData.players)

        this.opponentId = ids[0] === this.socketId ? ids[1] : ids[0]

        this.player.setPosition(
            players[this.socketId].x,
            players[this.socketId].y
        )
        this.opponent.setPosition(
            players[this.opponentId].x,
            players[this.opponentId].y
        )
    }

    moveOpponent = (coords) => {
        this.opponent.setPosition(coords.x, coords.y)
    }

    sendPlayerPosition = () => {
        this.websocketRoom.sendEvent("updatePlayerPosition", {
            x: this.player.x,
            y: this.player.y,
        })
    }

    update = () => {}

    addCamera = () => {
        const camera = this.cameras.main
        camera.startFollow(this.player)
        camera.setZoom(5)
    }

    updatePlayerPosition = (joystick) => {
        if (joystick.forceX || joystick.forceY) {
            const vector = new Phaser.Math.Vector2(
                joystick.forceX,
                joystick.forceY
            )
            this.sendPlayerPosition()
            const dir = vector.normalize()
            this.player.setVelocityX(dir.x * this.player.maxSpeed)
            this.player.setVelocityY(dir.y * this.player.maxSpeed)
        } else {
            this.player.setVelocityX(0)
            this.player.setVelocityY(0)
        }
    }
}

export default GameScene
