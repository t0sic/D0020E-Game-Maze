import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js"

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene", active: true })

        this.spellTypes = ["earth", "fire", "water", "air"]

        eventEmitter.on("emitGameObject", (data) => {
            const game = data
            console.log("recieved " + game)
        })
        eventEmitter.emit("sceneCreated")
    }

    updateFPS = () => {
        this.fpsText.setText("FPS: " + Math.floor(this.game.loop.actualFps))
    }

    create = () => {
        this.createKeyIndicator()
        this.createSpellButtons()
        this.createJoyStick()
        this.createFPSCounter()

        eventEmitter.on("onSpellData", this.updateSpellButtons)
        eventEmitter.on("onKeyData", this.updateKeyIndicator)
    }

    createKeyIndicator = () => {
        this.keyIndcator = this.add.container(1920 - 50 * 2 - 30, 50 * 2 - 30)
        const circle = this.add.circle(0, 0, 50, 0x000f12)
        const image = this.add.image(0, 0, "key")
        image.setScale(4)

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
        this.spellTypes.forEach((type, i) => {
            const offsetX = 1920 - 50 * 2 - 30
            const offsetY = 1080 - 50 * 2 - 30 * (i + 1) - 100 * i

            this[type + "Button"] = this.add.container(offsetX, offsetY)
            const circle = this.add.circle(0, 0, 50, 0x000f12)
            const image = this.add.image(0, 0, type)
            image.setScale(4)

            this[type + "Button"].add([circle, image])
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

    createFPSCounter = () => {
        this.fpsText = this.add.text(16, 16, "FPS: 0", {
            font: "40px Arial",
            fill: "#ffffff",
        })

        setInterval(this.updateFPS, 500)
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
