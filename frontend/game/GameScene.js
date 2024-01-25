import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"
import Projectile from "./Projectile.js"
import Spell from "./Spell.js"
import Key from "./Key.js"
//fsldkflksdmfksmdlfmdskmfslkmdflksdmf
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

    createSpell = (x, y, type) => {
        const spell = new Spell(this, x, y, type)
        this.spells.push(spell)
        this.physics.add.overlap(
            this.player,
            spell,
            this.handleSpellCollision,
            null,
            this
        )
    }

    handleSpellCollision = (player, spell) => {
        console.log("Player has collided with a spell", spell.spellType)

        if (this.player.spells.includes(spell.spellType)) return

        this.spells = this.spells.filter((s) => s !== spell)
        this.player.spells.push(spell.spellType)

        eventEmitter.emit("onSpellData", this.player.spells)

        spell.destroy()
        this.emitRemoveSpell(spell)
    }

    emitRemoveSpell = (spell) => {
        this.websocketRoom.sendEvent("spellPickup", {
            x: spell.x,
            y: spell.y,
            spellType: spell.spellType,
        })
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
        this.createTilemap()
        this.player = new Player(this, 150, 150)
        this.opponent = new Player(this, 0, 0)
        this.opponent.setPushable(false)
        this.player.setPushable(false)
        this.spells = []
        this.createPlayerAnimations()
        this.input.keyboard.on("keydown-F", this.player.applyHasteEffect)
        this.input.keyboard.on("keydown-T", this.player.applyConfusionEffect)
        this.input.keyboard.on("keydown-S", this.player.applySlowEffect)
        this.input.keyboard.on("keydown-P", this.player.applyStunEffect)

        this.addCollisions()

        this.addCamera()

        this.createAnimations()
        this.scene.launch("UIScene")
        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.updatePlayerPosition)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.on("moveOpponent", this.moveOpponent)
        eventEmitter.on("keyPickup", this.destroyKey)
        eventEmitter.on("spellPickup", this.destroySpell)
        eventEmitter.on("onSpellButtonClicked", this.castSpell)

        eventEmitter.emit("sceneCreated")

        this.input.keyboard.on("keydown-SPACE", this.handleSpacebarPress)
    }

    castSpell = (type) => {
        this.player.spells = this.player.spells.filter(
            (spell) => spell !== type
        )
    }
    createPlayerAnimations = () => {
        this.anims.create({
            key: "down_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "left_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 4,
                end: 7,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "right_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 8,
                end: 11,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "up_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 12,
                end: 15,
            }),
            frameRate: 8,
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
    }

    updatePlayerPosition = (joystick) => {
        if (joystick.forceX || joystick.forceY) {
            const vector = new Phaser.Math.Vector2(
                joystick.forceX,
                joystick.forceY
            )
            this.sendPlayerPosition()
            this.dir = vector.normalize()
            this.player.isConfused ? (this.dir = this.dir.negate()) : this.dir // If the player is confused, inverts the direction vector
            this.playerAngle = Math.atan2(this.dir.y, this.dir.x)

            this.player.setVelocityX(this.dir.x * this.player.maxSpeed)
            this.player.setVelocityY(this.dir.y * this.player.maxSpeed)

            const angle = Phaser.Math.RadToDeg(vector.angle())
            const frameIndex = this.calculateFrameIndex(angle)

            if (this.player.currentFrameIndex !== frameIndex) {
                this.player.currentFrameIndex = frameIndex

                const animations = {
                    0: "down",
                    4: "left",
                    8: "right",
                    12: "up",
                }

                const animationKey = animations[frameIndex]
                this.player.play(`${animationKey}_animation`, true)
            }
        } else {
            this.player.setVelocityX(0)
            this.player.setVelocityY(0)

            this.player.anims.stop()
        }
    }

    calculateFrameIndex = (angle) => {
        if (angle >= -45 && angle < 45) {
            return 8 //right
        } else if (angle >= 45 && angle < 135) {
            return 0 //down
        } else if (angle >= 135 && angle < 225) {
            return 4 //up
        } else {
            return 12 //left
        }
    }
}

export default GameScene
