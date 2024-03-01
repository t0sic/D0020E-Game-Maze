import SpectateGame from "./components/SpectateGame.jsx"
import React, { useState, useEffect } from "react"
import EndScreen from "./components/EndScreen.jsx"
import Tutorial from "./components/Tutorial.jsx"
import Layout from "./components/Layout.jsx"
import Queue from "./components/Queue.jsx"
import Game from "./components/Game.jsx"
import { io } from "socket.io-client"

const App = () => {
    const [queueState, setQueueState] = useState("Error")
    const [isPlayerNew, setIsPlayerNew] = useState(true)
    const [gameData, setGameData] = useState(null)
    const [socket, setSocket] = useState(null)
    const [path, setPath] = useState("Home")
    const [endScreenData, setEndScreenData] = useState()
    const [sessionId, setSessionId] = useState()

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

    const handleLeaveEndScreen = () => {
        if (endScreenData.spectator) {
            setPath("Spectate")
        } else {
            setPath("Home")
        }
        setEndScreenData(null)
    }

    const handlePlay = () => {
        if (!socket) return

        setPath("Queue")

        setQueueState("connected")
        socket.emit("joinQueue")
    }

    const handleLeave = () => {
        if (!socket) return

        if (sessionId) {
            setSessionId(null)
            setGameData(null)
            setPath("Spectate")
        } else {
            socket.emit("leaveQueue")
            setPath("Home")
        }
    }

    const handleGameEnd = (data) => {
        setEndScreenData(data)
        setGameData(null)
        setSessionId(null)
        sessionStorage.setItem("isPlayerNew", "false")

        setPath("EndScreen")
    }

    const handleSpectateLeave = () => {
        setGameData(null)
        setSessionId(null)
        setPath("Spectate")
    }

    const handleSessionEnd = () => {
        setQueueState("ended")
        sessionStorage.setItem("isPlayerNew", "false")

        setPath("Queue")
    }

    const handleSetSessionId = (id) => {
        setSessionId(id)
        setPath("SpectateGame")
        console.log("emitting session id: ", id)
        socket.on("gameData", (data) => {
            setGameData(data)
            setPath("SpectateGame")
        })
        socket.emit("spectate", id)
    }

    const handlePlayClick = () => {
        if (isPlayerNew) {
            setPath("Tutorial")
        } else {
            handlePlay()
        }
    }

    console.log("renders")
    console.log("logging registered listeners", socket?._callbacks)

    switch (path) {
        case "Queue":
            return <Queue queueState={queueState} onLeave={handleLeave} />
        case "Tutorial":
            return <Tutorial onTutorialExit={handlePlay} />
        case "Game":
            return (
                <Game
                    socket={socket}
                    gameData={gameData}
                    onGameEnd={handleGameEnd}
                    onSessionEnd={handleSessionEnd}
                />
            )
        case "EndScreen":
            return (
                <EndScreen
                    endScreenData={endScreenData}
                    onLeave={handleLeaveEndScreen}
                />
            )
        case "SpectateGame":
            if (!socket || !sessionId || !gameData) return
            return (
                <SpectateGame
                    socket={socket}
                    gameData={gameData}
                    setGameData={setGameData}
                    onGameEnd={handleGameEnd}
                    onLeave={handleSpectateLeave}
                    onSessionEnd={handleSessionEnd}
                />
            )
        default:
            return (
                <Layout
                    setPath={setPath}
                    path={path}
                    onPlay={handlePlayClick}
                    handleSetSessionId={handleSetSessionId}
                    socket={socket}
                />
            )
    }
}

export default App
