import eventEmitter from "../eventEmitter.js"
import EndScene from "./EndScene.js"
import Player from "./Player.js"
import Spell from "./Spell.js"
import Phaser from "phaser"
import Key from "./Key.js"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })
    }

    preload = () => {
        this.load.image("air", "/assets/air.png")
        this.load.image("water", "/assets/water.png")
        this.load.image("earth", "/assets/earth.png")
        this.load.image("fire", "/assets/fire.png")
        this.load.spritesheet("flame", "/assets/flame_horizontal.png", {
            frameWidth: 12,
            frameHeight: 12,
        })

        this.load.image("key", "/assets/key.png")
        this.load.spritesheet("player", "/assets/spritesheet1.png", {
            frameWidth: 16,
            frameHeight: 16,
        })

        this.load.image("background", "/assets/background.png")
        this.load.image("tiles", "/assets/dungeon_tiles.png")
        this.load.tilemapTiledJSON("dungeon_tiles", "/assets/Tilemap4.json")

        this.load.image("background3", "/assets/background3.png")
    }

    init = () => {
        this.websocketRoom = this.registry.get("websocketRoom")
        this.socketId = this.websocketRoom.namespace.id
        this.projectiles = this.add.group()
    }

    create = () => {
        this.createTilemap()
        this.player = new Player(this, 150, 150)
        this.opponent = new Player(this, 0, 0)

        this.spells = []

        this.addCollisions()
        this.createProjectileAnimations()

        this.addCamera()

        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.player.updatePosition)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.on("moveOpponent", this.moveOpponent)
        eventEmitter.on("keyPickup", this.destroyKey)
        eventEmitter.on("spellPickup", this.destroySpell)
        eventEmitter.on(
            "onSpellButtonClicked",
            this.player.onSpellButtonClicked
        )
        eventEmitter.on("castSpell", this.opponent.castSpell)

        eventEmitter.emit("sceneCreated")
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
    }

    createSpell = (x, y, type) => {
        const spell = new Spell(this, x, y, type)
        this.spells.push(spell)
        this.physics.add.overlap(
            this.player,
            spell,
            this.player.handleSpellCollision,
            null,
            this
        )
    }

    destroySpell = (spell) => {
        this.spells = this.spells.filter((s) => {
            if (s.x === spell.x && s.y === spell.y) {
                s.destroy()
                return false
            }
            return true
        })
    }

    createKey = (x, y) => {
        this.key = new Key(this, x, y)

        this.physics.add.overlap(
            this.player,
            this.key,
            this.handleKeyCollision,
            null,
            this
        )
    }

    destroyKey = () => this.key.destroy()

    emitRemoveKey = () => {
        this.websocketRoom.sendEvent("keyPickup")
    }

    handleKeyCollision = (player, key) => {
        this.player.hasKey = true

        eventEmitter.emit("onKeyData", this.player.hasKey)

        this.emitRemoveKey()
        this.destroyKey()
    }

    setRotation(angle) {
        if (this.flameSprite) {
            this.flameSprite.rotation = angle
        }
    }

    createProjectileAnimations = () => {
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

        const { players, map, spells } = this.gameData
        const ids = Object.keys(players)

        this.opponentId = ids[0] === this.socketId ? ids[1] : ids[0]

        this.player.setPosition(
            players[this.socketId].x,
            players[this.socketId].y
        )
        this.opponent.setPosition(
            players[this.opponentId].x,
            players[this.opponentId].y
        )

        spells.forEach((spell) =>
            this.createSpell(spell.x, spell.y, spell.spellType)
        )

        this.createKey(map.key.x, map.key.y)
    }

    moveOpponent = (coords) => {
        this.opponent.setPosition(coords.x, coords.y)
    }

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
        if ((this.player.hasKey = true)) {
            console.log("Player has key")
            this.scene.remove("UIScene")
            this.scene.start("EndScene", { win: true })
        }
    }
}

export default GameScene
