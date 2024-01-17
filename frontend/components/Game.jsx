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

        // PHASER config for phone in horizontal mode
        const config = {
            height: 1080,
            width: 1920,
            type: Phaser.AUTO,
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
        eventEmitter.on("sceneCreated", () => {
            eventEmitter.emit("emitGameObject",game)
            console.log("emitted event")
        })



    }, [])

    useEffect(() => {
        if (!websocketRoom) return


        websocketRoom.eventHandler = (event, data) => {
            switch (event) {
                case "connect":
                    websocketRoom.sendEvent("playerReady")
                    break
                case "startGame":
                    console.log("recieved map object", data)
                    eventEmitter.on("sceneCreated" , () => {
                        eventEmitter.emit("emitWebsocketRoom",websocketRoom)
                        eventEmitter.emit("emitMapObject",data)
                    })
                    break
                case "endSession":
                    console.log("end session")
                    onSessionEnd()
                    break
                case "updatePlayerPosition":
                    console.log("recieved position", data)
                    eventEmitter.emit("moveOpponent",data)
                    break
            }
        }
    }, [websocketRoom])

    return <div id="phaser-game"></div>

}

export default Game
