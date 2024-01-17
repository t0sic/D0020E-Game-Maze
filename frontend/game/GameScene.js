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
        this.load.image("tiles", "/assets/dungeon_tiles.png")
        this.load.tilemapTiledJSON("dungeon_tiles", "/assets/Tilemap4.json")
    }

    init = () => {
        this.websocketRoom = this.registry.get("websocketRoom")
        this.socketId = this.websocketRoom.namespace.id
    }

    createTilemap = () => {
        console.log("GameScene create")
        const map = this.make.tilemap({ key: "dungeon_tiles" })
        const tileset = map.addTilesetImage("dungeon_tiles", "tiles")
        const groundLayer = map.createLayer("Ground", tileset)
        const wallLayer = map.createLayer("Walls", tileset)
        const doorLayer = map.createLayer("Door", tileset)

        wallLayer.setCollisionByProperty({ Collision: true })
        doorLayer.setCollisionByProperty({ Collision: true })

        this.wallLayer = wallLayer
        this.doorLayer = doorLayer

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
        this.opponent = new Player(this, 0, 0)

        this.addCollisions()

        this.addCamera()

        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.updatePlayerPosition)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.on("moveOpponent", this.moveOpponent)

        eventEmitter.emit("sceneCreated")
    }

    addCollisions = () => {
        this.physics.add.collider(
            this.player,
            this.doorLayer,
            this.handleDoorCollision,
            null,
            this
        )
        this.physics.add.collider(this.player, this.wallLayer)
    }

    update = () => {}

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

    handleDoorCollision = (player, tile) => {
        console.log(
            "Player has collided with a door tile at position:",
            tile.x,
            tile.y
        )
        // Additional logic for door collision can be added here
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
