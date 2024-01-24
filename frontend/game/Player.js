import Phaser from "phaser"

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY) {
        super(scene, spawnX, spawnY, "player")

        this.maxSpeed = 100
        this.hasKey = false
        this.spells = []
        this.isHaste = false
        this.hasteDuration = 5000
        this.createAnimations

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
    update = (delta) => {
        if (this.cursors.right.isDown && !this.isHaste) {
            this.applyHateEffect()
        }
        if (this.isHaste) {
            this.hasteDuration -= delta
            if (this.hasteDuration <= 0) {
                this.removeHasteEffects()
            }
        }
    }

    applyHateEffect = () => {
        this.isHaste = true
        this.maxSpeed *= 2
        console.log("Player speed has been multiplied")
        setTimeout(() => {
            this.removeHasteEffects()
        }, this.hasteDuration)
    }

    removeHasteEffects = () => {
        this.maxSpeed /= 2
        this.isHaste = false
        this.hasteDuration = 5000
    }
}

export default Player
