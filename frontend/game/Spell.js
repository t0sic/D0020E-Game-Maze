import Phaser from "phaser"

class Spell extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnX, spawnY, type, texture) {
        super(scene, spawnX, spawnY, texture)

        this.spellType = type

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setImmovable(true)
        this.setPushable(false)
    }
}

export default Spell
