import React, { useState, useEffect } from "react"
import WebsocketRoom from "../websocketRoom.js"
import eventEmitter from "../eventEmitter.js"
import GameScene from "../game/GameScene.js"
import UIScene from "../game/UIScene.js"
import Phaser from "phaser"

const Game = ({ sessionId, onSessionEnd }) => {
    const [websocketRoom, setWebsocketRoom] = useState()

    useEffect(() => {
        setWebsocketRoom(new WebsocketRoom(sessionId))
    }, [])

    const startGame = (gameData) => {
        const config = {
            height: 1080,
            width: 1920,
            type: Phaser.AUTO,
            pixelArt: true,
            parent: "phaser-game",
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
            scene: [GameScene, UIScene],
        }
        const game = new Phaser.Game(config)
        game.registry.set("websocketRoom", websocketRoom)
        eventEmitter.on("sceneCreated", () => {
            eventEmitter.emit("setGameData", gameData)
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
                    eventEmitter.emit("moveOpponent", data)
                    break
            }
        }
    }, [websocketRoom])

    return <div id="phaser-game"></div>
}

export default Game
