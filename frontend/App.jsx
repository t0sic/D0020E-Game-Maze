import LeaderboardEntry from "./components/LeaderboardEntry.jsx"
import SpectateGame from "./components/SpectateGame.jsx"
import React, { useState, useEffect } from "react"
import EndScreen from "./components/EndScreen.jsx"
import Tutorial from "./components/Tutorial.jsx"
import Layout from "./components/Layout.jsx"
import Queue from "./components/Queue.jsx"
import Game from "./components/Game.jsx"
import { io } from "socket.io-client"

const App = () => {
    const [leaderboardEntry, setLeaderboardEntry] = useState(false)
    const [queueState, setQueueState] = useState("Error")
    const [isHorizontal, setIsHorizontal] = useState(false)
    const [isPlayerNew, setIsPlayerNew] = useState(true)
    const [endScreenData, setEndScreenData] = useState()
    const [gameData, setGameData] = useState(null)
    const [sessionId, setSessionId] = useState()
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
            socket.on("enableLeaderboardEntry", setLeaderboardEntry)
            setGameData(data)
            setPath("Game")
        })

        const handleOrientationChange = () => {
            if (window.innerWidth < window.innerHeight) {
                setIsHorizontal(false)
            } else {
                setIsHorizontal(true)
            }
        }

        window.addEventListener("orientationchange", handleOrientationChange)
        window.addEventListener("resize", handleOrientationChange)
        handleOrientationChange()

        return () => {
            window.removeEventListener(
                "orientationchange",
                handleOrientationChange
            )
            window.removeEventListener("resize", handleOrientationChange)
        }
    }, [])

    const handleLeaveEndScreen = () => {
        socket.off("enableLeaderboardEntry")

        if (endScreenData.spectator) {
            setPath("Spectate")
        } else {
            if (leaderboardEntry) {
                setPath("LeaderboardEntry")
            } else {
                setPath("Home")
            }
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

    const handleLeaderboardEntryLeave = () => {
        setLeaderboardEntry(null)
        setPath("Leaderboard")
    }

    const handleSpectateLeave = () => {
        setGameData(null)
        setSessionId(null)
        setPath("Spectate")
    }

    const handleSessionEnd = () => {
        setQueueState("ended")
        sessionStorage.setItem("isPlayerNew", "false")

        socket.off("enableLeaderboardEntry")

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
        if (isPlayerNew || !isHorizontal) {
            setPath("Tutorial")
        } else {
            handlePlay()
        }
    }

    console.log("logging registered listeners", socket?._callbacks)

    switch (path) {
        case "LeaderboardEntry":
            return (
                <LeaderboardEntry
                    leaderboardEntry={leaderboardEntry}
                    onLeave={handleLeaderboardEntryLeave}
                />
            )

        case "Queue":
            return <Queue queueState={queueState} onLeave={handleLeave} />
        case "Tutorial":
            return (
                <Tutorial
                    onTutorialExit={handlePlay}
                    isHorizontal={isHorizontal}
                    showWarning={!isHorizontal && isPlayerNew}
                />
            )
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
