import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })
        console.log("runs")

        eventEmitter.on("startGame", () => {
            console.log("tjo boss")
        })
    }

    init = () => {
        console.log("GameScene init")
    }
}

export default GameScene
