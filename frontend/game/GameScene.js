import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })


        eventEmitter.on('emitGameObject', (data) => {
            const game = data
            console.log("recieved " + game)
        })
        eventEmitter.emit("sceneCreated")


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
        this.addCamera()
        this.createDebugInfo()

        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.updatePlayerPosition)
    }

    updateFPS = () => {
        this.fpsText.setText('FPS: ' + Math.floor(this.game.loop.actualFps));
    }


    update = () => {
        this.updateFPS()
    }

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
        this.fpsText = this.add.text(16,16, 'FPS: 0', { 
            font: '40px Arial', 
            fill: '#ffffff',
         })
        //this.fpsText.setScrollFactor(0)
    }

    updatePlayerPosition = (joystick) => {
        if (joystick.forceX || joystick.forceY) {
            const vector = new Phaser.Math.Vector2(
                joystick.forceX,
                joystick.forceY
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
