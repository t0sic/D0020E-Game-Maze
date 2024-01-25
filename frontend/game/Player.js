import Phaser from "phaser"

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY) {
        super(scene, spawnX, spawnY, "player")

        this.maxSpeed = 100
        this.hasKey = false
        this.spells = []
        this.isHasted = false
        this.hasteDuration = 5000
        this.isConfused = false
        this.confusionDuration = 5000
        this.isSlowed = false
        this.slowDuration = 5000
        this.isStunned = false
        this.stunDuration = 5000

        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.cursors = scene.input.keyboard.createCursorKeys()
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
    update = (delta) => {}

    applyHasteEffect = () => {
        if (!this.isHasted) {
            this.isHasted = true
            this.maxSpeed *= 2
            console.log("Player speed has been multiplied")
            setTimeout(() => {
                this.removeHasteEffects()
            }, this.hasteDuration)
        }
    }

    removeHasteEffects = () => {
        this.maxSpeed = 100
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
        if (!this.isSlowed) {
            this.isSlowed = true
            this.maxSpeed = 50
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
}

export default Player
