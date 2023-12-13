import React, { useState, useEffect } from "react"
import WebsocketRoom from "../websocketRoom.js"

const Game = ({ sessionId }) => {
    const [websocketRoom, setWebsocketRoom] = useState()

    useEffect(() => setWebsocketRoom(new WebsocketRoom(sessionId)), [])

    useEffect(() => {
        if (!websocketRoom) return

        websocketRoom.eventHandler = (event, data) => {
            switch (event) {
                case "connect":
                    websocketRoom.sendEvent("playerReady")
                    break
                case "startGame":
                    console.log("recieved map object", data)
                    break
            }
        }
    }, [websocketRoom])

    return <div>Hello World</div>
}

export default Game
