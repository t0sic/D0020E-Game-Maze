import React, { useState } from "react"
import Home from "./Home"
import Guide from "./Guide"
import Leaderboard from "./Leaderboard"

const Route = ({ path, setPath }) => {
    switch (path) {
        case "Home":
            return <Home setPath={setPath} />
        case "Guide":
            return <Guide />
        case "Leaderboard":
            return <Leaderboard />
    }
    return <div>404</div>
}

const Layout = ({ path, setPath }) => {
    return (
        <div className="layout">
            <div className="navbar">
                <div onClick={() => setPath("Home")} className="logo"></div>
                <div onClick={() => setPath("Home")} className="title">
                    Magic Maze Quest
                </div>
            </div>
            <div className="content">
                <Route path={path} setPath={setPath} />
            </div>
        </div>
    )
}

export default Layout
