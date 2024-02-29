import SpectateScene from "../game/SpectateScene.js"
import React, { useState, useEffect } from "react"
import eventEmitter from "../eventEmitter.js"
import Phaser from "phaser"

const SpectateGame = ({ gameData, socket, setGameData }) => {
    const [sceneCreated, setSceneCreated] = useState(false)
    const [focusedPlayer, setFocusedPlayer] = useState()
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        startGame()
    }, [])

    const startGame = () => {
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
        game.registry.set("socket", socket)
        eventEmitter.events = {}

        eventEmitter.on("gameData", (data) => {
            setGameData({ ...data })
        })

        eventEmitter.on("sceneCreated", () => {
            setSceneCreated(true)
            eventEmitter.emit("setGameData", gameData)
        })
    }

    const width = document.getElementById("phaser-game")
        ? document.getElementById("phaser-game").clientWidth
        : 0

    return (
        <div>
            <div className="game-container-controlls">
                <h3>Spectate Game</h3>
                <div className="game-container-controlls-button">
                    <button className="button-primary">Leave</button>
                </div>
            </div>
            <div className="game-container">
                <div id="phaser-game" className="game-canvas"></div>
                {sceneCreated ? (
                    <div
                        className="game-controlls"
                        style={{ width: `calc(100% - ${width}px)` }}
                    >
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
                                                        "url(/assets/ui/player" +
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
                                                                "url(/assets/pickups/haste.png)",
                                                            opacity:
                                                                gameData.players[
                                                                    player
                                                                ].spells.includes(
                                                                    "haste"
                                                                )
                                                                    ? 1
                                                                    : 0.5,
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="game-player-pickup"
                                                        style={{
                                                            backgroundImage:
                                                                "url(/assets/pickups/slow.png)",
                                                            opacity:
                                                                gameData.players[
                                                                    player
                                                                ].spells.includes(
                                                                    "slow"
                                                                )
                                                                    ? 1
                                                                    : 0.5,
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="game-player-pickup"
                                                        style={{
                                                            backgroundImage:
                                                                "url(/assets/pickups/confuse.png)",
                                                            opacity:
                                                                gameData.players[
                                                                    player
                                                                ].spells.includes(
                                                                    "confuse"
                                                                )
                                                                    ? 1
                                                                    : 0.5,
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="game-player-pickup"
                                                        style={{
                                                            backgroundImage:
                                                                "url(/assets/pickups/key.png)",
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
                        <div
                            className="qrcode"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <h2 style={{ color: "white" }}> Scan to play!</h2>
                            <img
                                style={{ marginTop: "2rem" }}
                                src="/assets/qrcode.png"
                            ></img>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default SpectateGame
