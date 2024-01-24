import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Key from "./Key.js"
import Spell from "./Spell.js"
import Phaser from "phaser"
import Projectile from "./Projectile.js"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })
    }

    preload = () => {
        this.load.spritesheet("flame", "/assets/flame_horizontal.png", {
            frameWidth: 12,
            frameHeight: 12,
        })

        this.load.image("bluespell", "/assets/10.png")
        this.load.image("redspell", "/assets/11.png")

        this.load.image("key", "/assets/02.png")
        this.load.image("player", "/assets/test.png")
        this.load.image("background", "/assets/background.png")
        this.load.image("tiles", "/assets/dungeon_tiles.png")
        this.load.tilemapTiledJSON("dungeon_tiles", "/assets/Tilemap5.json")
    }

    init = () => {
        this.websocketRoom = this.registry.get("websocketRoom")
        this.socketId = this.websocketRoom.namespace.id
        this.projectiles = this.add.group()
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

    removeKeyfrommap = () => {
        this.physics.add.collider(
            this.player,
            this.key,
            this.handleKeyCollision,
            null,
            this
        )
    }

    handleKeyCollision = (player, key) => {
        console.log(
            "Player has collided with a key tile at position:",
            key.x,
            key.y
        )
        key.destroy()
    }

    spawnProjectile = (player) => {
        const projectile = new Projectile(this, player.x, player.y, this.dir)
        this.projectiles.add(projectile)

        projectile.setVelocityX(this.dir.x * projectile.maxSpeed)
        projectile.setVelocityY(this.dir.y * projectile.maxSpeed)

        projectile.setRotation(this.playerAngle)
        projectile.anims.play("flameAnimation", true)

        this.physics.add.collider(projectile, this.wallLayer, () => {
            projectile.destroy()
        })

        this.physics.add.collider(projectile, this.opponent, () => {
            projectile.destroy()
            console.log("Projectile hit opponent")
        })
    }

    handleSpacebarPress = () => {
        this.spawnProjectile(this.player)
    }

    setRotation(angle) {
        if (this.flameSprite) {
            this.flameSprite.rotation = angle
        }
    }

    createAnimations = () => {
        this.anims.create({
            key: "flameAnimation",
            frames: this.anims.generateFrameNumbers("flame", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        })
    }

    create = () => {
        this.add.image(0, 0, "background").setOrigin(0, 0)

        this.createTilemap()
        this.player = new Player(this, 150, 150)
        this.opponent = new Player(this, 0, 0)
        this.opponent.setPushable(false)
        this.player.setPushable(false)
        this.key = new Key(this, 350, 130)

        this.addCollisions()

        this.addCamera()

        this.removeKeyfrommap()

        this.createAnimations()
        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.updatePlayerPosition)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.on("moveOpponent", this.moveOpponent)

        eventEmitter.emit("sceneCreated")

        this.input.keyboard.on("keydown-SPACE", this.handleSpacebarPress)
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
            this.dir = vector.normalize()
            this.playerAngle = Math.atan2(this.dir.y, this.dir.x)

            this.player.setVelocityX(this.dir.x * this.player.maxSpeed)
            this.player.setVelocityY(this.dir.y * this.player.maxSpeed)
        } else {
            this.player.setVelocityX(0)
            this.player.setVelocityY(0)
        }
    }
}

export default GameScene
