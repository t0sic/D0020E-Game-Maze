import SpectateScene from "../game/SpectateScene.js"
import React, { useState, useEffect } from "react"
import WebsocketRoom from "../websocketRoom.js"
import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"

const SpectateGame = ({ sessionId }) => {
    const [websocketRoom, setWebsocketRoom] = useState()
    const [gameData, setGameData] = useState()

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
            scene: [SpectateScene],
        }
        const game = new Phaser.Game(config)
        eventEmitter.events = {}
        eventEmitter.on("sceneCreated", () => {
            eventEmitter.emit("setGameData", gameData)
        })
        game.registry.set("websocketRoom", websocketRoom)
    }

    useEffect(() => {
        if (!websocketRoom) return

        websocketRoom.eventHandler = (event, data) => {
            switch (event) {
                case "connect":
                    websocketRoom.sendEvent("spectate")
                    break
                case "data":
                    setGameData(data)
                    startGame(data)
                    break
                case "updatePlayerPosition":
                    eventEmitter.emit(
                        "updatePlayerPosition",
                        data.coords,
                        data.id
                    )
                    break
                case "keyPickup":
                    eventEmitter.emit("keyPickup", data)
                    break
                case "spellPickup":
                    eventEmitter.emit("spellPickup", data)
                    break
            }
        }
    }, [websocketRoom])

    console.log(gameData)

    return (
        <div>
            <div className="game-container-controlls">
                <h1>Session ID: {sessionId}</h1>
            </div>
            <div className="game-container">
                <div id="phaser-game" className="game-canvas"></div>
                <div className="game-controlls">
                    <h1 className="game-controlls-header">Camera Follow</h1>
                    <button
                        className="spectate-button"
                        style={{ margin: "15px" }}
                        onClick={() => eventEmitter.emit("cameraFocusPlayer")}
                    >
                        Center on map
                    </button>
                    {gameData ? (
                        <>
                            {Object.keys(gameData.players)?.map((player, i) => (
                                <div
                                    className="game-player"
                                    onClick={() =>
                                        eventEmitter.emit(
                                            "cameraFocusPlayer",
                                            player
                                        )
                                    }
                                >
                                    <div
                                        className="game-player-image"
                                        style={{
                                            backgroundImage:
                                                "url(/assets/player" +
                                                (i + 1) +
                                                ".webp)",
                                        }}
                                    ></div>
                                    <div className="game-player-right">
                                        <div className="game-player-name">
                                            Player {i + 1}
                                        </div>
                                        <div className="game-player-pickups">
                                            <div
                                                className="game-player-pickup"
                                                style={{
                                                    backgroundImage:
                                                        "url(/assets/fire.png)",
                                                    opacity: gameData.players[
                                                        player
                                                    ].spells.includes("fire")
                                                        ? 1
                                                        : 0.5,
                                                }}
                                            ></div>
                                            <div
                                                className="game-player-pickup"
                                                style={{
                                                    backgroundImage:
                                                        "url(/assets/earth.png)",
                                                    opacity: gameData.players[
                                                        player
                                                    ].spells.includes("earth")
                                                        ? 1
                                                        : 0.5,
                                                }}
                                            ></div>
                                            <div
                                                className="game-player-pickup"
                                                style={{
                                                    backgroundImage:
                                                        "url(/assets/air.png)",
                                                    opacity: gameData.players[
                                                        player
                                                    ].spells.includes("air")
                                                        ? 1
                                                        : 0.5,
                                                }}
                                            ></div>
                                            <div
                                                className="game-player-pickup"
                                                style={{
                                                    backgroundImage:
                                                        "url(/assets/water.png)",
                                                    opacity: gameData.players[
                                                        player
                                                    ].spells.includes("water")
                                                        ? 1
                                                        : 0.5,
                                                }}
                                            ></div>
                                            <div
                                                className="game-player-pickup"
                                                style={{
                                                    backgroundImage:
                                                        "url(/assets/key.png)",
                                                    opacity: gameData.players[
                                                        player
                                                    ].hasKey
                                                        ? 1
                                                        : 0.5,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default SpectateGame
