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

        this.joystick = new VirtualJoystick(this, {
            x: 900,
            y: 400,
            radius: 100,
            base: this.add.circle(0, 0, 100, 0x888888),
            thumb: this.add.circle(0, 0, 50, 0xcccccc),
        })
        this.joystick.setScrollFactor(0)

        const camera = this.cameras.main
        camera.startFollow(this.player)
        camera.setZoom(2)
    }

    update = (time, delta) => {
        if (this.joystick.forceX || this.joystick.forceY) {
            const vector = new Phaser.Math.Vector2(
                this.joystick.forceX,
                this.joystick.forceY
            )
            const dir = vector.normalize()

            console.log(this.player.body.velocity)

            this.player.setVelocity(
                dir.x * this.player.maxSpeed * (16 / delta),
                dir.y * this.player.maxSpeed * (16 / delta)
            )
        } else {
            this.player.setVelocityX(0)
            this.player.setVelocityY(0)
        }
    }
}

export default GameScene
