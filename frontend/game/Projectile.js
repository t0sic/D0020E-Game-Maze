import Phaser from "phaser"

class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY, direction) {
        super(scene, spawnX, spawnY, "flame")

        this.maxSpeed = 100

        scene.add.existing(this)
        scene.physics.add.existing(this)
    }
}

export default Projectile
