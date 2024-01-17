import Phaser from "phaser"

class Spell extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY) {
        super(scene, spawnX, spawnY, "spell")

        scene.add.existing(this)
        scene.physics.add.existing(this)
    }
}

export default Spell
