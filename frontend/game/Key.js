import Phaser from "phaser"

class Key extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY) {
        super(scene, spawnX, spawnY, "key")

        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.setScale(0.61)
    }
}

export default Key
