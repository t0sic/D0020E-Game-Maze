import React, { useState } from "react"
import Home from "./Home"
import Guide from "./Guide"
import Leaderboard from "./Leaderboard"
import Spectate from "./Spectate"

const Route = ({ path, setPath, onPlay, handleSetSessionId }) => {
    switch (path) {
        case "Home":
            return <Home setPath={setPath} onPlay={onPlay} />
        case "Guide":
            return <Guide />
        case "Leaderboard":
            return <Leaderboard />
        case "Spectate":
            return <Spectate handleSetSessionId={handleSetSessionId} />
    }
    return <div>404</div>
}

const Layout = ({ path, setPath, onPlay, handleSetSessionId }) => {
    return (
        <div className="layout">
            <div className="navbar">
                <div onClick={() => setPath("Home")} className="logo"></div>
                <div onClick={() => setPath("Home")} className="title">
                    Magic Maze Quest
                </div>
            </div>
            <div className="content">
                <Route
                    path={path}
                    handleSetSessionId={handleSetSessionId}
                    onPlay={onPlay}
                    setPath={setPath}
                />
            </div>
        </div>
    )
}

export default Layout
