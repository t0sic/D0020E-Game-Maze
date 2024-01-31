import eventEmitter from "../eventEmitter.js"
import Spell from "./Spell.js"
import Key from "./Key.js"

export default class Map {
    constructor(scene) {
        this.scene = scene
    }

    createMap = () => {
        const mapAsset = this.scene.gameData.map.asset

        const map = this.scene.make.tilemap({ key: mapAsset })
        const tileset = map.addTilesetImage("dungeon_tiles", "tiles")
        const groundLayer = map.createLayer("Ground", tileset)
        const wallLayer = map.createLayer("Walls", tileset)
        const doorLayer = map.createLayer("Door", tileset)

        wallLayer.setCollisionByProperty({ Collision: true })
        doorLayer.setCollisionByProperty({ Collision: true })

        this.scene.wallLayer = wallLayer
        this.scene.doorLayer = doorLayer
    }

    createSpell = ({ x, y, spellType }) => {
        const spell = new Spell(this.scene, x, y, spellType)
        this.scene.spells.push(spell)
        this.scene.physics.add.overlap(
            this.scene.player,
            spell,
            this.scene.player.handleSpellCollision,
            null,
            this
        )
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

    createKey = (x, y) => {
        this.scene.key = new Key(this.scene, x, y)
        this.scene.physics.add.overlap(
            this.scene.player,
            this.scene.key,
            this.handleKeyCollision,
            null,
            this
        )
    }

    handleKeyCollision = (player, key) => {
        this.scene.player.hasKey = true

        eventEmitter.emit("onKeyData", this.scene.player.hasKey)

        this.emitRemoveKey()
        this.destroyKey()
    }

    destroyKey = () => this.scene.key.destroy()

    emitRemoveKey = () => {
        this.scene.websocketRoom.sendEvent("keyPickup")
    }

    addCollisions = () => {
        this.scene.physics.add.collider(
            this.scene.player,
            this.scene.doorLayer,
            this.scene.handleDoorCollision,
            null,
            this
        )
        this.scene.physics.add.collider(this.scene.player, this.scene.wallLayer)
    }
}
