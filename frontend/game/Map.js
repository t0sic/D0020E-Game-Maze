import eventEmitter from "../eventEmitter.js"
import Spell from "./Spell.js"
import Key from "./Key.js"

export default class Map {
    constructor(scene) {
        this.scene = scene
    }

    createMap = (mapAsset) => {
        const map = this.scene.make.tilemap({ key: mapAsset })
        const tileset = map.addTilesetImage("dungeon_tiles", "tiles")
        const groundLayer = map.createLayer("Ground", tileset)
        const wallLayer = map.createLayer("Walls", tileset)
        const doorLayer = map.createLayer("Door", tileset)

        const decor = map.addTilesetImage("decorative", "decor")
        const decorLayer = map.createLayer("Decorative", decor)

        wallLayer.setCollisionByProperty({ Collision: true })
        doorLayer.setCollisionByProperty({ Collision: true })

        this.width = map.widthInPixels
        this.height = map.heightInPixels
        this.scene.wallLayer = wallLayer
        this.scene.doorLayer = doorLayer
    }

    createSpell = ({ x, y, spellType }, players) => {
        const spell = new Spell(
            this.scene,
            x,
            y,
            spellType,
            spellType + "_vile"
        )
        this.scene.spells.push(spell)

        players.forEach((player) => {
            this.scene.physics.add.overlap(
                player,
                spell,
                player.handleSpellCollision,
                null,
                this
            )
        })
    }

    destroySpell = (spell) => {
        this.scene.spells = this.scene.spells.filter((s) => {
            if (s.x === spell.x && s.y === spell.y) {
                s.destroy()
                return false
            }
            return true
        })
    }

    createKey = (x, y, players) => {
        this.scene.key = new Key(this.scene, x, y)
        this.scene.key.anims.play("keyAnimation")

        players.forEach((player) => {
            this.scene.physics.add.overlap(
                player,
                this.scene.key,
                this.handleKeyCollision,
                null,
                this
            )
        })
    }

    handleKeyCollision = (player, key) => {
        player.hasKey = true

        player.updateScore(100)

        eventEmitter.emit("onKeyData", true)

        this.emitRemoveKey()
        this.destroyKey()
    }

    destroyKey = () => this.scene.key.destroy()

    emitRemoveKey = () => {
        this.scene.websocketRoom.sendEvent("keyPickup")
    }

    addCollisions = (players) => {
        players.forEach((player) => {
            this.scene.physics.add.collider(
                player,
                this.scene.doorLayer,
                this.scene.handleDoorCollision,
                null,
                this
            )
            this.scene.physics.add.collider(player, this.scene.wallLayer)
        })
    }
}
