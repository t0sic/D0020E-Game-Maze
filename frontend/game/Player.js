import Phaser from "phaser"

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY) {
        super(scene, spawnX, spawnY, "player")

        this.maxSpeed = 100
        this.hasKey = false
        this.spells = []

        scene.add.existing(this)
        scene.physics.add.existing(this)
    }
}

export default Player
