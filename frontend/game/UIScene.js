import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js"
import config from "../../config.json"

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene", active: true })

        this.spellTypes = Object.keys(config.spells)
        this.objective = "key"
        this.hasKey = false
    }

    create = () => {
        this.createIndicator()
        this.createSpellButtons()
        this.createJoyStick()

        eventEmitter.on("onSpellData", this.updateSpellButtons)
        eventEmitter.on("onIndicatorData", this.setIndicatorDirection)
        eventEmitter.on("onObjectiveData", this.updateObjective)
        eventEmitter.on("onKeyData", this.updateKeyData)
    }

    updateKeyData = (hasKey) => {
        this.hasKey = hasKey
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
        key.setAlpha(0.5)
        key.setScale(2)

        const exit = this.add.image(0, 0, "exit")
        exit.setAlpha(0)
        exit.setScale(0.3)

        const arrow = this.add.image(0, 0, "arrow")
        arrow.setScale(0.4)
        arrow.setOrigin(0.5, 1)

        const opponent = this.add.image(0, 0, "player")
        opponent.setScale(2)
        opponent.setAlpha(0)

        this.keyIndcator.add([circle, key, arrow, exit, opponent])
    }

    updateObjective = (objective) => {
        const { rules } = config

        this.objective = objective

        const arrow = this.keyIndcator.getAt(2)
        const key = this.keyIndcator.getAt(1)
        const exit = this.keyIndcator.getAt(3)
        const opponent = this.keyIndcator.getAt(4)

        switch (objective) {
            case "key":
                key.setAlpha(this.hasKey ? 1 : 0.5)
                exit.setAlpha(0)
                opponent.setAlpha(0)
                arrow.setAlpha(rules["track_key"] ? 1 : 0)
                break
            case "opponent":
                key.setAlpha(0)
                exit.setAlpha(0)
                opponent.setAlpha(1)
                arrow.setAlpha(rules["track_opponent"] ? 1 : 0)
                break
            case "exit":
                key.setAlpha(0)
                exit.setAlpha(1)
                opponent.setAlpha(0)
                arrow.setAlpha(rules["track_exit"] ? 1 : 0)
                break
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
