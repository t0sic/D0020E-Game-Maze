import React, { useState, useEffect } from "react"
import Layout from "./components/Layout.jsx"
import WebsocketRoom from "./websocketRoom.js"
import Queue from "./components/Queue.jsx"
import Game from "./components/Game.jsx"

const App = () => {
    const [path, setPath] = useState("Home")
    const [queueState, setQueueState] = useState("Error")
    const [websocketRoom, setWebsocketRoom] = useState()
    const [sessionId, setSessionId] = useState()

    useEffect(() => {
        if (!websocketRoom) return

        websocketRoom.eventHandler = (event, data) => {
            switch (event) {
                case "connect":
                    console.log("Connection to game server established")
                    websocketRoom.sendEvent("joinQueue")
                    setQueueState("connected")
                    break
                case "callToSession":
                    console.log("executing callToSession", data)
                    setSessionId(data)
                    setPath("Game")
                    break
            }
        }
    }, [websocketRoom])

    const handlePlay = () => {
        setPath("Queue")

        if (!websocketRoom) {
            setQueueState("connecting")
            setWebsocketRoom(new WebsocketRoom("gameserver"))
        } else {
            setQueueState("connected")
            websocketRoom.sendEvent("joinQueue")
        }
    }

    const handleLeave = () => {
        if (websocketRoom) {
            websocketRoom.sendEvent("leaveQueue")
        }

        setPath("Home")
    }

    const handleSessionEnd = () => {
        setQueueState("ended")
        setPath("Queue")
    }

    return (
        <>
            {path === "Queue" ? (
                <Queue queueState={queueState} onLeave={handleLeave} />
            ) : path === "Game" ? (
                <Game sessionId={sessionId} onSessionEnd={handleSessionEnd} />
            ) : (
                <Layout setPath={setPath} path={path} onPlay={handlePlay} />
            )}
        </>
    )
}

export default App
