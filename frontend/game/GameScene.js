import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"
import Map from "./Map.js"

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

        this.load.image("tiles", "/assets/dungeon_tiles.png")
        this.load.tilemapTiledJSON("dungeon_tiles", "/assets/sprint3.json")
    }

    init = () => {
        this.websocketRoom = this.registry.get("websocketRoom")
        this.socketId = this.websocketRoom.namespace.id
        this.projectiles = this.add.group()
        this.spells = []
    }

    create = () => {
        this.map = new Map(this)

        this.player = new Player(this, 150, 150)
        this.opponent = new Player(this, 0, 0)

        this.map.addCollisions()
        this.createProjectileAnimations()
        this.input.keyboard.on("keydown-F", this.player.applyHasteEffect)
        this.input.keyboard.on("keydown-T", this.player.applyConfusionEffect)
        this.input.keyboard.on("keydown-S", this.player.applySlowEffect)
        this.input.keyboard.on("keydown-P", this.player.applyStunEffect)

        this.addCamera()

        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.player.updatePosition)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.on("moveOpponent", this.moveOpponent)
        eventEmitter.on("keyPickup", this.map.destroyKey)
        eventEmitter.on("spellPickup", this.map.destroySpell)
        eventEmitter.on(
            "onSpellButtonClicked",
            this.player.onSpellButtonClicked,
        )
        eventEmitter.on("castSpell", this.opponent.castSpell)
        eventEmitter.on("playerWon", this.onPlayerWon)

        eventEmitter.emit("sceneCreated")
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

    setGameData = (gameData) => {
        this.gameData = gameData

        const { players, map, spells } = this.gameData
        const ids = Object.keys(players)

        this.opponentId = ids[0] === this.socketId ? ids[1] : ids[0]

        this.player.setPosition(
            players[this.socketId].x,
            players[this.socketId].y,
        )
        this.opponent.setPosition(
            players[this.opponentId].x,
            players[this.opponentId].y,
        )

        spells.forEach(this.map.createSpell)

        this.map.createKey(map.key.x, map.key.y)
    }

    moveOpponent = (coords) => {
        const dx = coords.x - this.opponent.x
        const dy = coords.y - this.opponent.y
        const resultantVector = new Phaser.Math.Vector2(dx, dy)

        const frameIndex = this.opponent.calculateFrameIndex(resultantVector)

        if (this.activeFrameIndex !== frameIndex) {
            this.activeFrameIndex = frameIndex

            const animations = {
                0: "down",
                4: "left",
                8: "right",
                12: "up",
            }

            const animationKey = animations[frameIndex]
            this.opponent.play(`${animationKey}_animation`, true)
        }

        this.opponent.setPosition(coords.x, coords.y)
        setTimeout(() => {
            if (coords.x === this.opponent.x && coords.y === this.opponent.y) {
                this.opponent.anims.stop()
            }
        }, 100)
    }

    addCamera = () => {
        const camera = this.cameras.main
        camera.startFollow(this.player)
        camera.setZoom(5)
    }

    handleDoorCollision = (player, tile) => {
        if (this.player.hasKey) {
            this.websocketRoom.sendEvent("playerWon")
            this.onPlayerWon(true)
        }
    }

    onPlayerWon = (isWinner) => {
        this.scene.remove("UIScene")
        this.scene.start("EndScene", { win: isWinner })
    }
}

export default GameScene
