import Phaser from "phaser"
import Projectile from "./Projectile.js"
import eventEmitter from "../eventEmitter.js"

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY) {
        super(scene, spawnX, spawnY, "player")
        this.websocketRoom = this.scene.registry.get("websocketRoom")
        this.maxSpeed = 100
        this.hasKey = false
        this.spells = []
        this.createAnimations()

        scene.add.existing(this)
        scene.physics.add.existing(this)
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

    onSpellButtonClicked = (spellType) => {
        this.websocketRoom.sendEvent("castSpell", {
            spellType,
            direction: this.dir,
        })
        this.castSpell({ spellType, direction: this.dir })
    }

    castSpell = (projectile) => {
        this.spells = this.spells.filter(
            (spell) => spell !== projectile.spellType
        )
        this.spawnProjectile(projectile.direction)
    }

    handleSpellCollision = (player, spell) => {
        console.log("Player has collided with a spell", spell.spellType)

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

    spawnProjectile = (direction) => {
        const projectile = new Projectile(this.scene, this.x, this.y, direction)
        this.scene.projectiles.add(projectile)

        projectile.setVelocityX(direction.x * projectile.maxSpeed)
        projectile.setVelocityY(direction.y * projectile.maxSpeed)

        projectile.setRotation(this.playerAngle)
        projectile.anims.play("flameAnimation", true)

        this.scene.physics.add.collider(
            projectile,
            this.scene.wallLayer,
            () => {
                projectile.destroy()
            }
        )

        const vemVareSomCasta = this.scene.opponent === this

        this.scene.physics.add.collider(
            projectile,
            vemVareSomCasta ? this.scene.player : this.scene.opponent,
            () => {
                projectile.destroy()
                console.log("Projectile hit opponent")
            }
        )
    }

    sendPlayerPosition = () => {
        this.websocketRoom.sendEvent("updatePlayerPosition", {
            x: this.x,
            y: this.y,
        })
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

    updatePosition = (joystick) => {
        if (joystick.forceX || joystick.forceY) {
            const vector = new Phaser.Math.Vector2(
                joystick.forceX,
                joystick.forceY
            )
            this.sendPlayerPosition()
            this.dir = vector.normalize()
            this.playerAngle = Math.atan2(this.dir.y, this.dir.x)

            this.setVelocityX(this.dir.x * this.maxSpeed)
            this.setVelocityY(this.dir.y * this.maxSpeed)

            const angle = Phaser.Math.RadToDeg(vector.angle())
            const frameIndex = this.calculateFrameIndex(angle)

            if (this.currentFrameIndex !== frameIndex) {
                this.currentFrameIndex = frameIndex

                const animations = {
                    0: "down",
                    4: "left",
                    8: "right",
                    12: "up",
                }

                const animationKey = animations[frameIndex]
                this.play(`${animationKey}_animation`, true)
            }
        } else {
            this.setVelocityX(0)
            this.setVelocityY(0)

            this.anims.stop()
        }
    }
}

export default Player
