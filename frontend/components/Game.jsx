import React, { useState, useEffect } from "react"
import eventEmitter from "../eventEmitter.js"
import GameScene from "../game/GameScene.js"
import UIScene from "../game/UIScene.js"
import Phaser from "phaser"

const Game = ({ socket, gameData, onGameEnd, onSessionEnd }) => {
    const startGame = () => {
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
            scene: [GameScene, UIScene],
        }
        const game = new Phaser.Game(config)
        game.registry.set("socket", socket)
        eventEmitter.on("sceneCreated", () => {
            eventEmitter.emit("setGameData", gameData)
        })
        eventEmitter.on("gameEnded", (data) => {
            game.destroy(true, false)
            eventEmitter.events = {}
            onGameEnd(data)
        })
        eventEmitter.on("sessionEnded", () => {
            game.destroy(true, false)
            eventEmitter.events = {}
            onSessionEnd()
        })
    }

    useEffect(() => {
        if (!socket) return

        startGame()
    }, [socket])

    return <div id="phaser-game"></div>
}

export default Game
