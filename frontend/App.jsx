import LeaderboardEntry from "./components/LeaderboardEntry.jsx"
import SpectateGame from "./components/SpectateGame.jsx"
import React, { useState, useEffect } from "react"
import Tutorial from "./components/Tutorial.jsx"
import WebsocketRoom from "./websocketRoom.js"
import Layout from "./components/Layout.jsx"
import Queue from "./components/Queue.jsx"
import Game from "./components/Game.jsx"

const App = () => {
    const [path, setPath] = useState("Home")
    const [queueState, setQueueState] = useState("Error")
    const [websocketRoom, setWebsocketRoom] = useState()
    const [isPlayerNew, setIsPlayerNew] = useState(true)
    const [leaderboardEntry, setLeaderboardEntry] = useState()
    const [sessionId, setSessionId] = useState()

    useEffect(() => {
        console.log(sessionStorage.getItem("isPlayerNew"))
        if (sessionStorage.getItem("isPlayerNew") === "false") {
            setIsPlayerNew(false)
        }
    }, [path])

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

    const handleGameEnd = (leaderboardEntry) => {
        sessionStorage.setItem("isPlayerNew", "false")

        if (leaderboardEntry) {
            setLeaderboardEntry(leaderboardEntry)
            setPath("LeaderboardEntry")
        } else {
            setPath("Home")
        }
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
            ) : path === "LeaderboardEntry" ? (
                <LeaderboardEntry
                    leaderboardEntry={leaderboardEntry}
                    setPath={setPath}
                />
            ) : path === "Game" ? (
                <Game
                    sessionId={sessionId}
                    onGameEnd={handleGameEnd}
                    onSessionEnd={handleSessionEnd}
                />
            ) : path === "SpectateGame" ? (
                <SpectateGame
                    sessionId={sessionId}
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
