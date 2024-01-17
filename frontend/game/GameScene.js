import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })

        eventEmitter.on("emitWebsocketRoom", (data) => {
            this.websocketRoom = data
            this.socketId = this.websocketRoom.namespace.id
        })
        eventEmitter.emit("sceneCreated")

        eventEmitter.on("emitMapObject", (data) => {
            this.mapObject = data
            console.log(this.mapObject.players[this.socketId])
            const ids = Object.keys(this.mapObject.players)
            this.opponentId = ids[0] === this.socketId ? ids[1] : ids[0]
            this.player.setPosition(
                this.mapObject.players[this.socketId].x,
                this.mapObject.players[this.socketId].y
            )

            this.opponent.setPosition(
                this.mapObject.players[this.opponentId].x,
                this.mapObject.players[this.opponentId].y
            )
        })

        eventEmitter.on("moveOpponent", (data) => {
            this.opponent.setPosition(data.x, data.y)
        })
    }

    preload = () => {
        this.load.image("player", "/assets/test.png")
        this.load.image("background", "/assets/background.png")
    }

    init = () => {
        console.log("GameScene init")
    }

    create = () => {
        this.add.image(0, 0, "background").setOrigin(0, 0)

        this.player = new Player(this, 100, 100)
        this.opponent = new Player(this, 0, 0)
        this.addCamera()
        this.createDebugInfo()

        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.updatePlayerPosition)

        eventEmitter.emit("sceneCreated")
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
        camera.setZoom(2)
    }

    createDebugInfo = () => {
        this.debugText = this.add.text(700, 400, "test", {
            font: "16px Arial",
            fill: "#ffffff",
        })
        this.debugText.setScrollFactor(0)
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
            this.debugText.setText(`
                x: ${this.player.x},
                y: ${this.player.y},
                velocity: ${this.player.body.velocity.x} : ${this.player.body.velocity.y}
            `)
        } else {
            this.player.setVelocityX(0)
            this.player.setVelocityY(0)
        }
    }
}

export default GameScene
