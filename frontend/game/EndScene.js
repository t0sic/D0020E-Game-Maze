import Phaser from "phaser"
import eventEmitter from "../eventEmitter.js"

export default class EndScene extends Phaser.Scene {
    constructor() {
        super("EndScene")
    }

    init = () => {
        this.websocketRoom = this.registry.get("websocketRoom")
    }

    preload = () => {
        this.load.image("background3", "/assets/ui/background3.png")
    }

    create = (data) => {
        const { win, playerScore } = data

        setTimeout(() => {
            this.websocketRoom.sendEvent("updateScore", playerScore)
        }, 1000)

        this.scale.resize(1920, 1080)

        const background = this.add.image(0, 0, "background3").setOrigin(0, 0)
        background.displayWidth = this.scale.width
        background.displayHeight = this.scale.height

        const playerScoreText = this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 4,
                `Your Score: ${playerScore}`,
                {
                    fontSize: 50,
                    color: "#fff",
                    backgroundColor: "#000",
                    fontFamily: "Magicfont",
                    padding: {
                        x: 10,
                        y: 5,
                        stroke: "#000",
                        strokeThickness: 5,
                    },
                }
            )
            .setOrigin(0.5)

        const text = this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 2,
                win ? "YOU WON" : "YOU LOST",
                {
                    fontSize: 60,
                    color: "#fff",
                    backgroundColor: "#000",
                    stroke: "#000",
                    strokeThickness: 5,
                    fontFamily: "Magicfont",
                    padding: {
                        x: 10,
                        y: 5,
                        stroke: "#000",
                        strokeThickness: 5,
                    },
                }
            )
            .setOrigin(0.5)

        const leaveButton = this.add
            .text(
                this.scale.width / 2,
                text.y + text.displayHeight / 2 + 200,
                "Leave",
                {
                    fontSize: 40,
                    color: "#fff",
                    backgroundColor: "#000",
                    fontFamily: "Magicfont",
                    padding: {
                        x: 10,
                        y: 5,
                        stroke: "#000",
                        strokeThickness: 5,
                    },
                }
            )
            .setOrigin(0.5)
            .setInteractive()

        leaveButton.on("pointerdown", () => {
            eventEmitter.emit("endGame")
            console.log("Leave button clicked")
        })
    }
}
