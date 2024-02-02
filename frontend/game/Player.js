import Phaser from "phaser"
import Projectile from "./Projectile.js"
import eventEmitter from "../eventEmitter.js"
import config from "../../config.json"

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY) {
        super(scene, spawnX, spawnY, "player")

        const { player, spells } = config

        this.websocketRoom = this.scene.registry.get("websocketRoom")
        this.opponent
        this.maxSpeed = player["speed"]
        this.hasKey = false
        this.spells = []
        this.isHasted = false
        this.hasteDuration = spells["haste"]["duration"]
        this.isConfused = false
        this.confusionDuration = spells["confuse"]["duration"]
        this.isSlowed = false
        this.slowDuration = spells["slow"]["duration"]
        this.isStunned = false
        this.stunDuration = spells["stun"]["duration"]

        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.createAnimations()
        this.setPushable(false)
    }

    createAnimations = () => {
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

    applyHasteEffect = () => {
        const { spells } = config

        if (!this.isHasted) {
            this.isHasted = true
            this.maxSpeed = spells["haste"]["speed"]
            console.log("Player speed has been multiplied")
            setTimeout(() => {
                this.removeHasteEffects()
            }, this.hasteDuration)
        }
    }

    removeHasteEffects = () => {
        const { player } = config

        this.maxSpeed = player["speed"]
        this.isHasted = false
        console.log("Speed effect removed!")
    }

    applyConfusionEffect = () => {
        this.isConfused = true
        console.log("Player controls are confused!")

        setTimeout(() => {
            this.removeConfusionEffect()
        }, this.confusionDuration)
    }

    removeConfusionEffect = () => {
        this.isConfused = false
        console.log("Confusion effect removed!")
    }

    applySlowEffect = () => {
        const { spells } = config

        if (!this.isSlowed) {
            this.isSlowed = true
            this.maxSpeed = spells["slow"]["speed"]
            console.log("Player is slowed!")

            setTimeout(() => {
                this.removeSlowEffect()
            }, this.slowDuration)
        }
    }

    removeSlowEffect = () => {
        this.maxSpeed = 100
        this.isSlowed = false
        console.log("Slow effect removed!")
    }

    applyStunEffect = () => {
        if (!this.isStunned) {
            this.isSlowed = true
            this.maxSpeed = 0
            console.log("Player is immovable!")

            setTimeout(() => {
                this.removeStunEffect()
            }, this.stunDuration)
        }
    }
    removeStunEffect = () => {
        this.maxSpeed = 100
        this.isSlowed = false
        console.log("Stun effect removed!")
    }

    onSpellButtonClicked = (spellType) => {
        this.websocketRoom.sendEvent("castSpell", {
            spellType,
            direction: this.dir,
        })
        this.castSpell({ spellType, direction: this.dir })
    }

    castSpell = (spell) => {
        this.spells = this.spells.filter(
            (spellType) => spellType !== spell.spellType
        )
        if (spell.spellType === "haste") {
            this.applyHasteEffect()
        } else {
            this.spawnProjectile(spell)
        }
    }

    handleSpellCollision = (player, spell) => {
        if (this.spells.includes(spell.spellType)) return

        this.scene.spells = this.scene.spells.filter((s) => s !== spell)
        this.spells.push(spell.spellType)

        eventEmitter.emit("onSpellData", this.spells)

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

    spawnProjectile = (spell) => {
        const { direction, spellType } = spell

        console.log("projectile", spell)

        let texture = spellType + "_projectile"
        const projectile = new Projectile(
            this.scene,
            this.x,
            this.y,
            spell.spellType,
            texture
        )
        this.scene.projectiles.add(projectile)

        projectile.setVelocityX(direction.x * projectile.maxSpeed)
        projectile.setVelocityY(direction.y * projectile.maxSpeed)

        const angle = Math.atan2(direction.y, direction.x)

        projectile.setRotation(angle)

        projectile.anims.play(spellType + "Animation", true)

        this.scene.physics.add.collider(
            projectile,
            this.scene.wallLayer,
            () => {
                projectile.destroy()
            }
        )

        const vemVareSomCasta = this.opponent === this

        this.scene.physics.add.collider(
            projectile,
            vemVareSomCasta ? this.scene.player : this.opponent,
            this.handleProjectileCollision
        )
    }

    handleProjectileCollision = (projectile, player) => {
        projectile.destroy()
        switch (projectile.spellType) {
            case "stun":
                player.applyStunEffect()
                break
            case "slow":
                player.applySlowEffect()
                break
            case "confuse":
                player.applyConfusionEffect()
                break
        }
    }

    sendPlayerPosition = () => {
        this.websocketRoom.sendEvent("updatePlayerPosition", {
            x: this.x,
            y: this.y,
        })
    }

    calculateFrameIndex = (vector) => {
        if (Math.abs(vector.x) > Math.abs(vector.y)) {
            if (vector.x > 0) {
                return 8
            }
            return 4
        }
        if (vector.y > 0) {
            return 0
        }
        return 12
    }

    playAnimation = (vector) => {
        const frameIndex = this.calculateFrameIndex(vector)

        if (this.activeFrameIndex !== frameIndex) {
            this.activeFrameIndex = frameIndex

            const animations = {
                0: "down",
                4: "left",
                8: "right",
                12: "up",
            }

            const animationKey = animations[frameIndex]
            this.play(`${animationKey}_animation`, true)
        }
    }

    updatePlayerPosition = (coords) => {
        const dx = coords.x - this.x
        const dy = coords.y - this.y
        const resultantVector = new Phaser.Math.Vector2(dx, dy)

        this.playAnimation(resultantVector)

        this.setPosition(coords.x, coords.y)
        setTimeout(() => {
            if (coords.x === this.x && coords.y === this.y) {
                this.activeFrameIndex = undefined
                this.anims.restart()
                this.anims.pause()
            }
        }, 100)
    }

    joystickMove = (joystick) => {
        if (joystick.forceX || joystick.forceY) {
            const vector = new Phaser.Math.Vector2(
                joystick.forceX,
                joystick.forceY
            )
            this.sendPlayerPosition()
            this.dir = vector.normalize()
            this.isConfused ? (this.dir = this.dir.negate()) : this.dir

            this.setVelocityX(this.dir.x * this.maxSpeed)
            this.setVelocityY(this.dir.y * this.maxSpeed)

            if (!this.isStunned) this.playAnimation(this.dir)
        } else {
            this.setVelocityX(0)
            this.setVelocityY(0)

            this.anims.restart()
        }
    }
}

export default Player
