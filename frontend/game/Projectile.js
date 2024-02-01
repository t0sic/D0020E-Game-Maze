import Phaser from "phaser"

class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY, spellType, texture) {
        super(scene, spawnX, spawnY, texture)
        this.spellType = spellType
        this.maxSpeed = 100

        scene.add.existing(this)
        scene.physics.add.existing(this)
    }
}

export default Projectile
