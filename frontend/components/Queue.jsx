import React, { useEffect, useState } from "react"
import "../styles/Queue.css"

const Queue = ({ queueState, onLeave }) => {
    let stateText

    const [rotate, setRotate] = useState(window.innerWidth < window.innerHeight)

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

    useEffect(() => {
        window.addEventListener("resize", () => {
            if (window.innerWidth < window.innerHeight) {
                setRotate(true)
            } else {
                setRotate(false)
            }
        })
    }, [])

    return (
        <div
            className="queue"
            style={{ background: "url(/assets/ui/background3.png)" }}
        >
            <div className="queue-container">
                {rotate && (
                    <div className="queue-rotate-container">
                        <div>Rotate Your Device</div>
                        <div
                            className="queue-rotate"
                            style={{
                                backgroundImage: "url(/assets/ui/rotate.png)",
                            }}
                        ></div>
                    </div>
                )}
                <div className="state">{stateText}...</div>
                <button onClick={onLeave} className="button">
                    Leave
                </button>
            </div>
        </div>
    )
}

export default Queue
