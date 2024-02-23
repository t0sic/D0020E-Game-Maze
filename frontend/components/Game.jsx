import React, { useState, useEffect } from "react"
import WebsocketRoom from "../websocketRoom.js"
import eventEmitter from "../eventEmitter.js"
import GameScene from "../game/GameScene.js"
import EndScene from "../game/EndScene.js"
import UIScene from "../game/UIScene.js"
import Phaser from "phaser"

const Game = ({ sessionId, onSessionEnd, onGameEnd }) => {
    const [websocketRoom, setWebsocketRoom] = useState()

    useEffect(() => {
        console.log("creating websocket room")
        setWebsocketRoom(new WebsocketRoom(sessionId))
    }, [])

    const startGame = (gameData) => {
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight

        const aspectRatio = screenWidth / screenHeight

        let calculatedWidth, calculatedHeight

        if (screenWidth < 1920 || screenHeight < 1080) {
            if (aspectRatio >= 1920 / 1080) {
                calculatedHeight = 1080
                calculatedWidth = calculatedHeight * aspectRatio
            } else {
                calculatedWidth = 1920
                calculatedHeight = calculatedWidth / aspectRatio
            }
        } else {
            if (aspectRatio >= 1920 / 1080) {
                calculatedHeight = screenHeight
                calculatedWidth = calculatedHeight * aspectRatio
            } else {
                calculatedWidth = screenWidth
                calculatedHeight = calculatedWidth / aspectRatio
            }
        }
        calculatedWidth = Math.max(calculatedWidth, 1920)
        calculatedHeight = Math.max(calculatedHeight, 1080)

        // Continue with your config
        const config = {
            width: calculatedWidth,
            height: calculatedHeight,

            type: Phaser.AUTO,
            pixelArt: true,
            parent: "phaser-game",
            input: {
                activePointers: 3,
            },
            physics: {
                default: "arcade",
                arcade: {
                    fps: 60,
                },
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            scene: [GameScene, UIScene, EndScene],
        }
        const game = new Phaser.Game(config)
        eventEmitter.events = {}
        game.registry.set("websocketRoom", websocketRoom)
        eventEmitter.on("sceneCreated", () => {
            eventEmitter.emit("setGameData", gameData)
        })
        eventEmitter.on("endGame", () => {
            onGameEnd()
        })
    }

    useEffect(() => {
        if (!websocketRoom) return

        websocketRoom.eventHandler = (event, data) => {
            switch (event) {
                case "connect":
                    websocketRoom.sendEvent("playerReady")
                    break
                case "startGame":
                    startGame(data)
                    break
                case "endSession":
                    console.log("end session")
                    onSessionEnd()
                    break
                case "updatePlayerPosition":
                    eventEmitter.emit("moveOpponent", data.coords)
                    break
                case "keyPickup":
                    eventEmitter.emit("keyPickup", data)
                    break
                case "spellPickup":
                    eventEmitter.emit("spellPickup", data.spell)
                    break
                case "castSpell":
                    eventEmitter.emit("castSpell", data)
                    break
                case "dropKey":
                    eventEmitter.emit("dropKey", data)
                    break
                case "updateScore":
                    eventEmitter.emit("updateScore", data)
                    break
                case "playerWon":
                    eventEmitter.emit("playerWon", false)
                    break
                case "spawnSpell":
                    eventEmitter.emit("spawnSpell", data)
                    break
            }
        }
    }, [websocketRoom])

    return <div id="phaser-game"></div>
}

export default Game
