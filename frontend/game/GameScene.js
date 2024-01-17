import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })
        console.log("runs")

        eventEmitter.on("startGame", () => {
            console.log("tjo boss")
        })
    }

    init = () => {
        console.log("GameScene init")
    }

    preload = () => {
        this.load.image("tiles", "/assets/dungeon_tiles.png")
        this.load.tilemapTiledJSON("dungeon_tiles", "/assets/Tilemap3.json")
        console.log("GameScene preload")
    }

    create = () => {
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
}

export default GameScene
