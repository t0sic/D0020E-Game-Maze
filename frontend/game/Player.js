import Phaser from "phaser"
import Projectile from "./Projectile.js"
import eventEmitter from "../eventEmitter.js"
import config from "../../config.json"

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY, isClient, spritesheet) {
        super(scene, spawnX, spawnY, spritesheet)

        const { player, spells } = config

        this.socket = this.scene.registry.get("socket")
        this.spritesheet = spritesheet
        this.opponent = null
        this.maxSpeed = player["speed"]
        this.dir = new Phaser.Math.Vector2(1, 0)
        this.isAttacking = false
        this.hasKey = false
        this.isClient = isClient
        this.spells = []
        this.isHasted = false
        this.hasteDuration = spells["haste"]["duration"]
        this.isConfused = false
        this.confuseDuration = spells["confuse"]["duration"]
        this.isSlowed = false
        this.slowDuration = spells["slow"]["duration"]
        this.isStunned = false
        this.stunDuration = spells["stun"]["duration"]
        this.score = 0
        this.moving = false

        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.createAnimations()
        this.setPushable(false)
    }

    createAnimations = () => {
        this.anims.create({
            key: "attackhorizontal_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 88,
                end: 93,
            }),
            frameRate: 8,
            repeat: 0,
        })
        this.anims.create({
            key: "attackup_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 96,
                end: 101,
            }),
            frameRate: 8,
            repeat: 0,
        })
        this.anims.create({
            key: "attackdown_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 104,
                end: 109,
            }),
            frameRate: 8,
            repeat: 0,
        })
        this.anims.create({
            key: "idleup_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 112,
                end: 115,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "idledown_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 120,
                end: 123,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "idlehorizontal_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 64,
                end: 67,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "down_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 48,
                end: 51,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "downright_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 56,
                end: 59,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "downleft_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 40,
                end: 43,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "left_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 32,
                end: 39,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "right_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 0,
                end: 7,
            }),
            frameRate: 8,
            repeat: -1,
        })

        this.anims.create({
            key: "up_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 16,
                end: 19,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "upright_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 8,
                end: 11,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "upleft_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 24,
                end: 27,
            }),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: "stun_animation",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 80,
                end: 86,
            }),
            frameRate: 8,
            repeat: 0,
        })
        this.anims.create({
            key: "stun_animation_reverse",
            frames: this.anims.generateFrameNumbers(this.spritesheet, {
                start: 86,
                end: 80,
            }),
            frameRate: 8,
            repeat: 0,
        })
    }

    applyHasteEffect = () => {
        const { spells } = config

        if (!this.isHasted) {
            this.emitUIEffect("haste")

            this.isHasted = true
            this.maxSpeed = spells["haste"]["speed"]
            setTimeout(() => {
                this.removeHasteEffects()
            }, this.hasteDuration)
        }
    }

    removeHasteEffects = () => {
        const { player } = config

        this.maxSpeed = player["speed"]
        this.isHasted = false
    }

    applyConfusionEffect = () => {
        this.isConfused = true
        this.emitUIEffect("confuse")

        setTimeout(() => {
            this.removeConfusionEffect()
        }, this.confuseDuration)
    }

    removeConfusionEffect = () => {
        this.isConfused = false
    }

    applySlowEffect = () => {
        const { spells } = config

        if (!this.isSlowed) {
            this.emitUIEffect("slow")
            this.isSlowed = true
            this.maxSpeed = spells["slow"]["speed"]

            setTimeout(() => {
                this.removeSlowEffect()
            }, this.slowDuration)
        }
    }

    removeSlowEffect = () => {
        const { player } = config

        this.maxSpeed = player["speed"]
        this.isSlowed = false
    }

    applyStunEffect = () => {
        if (this.isStunned) return

        this.isStunned = true

        this.play("stun_animation", true)
        this.on("animationcomplete", () => {
            this.play("stun_animation_reverse", true)
            this.on("animationcomplete", () => {
                this.play("idlehorizontal_animation", true)
            })
        })

        setTimeout(() => {
            this.removeStunEffect()
        }, this.stunDuration)

        if (!this.isClient) return

        this.emitUIEffect("stun")
        this.maxSpeed = 0

        this.scene.map.dropKey(this.x, this.y)
    }

    removeStunEffect = () => {
        this.maxSpeed = 100
        this.isStunned = false
        this.playIdleAnimation(this.dir)
    }

    onSpellButtonClicked = (spellType) => {
        console.log("spellbutton clicked in player.js", spellType)
        if (this.isStunned) return

        this.socket.emit("castSpell", {
            spellType,
            direction: this.dir,
        })
        this.castSpell({ spellType, direction: this.dir })
    }

    castSpell = (spell) => {
        console.log("casting spell")
        this.spells = this.spells.filter(
            (spellType) => spellType !== spell.spellType
        )
        if (spell.spellType === "haste") {
            this.applyHasteEffect()
        } else {
            console.log("spawning projectile,", spell)
            this.spawnProjectile(spell)
        }
    }

    handleSpellCollision = (player, spell) => {
        if (this.spells.includes(spell.spellType)) return

        this.scene.spells = this.scene.spells.filter((s) => s !== spell)
        this.spells.push(spell.spellType)

        eventEmitter.emit("onSpellData", this.spells)

        this.updateScore(10)

        spell.destroy()
        this.emitRemoveSpell(spell)
    }

    updateScore = (score) => {
        this.score += score
        eventEmitter.emit("updateScoreText", this.score)
    }

    emitRemoveSpell = (spell) => {
        this.socket.emit("spellPickup", {
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

    emitUIEffect = (effect) => {
        if (this.isClient) {
            eventEmitter.emit("onAddEffect", effect)
            setTimeout(() => {
                eventEmitter.emit("onRemoveEffect", effect)
            }, this[effect + "Duration"])
        }
    }

    handleProjectileCollision = (projectile, player) => {
        if (player === this.scene.opponent) {
            this.socket.emit("applySpellEffect", projectile.spellType)
            console.log("hitting player", player, this.scene.opponent)
            this.updateScore(50)
        }
        this.createProjectileCollision(projectile)

        this.applySpellEffect(projectile.spellType, player)
    }

    applySpellEffect = (spellType, player) => {
        switch (spellType) {
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
        this.socket.emit("updatePlayerPosition", {
            x: this.x,
            y: this.y,
            direction: this.dir,
            velocity: this.body.velocity,
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
        if (this.isAttacking || this.isStunned) return

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

    updatePlayerPosition = ({ coords }) => {
        const { x, y, direction, velocity } = coords
        const { rules } = config

        const resultantVector = new Phaser.Math.Vector2(
            direction.x,
            direction.y
        )

        // Play idle if no velocity
        if (velocity.x === 0 && velocity.y === 0) {
            this.playIdleAnimation(resultantVector)
        } else {
            this.playAnimation(resultantVector)
        }

        if (this.hasKey && rules["track_opponent"]) {
            eventEmitter.emit("onIndicatorData", this.opponent, this)
        }

        this.setPosition(x, y)
    }

    playIdleAnimation = (vector) => {
        if (this.isAttacking || this.isStunned) return

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
        const { rules } = config

        let coords

        if (!this.opponent.hasKey && !this.hasKey && rules["track_key"]) {
            coords = this.scene.key
        } else if (this.hasKey && rules["track_exit"]) {
            coords = this.scene.map.getDoorCoords()
        } else if (this.opponent.hasKey && rules["track_opponent"]) {
            coords = this.opponent
        }

        if (coords) {
            eventEmitter.emit("onIndicatorData", this, coords)
        }

        if (joystick.forceX || joystick.forceY) {
            this.moving = true

            const vector = new Phaser.Math.Vector2(
                joystick.forceX,
                joystick.forceY
            )
            this.dir = vector.normalize()
            this.isConfused ? (this.dir = this.dir.negate()) : this.dir

            this.setVelocityX(this.dir.x * this.maxSpeed)
            this.setVelocityY(this.dir.y * this.maxSpeed)

            this.sendPlayerPosition()

            this.playAnimation(this.dir)
        } else {
            this.setVelocityX(0)
            this.setVelocityY(0)

            const defaultVector = new Phaser.Math.Vector2(1, 0)

            this.dir = this.dir || defaultVector

            if (this.moving) {
                this.sendPlayerPosition()
                this.moving = false
            }

            this.playIdleAnimation(this.dir)
        }
    }
}

export default Player
