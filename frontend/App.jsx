import React, { useState, useEffect } from "react"
import Layout from "./components/Layout.jsx"
import WebsocketRoom from "./websocketRoom.js"
import Queue from "./components/Queue.jsx"

const App = () => {
    const [path, setPath] = useState("Home")
    const [queueState, setQueueState] = useState("Error")
    const [websocketRoom, setWebsocketRoom] = useState()

    useEffect(() => {
        if (!websocketRoom) return
        websocketRoom.sendEvent("test", 123)
    }, [websocketRoom])

    const eventHandler = (event, data) => {
        switch (event) {
            case "connect":
                console.log("Connection to game server established")
                setQueueState("connected")

                break
        }
    }

    const handlePlay = () => {
        setPath("Queue")

        if (!websocketRoom) {
            setQueueState("connecting")
            setWebsocketRoom(new WebsocketRoom("gameserver", eventHandler))
        }
    }

    return (
        <>
            {path === "Queue" ? (
                <Queue websocketRoom={websocketRoom} queueState={queueState} />
            ) : (
                <Layout setPath={setPath} path={path} onPlay={handlePlay} />
            )}
        </>
    )
}

export default App
