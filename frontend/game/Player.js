import Phaser from "phaser"
import Projectile from "./Projectile.js"

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY) {
        super(scene, spawnX, spawnY, "player")
        this.websocketRoom = this.scene.registry.get("websocketRoom")
        this.maxSpeed = 100
        this.hasKey = false
        this.spells = []
        this.createAnimations

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

    castSpell = (type) => {
        console.log("in castSpell")
        this.spells = this.spells.filter((spell) => spell !== type)
        console.log(this)
        this.spawnProjectile(this)
    }

    spawnProjectile = (player) => {
        const projectile = new Projectile(
            this.scene,
            player.x,
            player.y,
            this.scene.dir
        )
        this.scene.projectiles.add(projectile)

        projectile.setVelocityX(this.scene.dir.x * projectile.maxSpeed)
        projectile.setVelocityY(this.scene.dir.y * projectile.maxSpeed)

        projectile.setRotation(this.playerAngle)
        projectile.anims.play("flameAnimation", true)

        this.scene.physics.add.collider(
            projectile,
            this.scene.wallLayer,
            () => {
                projectile.destroy()
            }
        )

        this.scene.physics.add.collider(projectile, this.scene.opponent, () => {
            projectile.destroy()
            console.log("Projectile hit opponent")
        })
    }
}

export default Player
