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
        this.createKeyIndicator()
        this.createSpellButtons()
        this.createJoyStick()

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
            console.log("logging spelltype in uiscene", type)

            this[type + "Button"].add([image])
            // Add hit area to container
            this[type + "Button"].setSize(100, 100)
            this[type + "Button"].setInteractive()

            this[type + "Button"].on("pointerdown", () => {
                if (this[type + "Button"].alpha !== 1) return
                this[type + "Button"].setAlpha(0.5)
                if (type === "stun") {
                    const cooldownOverlay = this.setupCooldownOverlay()
                    this.triggerCooldown(cooldownOverlay)
                }
                eventEmitter.emit("onSpellButtonClicked", type)
            })
        })

        this.updateSpellButtons([])
    }
    setupCooldownOverlay = () => {
        console.log("In cooldownSetup")
        const cooldownOverlay = this.add.graphics()
        cooldownOverlay.setAlpha(0)
        console.log("logging container", this.stunButton)
        this.stunButton.setAlpha(1)
        cooldownOverlay.fillStyle(0x0000ff, 0.5) // Black with 50% transparency
        cooldownOverlay.fillRect(0 - 50, 0 - 50, 100, 100) // Draw a square shape (100x100)
        console.log(cooldownOverlay)
        this.stunButton.add(cooldownOverlay)
        return cooldownOverlay
    }

    triggerCooldown = (cooldownOverlay) => {
        this.stunButton.setAlpha(0.5)
        cooldownOverlay.setAlpha(1)
        const cooldownTween = this.tweens.add({
            targets: cooldownOverlay,
            scaleY: 0, // Shrink the height to 0
            y: 50,
            duration: 1000, // Duration of the cooldown effect (5000 milliseconds = 5 seconds)
            transformOrigin: { x: 0, y: 0 }, // Set the transform origin to the top-left corner
            onComplete: () => {
                this.stunButton.setAlpha(1)
                cooldownOverlay.setAlpha(0)
            },
        })
    }

    updateSpellButtons = (spells) => {
        this.spellTypes.forEach((spell) => {
            if (spell != "stun") {
                console.log("this is not a stun", spell)
                if (spells.includes(spell)) {
                    this[spell + "Button"].setAlpha(1)
                } else {
                    this[spell + "Button"].setAlpha(0.5)
                }
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
