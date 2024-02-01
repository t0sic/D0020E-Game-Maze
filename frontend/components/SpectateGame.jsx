import SpectateScene from "../game/SpectateScene.js"
import React, { useState, useEffect, useRef } from "react"
import WebsocketRoom from "../websocketRoom.js"
import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"

const SpectateGame = ({ sessionId, onSessionEnd }) => {
    const [websocketRoom, setWebsocketRoom] = useState()
    const [sceneCreated, setSceneCreated] = useState(false)
    const [gameData, setGameData] = useState()
    const [focusedPlayer, setFocusedPlayer] = useState()
    const [zoom, setZoom] = useState(1)
    const gameDataRef = useRef(gameData)

    useEffect(() => {
        gameDataRef.current = gameData
    }, [gameData])

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
            setSceneCreated(true)
            eventEmitter.emit("setGameData", gameData)
        })
        game.registry.set("websocketRoom", websocketRoom)
    }

    const handleSpellPickup = (spell, id) => {
        eventEmitter.emit("spellPickup", spell, id)
        let currentGameData = { ...gameDataRef.current }

        if (currentGameData && currentGameData.players[id]) {
            currentGameData.players[id].spells.push(spell.spellType)
            setGameData(currentGameData)
        }
    }

    const handleKeyPickup = (id) => {
        eventEmitter.emit("keyPickup", id)
        let currentGameData = { ...gameDataRef.current }

        if (currentGameData && currentGameData.players[id]) {
            currentGameData.players[id].hasKey = true
            setGameData(currentGameData)
        }
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
                    handleKeyPickup(data)
                    break
                case "spellPickup":
                    handleSpellPickup(data.spell, data.id)
                    break
                case "endSession":
                    onSessionEnd()
                    break
            }
        }
    }, [websocketRoom])

    return (
        <div>
            <div className="game-container-controlls">
                <h1>Session ID: {sessionId}</h1>
            </div>
            <div className="game-container">
                <div id="phaser-game" className="game-canvas"></div>
                {sceneCreated ? (
                    <div className="game-controlls">
                        <h1 className="game-controlls-header">Camera Follow</h1>
                        <button
                            className="spectate-button"
                            style={{ margin: "15px" }}
                            onClick={() => {
                                eventEmitter.emit("cameraFocusPlayer")
                                setFocusedPlayer(null)
                            }}
                        >
                            Center on map
                        </button>
                        <h1 className="game-controlls-header">Zoom {zoom}</h1>
                        <input
                            type="range"
                            min="0.5"
                            step="0.1"
                            max="10"
                            value={zoom}
                            className="game-controlls-slider"
                            onChange={(e) => {
                                setZoom(parseFloat(e.target.value))
                                eventEmitter.emit(
                                    "cameraZoom",
                                    parseFloat(e.target.value)
                                )
                            }}
                        ></input>
                        {gameData ? (
                            <>
                                {Object.keys(gameData.players)?.map(
                                    (player, i) => (
                                        <div
                                            className="game-player"
                                            style={{
                                                outline:
                                                    focusedPlayer === player
                                                        ? "1px solid #7153bf"
                                                        : "none",
                                            }}
                                            onClick={() => {
                                                eventEmitter.emit(
                                                    "cameraFocusPlayer",
                                                    player
                                                )
                                                setFocusedPlayer(player)
                                            }}
                                            key={player}
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
                                                            opacity:
                                                                gameData.players[
                                                                    player
                                                                ].spells.includes(
                                                                    "fire"
                                                                )
                                                                    ? 1
                                                                    : 0.5,
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="game-player-pickup"
                                                        style={{
                                                            backgroundImage:
                                                                "url(/assets/earth.png)",
                                                            opacity:
                                                                gameData.players[
                                                                    player
                                                                ].spells.includes(
                                                                    "earth"
                                                                )
                                                                    ? 1
                                                                    : 0.5,
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="game-player-pickup"
                                                        style={{
                                                            backgroundImage:
                                                                "url(/assets/air.png)",
                                                            opacity:
                                                                gameData.players[
                                                                    player
                                                                ].spells.includes(
                                                                    "air"
                                                                )
                                                                    ? 1
                                                                    : 0.5,
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="game-player-pickup"
                                                        style={{
                                                            backgroundImage:
                                                                "url(/assets/water.png)",
                                                            opacity:
                                                                gameData.players[
                                                                    player
                                                                ].spells.includes(
                                                                    "water"
                                                                )
                                                                    ? 1
                                                                    : 0.5,
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="game-player-pickup"
                                                        style={{
                                                            backgroundImage:
                                                                "url(/assets/key.png)",
                                                            opacity: gameData
                                                                .players[player]
                                                                .hasKey
                                                                ? 1
                                                                : 0.5,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default SpectateGame
