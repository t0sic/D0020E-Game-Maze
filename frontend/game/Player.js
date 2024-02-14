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
        this.isAttacking = false
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
            key: "attackhorizontal_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 88,
                end: 93,
            }),
            frameRate: 8,
            repeat: 0,
        })
        this.anims.create({
            key: "attackup_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 96,
                end: 101,
            }),
            frameRate: 8,
            repeat: 0,
        })
        this.anims.create({
            key: "attackdown_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 104,
                end: 109,
            }),
            frameRate: 8,
            repeat: 0,
        })
        this.anims.create({
            key: "idleup_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 112,
                end: 115,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "idledown_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 120,
                end: 123,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "idlehorizontal_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 64,
                end: 67,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "down_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 48,
                end: 51,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "downright_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 56,
                end: 59,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "downleft_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 40,
                end: 43,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "left_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 32,
                end: 39,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "right_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 7,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "up_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 16,
                end: 19,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "upright_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 8,
                end: 11,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "upleft_animation",
            frames: this.anims.generateFrameNumbers("player", {
                start: 24,
                end: 27,
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

    playAttackAnimation = (direction) => {
        this.isAttacking = true
        const frameIndex = this.calculateFrameIndex(direction)

        if (frameIndex === 4) {
            this.anims.play("attackhorizontal_animation", true)
            this.setFlipX(true)
        } else if (frameIndex === 0) {
            this.anims.play("attackhorizontal_animation", true)
            this.setFlipX(false)
        } else if ([1, 2, 3].includes(frameIndex)) {
            this.anims.play("attackdown_animation", true)
        } else if ([5, 6, 7].includes(frameIndex)) {
            this.anims.play("attackup_animation", true)
        }

        this.on("animationcomplete", () => {
            this.isAttacking = false
            this.setFlipX(false)
            this.playIdleAnimation(new Phaser.Math.Vector2(1, 0))
        })
    }

    spawnProjectile = (spell) => {
        const { direction, spellType } = spell

        this.playAttackAnimation(direction)

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
                this.createProjectileCollision(projectile)
            }
        )

        const vemVareSomCasta = this.opponent === this

        this.scene.physics.add.collider(
            projectile,
            vemVareSomCasta ? this.scene.player : this.opponent,
            this.handleProjectileCollision
        )
    }

    createProjectileCollision = (projectile) => {
        projectile.body.enable = false
        projectile.anims.play(projectile.spellType + "_collision", true)
        projectile.on("animationcomplete", () => {
            projectile.destroy()
        })
    }
    handleProjectileCollision = (projectile, player) => {
        this.createProjectileCollision(projectile)
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
        const angle = Math.atan2(vector.y, vector.x)

        // Convert radians to degrees
        const degree = angle * (180 / Math.PI)

        // Normalize degree to be between 0 and 360
        const normalizedDegree = (degree + 360) % 360

        if (normalizedDegree >= 22.5 && normalizedDegree < 67.5) {
            return 1 // Up-Right
        } else if (normalizedDegree >= 67.5 && normalizedDegree < 112.5) {
            return 2 // Up
        } else if (normalizedDegree >= 112.5 && normalizedDegree < 157.5) {
            return 3 // Up-Left
        } else if (normalizedDegree >= 157.5 && normalizedDegree < 202.5) {
            return 4 // Left
        } else if (normalizedDegree >= 202.5 && normalizedDegree < 247.5) {
            return 5 // Down-Left
        } else if (normalizedDegree >= 247.5 && normalizedDegree < 292.5) {
            return 6 // Down
        } else if (normalizedDegree >= 292.5 && normalizedDegree < 337.5) {
            return 7 // Down-Right
        } else {
            return 0 // Right
        }
    }

    playAnimation = (vector) => {
        if (this.isAttacking) return

        this.setFlipX(false)
        const frameIndex = this.calculateFrameIndex(vector)

        const animations = {
            0: "right",
            1: "downright",
            2: "down",
            3: "downleft",
            4: "left",
            5: "upleft",
            6: "up",
            7: "upright",
        }

        const animationKey = animations[frameIndex]
        this.play(`${animationKey}_animation`, true)
    }

    updatePlayerPosition = (coords) => {
        const dx = coords.x - this.x
        const dy = coords.y - this.y
        const resultantVector = new Phaser.Math.Vector2(dx, dy)

        this.playAnimation(resultantVector)

        if (this.hasKey) {
            eventEmitter.emit("onIndicatorData", this.opponent, this)
        }

        this.setPosition(coords.x, coords.y)
        setTimeout(() => {
            if (coords.x === this.x && coords.y === this.y) {
                this.playIdleAnimation(resultantVector)
            }
        }, 100)
    }

    playIdleAnimation = (vector) => {
        if (this.isAttacking) return

        const frameIndex = this.calculateFrameIndex(vector)

        this.setFlipX(false)

        if (frameIndex === 4) {
            this.anims.play("idlehorizontal_animation", true)
            this.setFlipX(true)
        } else if (frameIndex === 0) {
            this.anims.play("idlehorizontal_animation", true)
            this.setFlipX(false)
        } else if ([1, 2, 3].includes(frameIndex)) {
            this.anims.play("idledown_animation", true)
        } else if ([5, 6, 7].includes(frameIndex)) {
            this.anims.play("idleup_animation", true)
        }
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

            let coords

            if (!this.opponent.hasKey && !this.hasKey) {
                coords = this.scene.key
            } else if (this.hasKey) {
                coords = this.scene.map.getDoorCoords()
            } else if (this.opponent.hasKey) {
                coords = this.opponent
            }

            if (coords) {
                eventEmitter.emit("onIndicatorData", this, coords)
            }

            if (!this.isStunned) this.playAnimation(this.dir)
        } else {
            this.setVelocityX(0)
            this.setVelocityY(0)

            this.playIdleAnimation(this.dir || new Phaser.Math.Vector2(1, 0))
        }
    }
}

export default Player
