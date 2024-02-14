import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js"
import config from "../../config.json"

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene", active: true })

        this.spellTypes = Object.keys(config.spells)
    }

    create = () => {
        this.createIndicator()
        this.createSpellButtons()
        this.createJoyStick()

        eventEmitter.on("onSpellData", this.updateSpellButtons)
        eventEmitter.on("onIndicatorData", this.setIndicatorDirection)
        eventEmitter.on("onKeyData", this.updateKeyIndicator)
    }

    setIndicatorDirection = (playerCoords, targetCoords) => {
        const angle = Phaser.Math.Angle.Between(
            playerCoords.x,
            playerCoords.y,
            targetCoords.x,
            targetCoords.y
        )
        this.keyIndcator.getAt(2).setRotation(angle + Math.PI / 2)
    }

    createIndicator = () => {
        this.keyIndcator = this.add.container(1920 - 50 * 2 - 30, 50 * 2)
        const circle = this.add.circle(0, 0, 50, 0x000f12)
        const key = this.add.image(0, 0, "key")
        key.setScale(2)

        const exit = this.add.image(0, 0, "exit")
        exit.setScale(0.3)

        const arrow = this.add.image(0, 0, "arrow")
        arrow.setScale(0.4)
        arrow.setOrigin(0.5, 1)

        this.keyIndcator.add([circle, key, arrow, exit])

        this.updateKeyIndicator(false)
    }

    updateKeyIndicator = (hasKey) => {
        if (hasKey) {
            this.keyIndcator.getAt(3).setAlpha(1)
            this.keyIndcator.getAt(1).setAlpha(0)
        } else {
            this.keyIndcator.getAt(1).setAlpha(1)
            this.keyIndcator.getAt(3).setAlpha(0)
        }
    }

    createSpellButtons = () => {
        this.spellTypes.forEach((type, i) => {
            const offsetX = 1920 - 50 * 2 - 30
            const offsetY = 1080 - 50 * 2 - 30 * (i + 1) - 100 * i

            this[type + "Button"] = this.add.container(offsetX, offsetY)
            const image = this.add.image(0, 0, type + "_button")
            image.setScale(8)

            this[type + "Button"].add([image])
            // Add hit area to container
            this[type + "Button"].setSize(100, 100)
            this[type + "Button"].setInteractive()
            this[type + "Button"].on("pointerdown", () => {
                if (this[type + "Button"].alpha !== 1) return
                this[type + "Button"].setAlpha(0.5)
                eventEmitter.emit("onSpellButtonClicked", type)
            })
        })

        this.updateSpellButtons([])
    }

    updateSpellButtons = (spells) => {
        this.spellTypes.forEach((spell) => {
            if (spells.includes(spell)) {
                this[spell + "Button"].setAlpha(1)
            } else {
                this[spell + "Button"].setAlpha(0.5)
            }
        })
    }

    createJoyStick = () => {
        this.joystick = new VirtualJoystick(this, {
            x: 100 * 2 - 30,
            y: 1080 - 100 * 2 - 30,
            radius: 100,
            base: this.add.circle(0, 0, 100, 0x888888),
            thumb: this.add.circle(0, 0, 50, 0xcccccc),
        })
    }

    update = () => {
        this.events.emit("joystickMove", this.joystick)
    }
}

export default UIScene
