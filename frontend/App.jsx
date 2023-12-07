import React, { useState } from "react"
import Layout from "./components/Layout.jsx"
import WebsocketRoom from "./websocketRoom.js"
import Queue from "./components/Queue.jsx"

const App = () => {
    const [path, setPath] = useState("Home")
    const [gameserver, setGameserver] = useState({
        room: null,
        state: "",
    })

    const eventHandler = (event, socket) => {
        switch (event) {
            case "connect":
                console.log("Connection to game server established")
                setGameserver({ state: "connected" })
                break
        }
    }

    const handlePlay = () => {
        setPath("Queue")

        if (!gameserver.room) {
            const room = new WebsocketRoom("gameserver", eventHandler)

            setGameserver({ room, state: "connecting" })
        }
    }

    return (
        <>
            {path === "Queue" ? (
                <Queue gameserver={gameserver} />
            ) : (
                <Layout setPath={setPath} path={path} onPlay={handlePlay} />
            )}
        </>
    )
}

export default App
