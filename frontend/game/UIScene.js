import Phaser from "phaser"
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js"

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene", active: true })
    }

    create = () => {
        this.joystick = new VirtualJoystick(this, {
            x: 1920 - 100 * 2 - 30,
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
