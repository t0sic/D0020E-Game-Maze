import React from "react"
import "../styles/Queue.css"

const Queue = ({ queueState, onLeave }) => {
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
        case "ended":
            stateText = "Session ended"
    }

    return (
        <div
            className="queue"
            style={{ background: "url(/assets/ui/background3.png)" }}
        >
            <div className="state">{stateText}...</div>
            <button onClick={onLeave} className="button">
                Leave
            </button>
        </div>
    )
}

export default Queue
