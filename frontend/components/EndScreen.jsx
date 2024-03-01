import "../styles/EndScreen.css"
import React from "react"

const EndScreen = ({
    endScreenData: { winner, spectator, score, isWinner },
    onLeave,
}) => {
    return (
        <div className="endscreen">
            <div className="endscreen-container">
                <div className="endscreen-header">
                    <h1>Game Over</h1>
                    {spectator ? (
                        <h2>{winner} won the game!</h2>
                    ) : (
                        <h2>{isWinner ? "You Win!" : "You Lose!"}</h2>
                    )}
                </div>
                <p>
                    {isWinner
                        ? "Congratulations! You have successfully escaped the maze!"
                        : "Better luck next time!"}
                </p>
                <div className="endscreen-details">
                    {!spectator && (
                        <h2>
                            Your Score: <span>{score}</span>
                        </h2>
                    )}
                    <button className="button-primary" onClick={onLeave}>
                        Leave
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EndScreen
