import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js"
import config from "../../config.json"

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene", active: true })

        this.spellTypes = Object.keys(config.spells)

        this.scoreText = null
        this.score = 0
    }

    create = () => {
        this.createKeyIndicator()
        this.createSpellButtons()
        this.createJoyStick()
        this.scoreText = this.add.text(16, 16, "Score: " + this.score, {
            fontSize: "50px",
            fontFamily: "Magicfont",
            fill: "#fff",
        })

        eventEmitter.on("updateScore", (score) => {
            console.log("Received updateScore event with score:", score)
            this.scoreText.setText("Score: " + score)
        })

        eventEmitter.on("onSpellData", this.updateSpellButtons)
        eventEmitter.on("onKeyData", this.updateKeyIndicator)
    }

    createKeyIndicator = () => {
        this.keyIndcator = this.add.container(1920 - 50 * 2 - 30, 50 * 2 - 30)
        const circle = this.add.circle(0, 0, 50, 0x000f12)
        const image = this.add.image(0, 0, "key")
        image.setScale(2)

        this.keyIndcator.add([circle, image])

        this.updateKeyIndicator(false)
    }

    updateKeyIndicator = (hasKey) => {
        if (hasKey) {
            this.keyIndcator.setAlpha(1)
        } else {
            this.keyIndcator.setAlpha(0.5)
        }
    }

    createSpellButtons = () => {
        const { spells } = config

        this.spellTypes.forEach((type, i) => {
            const offsetX = 1920 - 50 * 2 - 30
            const offsetY = 1080 - 50 * 2 - 30 * (i + 1) - 100 * i

            console.log(spells[type]["button_asset"])

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
