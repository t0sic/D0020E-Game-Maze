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

        this.spells = []
    }

    create = () => {
        this.gameWidth = this.sys.game.config.width
        this.gameHeight = this.sys.game.config.height

        this.createJoyStick()
        this.createScoreText()

        eventEmitter.on("updateScoreText", this.updateScoreText)

        eventEmitter.on("sceneCreated", () => {
            this.createIndicator()
            this.createSpellButtons()
            this.createFullScreenButton()
            this.createEffects()
            this.updateObjective("key")

            eventEmitter.on("onSpellData", this.updateSpellButtons)
            eventEmitter.on("onIndicatorData", this.setIndicatorDirection)
            eventEmitter.on("onObjectiveData", this.updateObjective)
            eventEmitter.on("onKeyData", this.updateKeyData)
            eventEmitter.on("onAddEffect", this.addEffect)
            eventEmitter.on("onRemoveEffect", this.removeEffect)
        })
    }

    updateKeyData = (hasKey) => {
        this.hasKey = hasKey
    }

    updateScoreText = (score) => {
        this.scoreText.setText(`Score: ${score}`)
    }

    createScoreText = () => {
        const x = this.cameras.main.width / 2
        const y = 16
        this.scoreText = this.add
            .text(x, y, `Score: 0`, {
                fontSize: "50px",
                fontFamily: "Magicfont",
                fill: "#fff",
            })
            .setOrigin(0.5, 0)
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

    createEffects = () => {
        this.effects = this.add.container(this.gameWidth - 300, 50 * 2)
    }

    removeEffect = (effect) => {
        if (effect === "stun") {
            this.unlockButtons()
        }

        const effectImage = this.effects.list.find(
            (image) => image.texture.key === effect + "_button"
        )

        if (!effectImage) return

        this.effects.remove(effectImage)
        effectImage.destroy()

        this.effects.list.forEach((image, i) => {
            image.x = i * -75
        })
    }

    unlockButtons = () => {
        this.spellTypes.forEach((type) => {
            if (this.spells.includes(type) || type === "stun") {
                this[type + "Button"].setAlpha(1)
            }
        })
    }

    lockButtons = () => {
        this.spellTypes.forEach((type) => {
            this[type + "Button"].setAlpha(0.5)
        })
    }

    addEffect = (effect) => {
        if (effect === "stun") {
            this.lockButtons()
        }

        const activeEffects = this.effects.list.length
        const effectImage = this.add.image(
            activeEffects * -75,
            0,
            effect + "_button"
        )
        effectImage.setScale(4)

        console.log("runs addEffect", effect)

        this.effects.add(effectImage)

        this.tweens.add({
            targets: effectImage,
            alpha: 0.2,
            duration: 1000,
            ease: "Sine.easeInOut",
            repeat: -1,
            yoyo: true,
        })
    }

    createFullScreenButton = () => {
        this.fullScreenButton = this.add.container(50 * 2 - 30, 50 * 2)
        const square = this.add.rectangle(0, 0, 100, 100, 0x000f12)

        const fullScreenEnter = this.add.image(0, 0, "fullscreen_enter")
        const fullScreenExit = this.add.image(0, 0, "fullscreen_exit")

        fullScreenEnter.setScale(0.75)
        fullScreenExit.setScale(0.75)

        try {
            this.scale.startFullscreen().catch((err) => {})
        } catch (error) {}

        this.scale.on("enterfullscreen", () => {
            fullScreenEnter.setAlpha(0)
            fullScreenExit.setAlpha(1)
        })

        this.scale.on("leavefullscreen", () => {
            fullScreenEnter.setAlpha(1)
            fullScreenExit.setAlpha(0)
        })

        const isFullScreen = this.scale.isFullscreen

        fullScreenEnter.setAlpha(isFullScreen ? 0 : 1)
        fullScreenExit.setAlpha(isFullScreen ? 1 : 0)

        this.fullScreenButton.add([square, fullScreenEnter, fullScreenExit])
        this.fullScreenButton.setSize(50, 50)
        this.fullScreenButton.setInteractive()

        this.fullScreenButton.on("pointerdown", () => {
            if (this.scale.isFullscreen) {
                fullScreenEnter.setAlpha(1)
                fullScreenExit.setAlpha(0)
                this.scale.stopFullscreen()
            } else {
                fullScreenEnter.setAlpha(0)
                fullScreenExit.setAlpha(1)
                this.scale.startFullscreen().catch((err) => {
                    console.log("Failed to enter fullscreen mode:", err.message)
                })
            }
        })
    }

    createIndicator = () => {
        this.keyIndcator = this.add.container(
            this.gameWidth - 50 * 2 - 30,
            50 * 2
        )
        const circle = this.add.circle(0, 0, 50, 0x000f12)
        // bring circle to top

        const key = this.add.image(0, 0, "key")
        key.setAlpha(0.5)
        key.setScale(2)

        const exit = this.add.image(0, 0, "exit")
        exit.setAlpha(0)
        exit.setScale(0.3)

        const arrow = this.add.image(0, 0, "arrow")
        exit.setAlpha(0)
        arrow.setScale(0.4)
        arrow.setOrigin(0.5, 1)

        circle.setDepth(1)

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
            const offsetX = this.gameWidth - 50 * 2 - 30
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
        const cooldownOverlay = this.add.graphics()
        cooldownOverlay.setAlpha(0)
        this.stunButton.setAlpha(1)
        cooldownOverlay.fillStyle(0x0000ff, 0.5) // Black with 50% transparency
        cooldownOverlay.fillRect(0 - 50, 0 - 50, 100, 100) // Draw a square shape (100x100)
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
        this.spells = spells

        this.spellTypes.forEach((spell) => {
            if (spell != "stun") {
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
