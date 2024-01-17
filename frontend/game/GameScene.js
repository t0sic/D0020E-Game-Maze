import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })

        eventEmitter.on("emitGameObject", (data) => {
            const game = data
            console.log("recieved " + game)
        })
        eventEmitter.emit("sceneCreated")
    }

    preload = () => {
        this.load.image("player", "/assets/test.png")
        this.load.image("background", "/assets/background.png")
        this.load.image("tiles", "/assets/dungeon_tiles.png")
        this.load.tilemapTiledJSON("dungeon_tiles", "/assets/Tilemap3.json")
    }

    init = () => {
        console.log("GameScene init")
    }

    createTilemap = () => {
        console.log("GameScene create")
        const map = this.make.tilemap({ key: "dungeon_tiles" })
        const tileset = map.addTilesetImage("dungeon_tiles", "tiles")
        const groundLayer = map.createLayer("Ground", tileset)
        const wallLayer = map.createLayer("Walls", tileset)

        wallLayer.setCollisionByProperty({ Collision: true })
        console.log(
            "Number of tiles with collision property:",
            wallLayer.getTilesWithin(0, 0, wallLayer.width, wallLayer.height, {
                Collision: true,
            }).length
        )
        const debugGraphics = this.add.graphics().setAlpha(0.7)
        wallLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        })
        this.add.existing(debugGraphics)
    }

    create = () => {
        this.add.image(0, 0, "background").setOrigin(0, 0)
        this.createTilemap()
        this.player = new Player(this, 100, 100)
        this.addCamera()
        this.createDebugInfo()

        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.updatePlayerPosition)
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
