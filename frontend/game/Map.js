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

        eventEmitter.emit("onKeyData", true)

        this.emitRemoveKey()
        this.destroyKey()
    }

    // Function to drop a new key at a valid location not inside a wall
    dropKey = (x, y) => {
        console.log(this.scene.player.hasKey)
        if (this.scene.player.hasKey) {
            this.scene.player.hasKey = false
            const distance = 50 // Example distance in pixels
            let validPositionFound = false
            let dropX, dropY

            // Try until a valid position is found
            while (!validPositionFound) {
                const angle = Phaser.Math.Between(0, 360)
                dropX = x + distance * Math.cos(Phaser.Math.DegToRad(angle))
                dropY = y + distance * Math.sin(Phaser.Math.DegToRad(angle))

                // Check if the drop position is inside a wall using the tilemap
                const tile = this.scene.wallLayer.getTileAtWorldXY(dropX, dropY)
                if (!tile || !tile.collides) {
                    validPositionFound = true
                }
            }
            this.createKey(dropX, dropY, [this.scene.player])
            this.scene.websocketRoom.sendEvent("dropKey", {
                x: dropX,
                y: dropY,
            })
        }
    }

    destroyKey = () => this.scene.key.destroy()

    emitRemoveKey = () => {
        this.scene.websocketRoom.sendEvent("keyPickup")
    }

    getDoorCoords = () => {
        const tiles = []

        this.scene.doorLayer.forEachTile((tile) => {
            if (tile.index !== -1) {
                var worldX = this.scene.doorLayer.tileToWorldX(tile.x)
                var worldY = this.scene.doorLayer.tileToWorldY(tile.y)
                tiles.push({ x: worldX, y: worldY })
            }
        })

        // Get smallest coord in tiles
        const minX = Math.min(...tiles.map((tile) => tile.x))
        const minY = Math.min(...tiles.map((tile) => tile.y))
        const maxX = Math.max(...tiles.map((tile) => tile.x))
        const maxY = Math.max(...tiles.map((tile) => tile.y))

        // Get the center of the door
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        return { x: centerX, y: centerY }
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
