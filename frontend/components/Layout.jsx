import React, { useState } from "react"
import Home from "./Home"
import Guide from "./Guide"

const Route = ({ path }) => {
    switch (path) {
        case "Home":
            return <Home />
        case "Guide":
            return <Guide />
    }
    return <div>404</div>
}

const Layout = ({ path }) => {
    return (
        <div className="layout">
            <div className="navbar">
                <div className="logo"></div>
                <div className="title">Magic Maze Quest</div>
            </div>
            <div className="content">
                <Route path={path} />
            </div>
        </div>
    )
}

export default Layout
