import React from "react"
import "../styles/Queue.css"

const Queue = ({ queueState }) => {
    let stateText

    switch (queueState) {
        case "connecting":
            stateText = "Connecting to game server"
            break
        case "connected":
            stateText = "Waiting for players"
            break
        case "joining":
            stateText = "Joining"
            break
    }

    return (
        <div
            className="queue"
            style={{ background: "url(/assets/background3.png)" }}
        >
            <div className="state">{stateText}...</div>
        </div>
    )
}

export default Queue
