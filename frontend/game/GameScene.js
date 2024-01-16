import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })
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
        this.addCameraZoom()
        this.createJoystick()
        this.createDebugInfo()
    }

    update = () => {
        this.updatePlayerPosition()
    }

    createJoystick = () => {
        const x = 1920 - 100 * 2 - 30
        const y = 1080 - 100 * 2 - 30

        this.joystick = new VirtualJoystick(this, {
            x,
            y,
            radius: 100,
            base: this.add.circle(x, y, 100, 0x888888),
            thumb: this.add.circle(x, y, 50, 0xcccccc),
        })
        this.joystick.setScrollFactor(0)
    }

    resize = () => {
        const camera = this.cameras.main

        console.log(camera.worldView.x, camera.worldView.y)
    }

    addCameraZoom = () => {
        const camera = this.cameras.main
        camera.startFollow(this.player)
        // camera.setZoom(2)
    }

    createDebugInfo = () => {
        this.debugText = this.add.text(700, 400, "test", {
            font: "16px Arial",
            fill: "#ffffff",
        })
        this.debugText.setScrollFactor(0)
    }

    updatePlayerPosition = () => {
        if (this.joystick.forceX || this.joystick.forceY) {
            const vector = new Phaser.Math.Vector2(
                this.joystick.forceX,
                this.joystick.forceY
            )
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
