import React from "react"

const EndScreen = ({ endScreenData: { score, isWinner }, onLeave }) => {
    return (
        <div>
            {isWinner ? <p>You Won</p> : <p>You lose</p>}
            <h3>Your Score {score}</h3>
            <button onClick={onLeave}>Leave</button>
        </div>
    )
}

export default EndScreen
