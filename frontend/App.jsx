import React, { useState, useEffect } from "react"
import Layout from "./components/Layout.jsx"
import WebsocketRoom from "./websocketRoom.js"
import Queue from "./components/Queue.jsx"

const App = () => {
    const [path, setPath] = useState("Home")
    const [queueState, setQueueState] = useState("Error")
    const [gameWebsocketRoom, setGameWebsocketRoom] = useState()
    const [sessionWebsocketRoom, setSessionWebsocketRoom] = useState()

    useEffect(() => {
        if (!gameWebsocketRoom) return
        gameWebsocketRoom.sendEvent("test", 123)
    }, [gameWebsocketRoom])

    useEffect(() => {
        if (!sessionWebsocketRoom) return
        sessionWebsocketRoom.sendEvent("playerReady", 999)
    }, [sessionWebsocketRoom])

    const eventHandler = (event, data) => {
        switch (event) {
            case "connect":
                console.log("Connection to game server established")
                setQueueState("connected")

                break
            case "callToSession":
                console.log("executing callToSession", data)
                setQueueState("joining")
                setSessionWebsocketRoom(new WebsocketRoom(data, eventHandler))
                break
            case "startGame":
                console.log("recieved map object", data)
                break
        }
    }

    const handlePlay = () => {
        setPath("Queue")

        if (!gameWebsocketRoom) {
            setQueueState("connecting")
            setGameWebsocketRoom(new WebsocketRoom("gameserver", eventHandler))
        }
    }

    return (
        <>
            {path === "Queue" ? (
                <Queue
                    gameWebsocketRoom={gameWebsocketRoom}
                    queueState={queueState}
                />
            ) : (
                <Layout setPath={setPath} path={path} onPlay={handlePlay} />
            )}
        </>
    )
}

export default App
