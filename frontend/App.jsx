import React, { useState, useEffect } from "react"
import Tutorial from "./components/Tutorial.jsx"
import Layout from "./components/Layout.jsx"
import Queue from "./components/Queue.jsx"
import Game from "./components/Game.jsx"
import { io } from "socket.io-client"

const App = () => {
    const [queueState, setQueueState] = useState("Error")
    const [isPlayerNew, setIsPlayerNew] = useState(false)
    const [gameData, setGameData] = useState(null)
    const [socket, setSocket] = useState(null)
    const [path, setPath] = useState("Home")

    useEffect(() => {
        if (sessionStorage.getItem("isPlayerNew") === "false") {
            setIsPlayerNew(false)
        }
    }, [path])

    useEffect(() => {
        const socket = io("/gameserver")

        socket.on("connect", () => {
            setSocket(socket)
        })

        socket.on("startGame", (data) => {
            setGameData(data)
            setPath("Game")
        })
    }, [])

    const handlePlay = () => {
        if (!socket) return

        setPath("Queue")

        setQueueState("connected")
        socket.emit("joinQueue")
    }

    const handleLeave = () => {
        if (!socket) return

        socket.emit("leaveQueue")

        setPath("Home")
    }

    const handleGameEnd = (leaderboardEntry) => {
        sessionStorage.setItem("isPlayerNew", "false")

        setPath("Home")
    }

    const handleSessionEnd = () => {
        setQueueState("ended")
        sessionStorage.setItem("isPlayerNew", "false")
        setPath("Queue")
    }

    const handleSetSessionId = (id) => {
        setSessionId(id)
        setPath("SpectateGame")
    }

    const handlePlayClick = () => {
        if (isPlayerNew) {
            setPath("Tutorial")
        } else {
            handlePlay()
        }
    }

    return (
        <>
            {path === "Queue" ? (
                <Queue queueState={queueState} onLeave={handleLeave} />
            ) : path === "Tutorial" ? (
                <Tutorial onTutorialExit={handlePlay} />
            ) : path === "Game" ? (
                <Game
                    socket={socket}
                    gameData={gameData}
                    onGameEnd={handleGameEnd}
                    onSessionEnd={handleSessionEnd}
                />
            ) : (
                <Layout
                    setPath={setPath}
                    path={path}
                    onPlay={handlePlayClick}
                    handleSetSessionId={handleSetSessionId}
                />
            )}
        </>
    )
}

export default App
