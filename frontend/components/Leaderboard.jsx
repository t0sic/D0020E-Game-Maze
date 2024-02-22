import React, { useState, useEffect } from "react"
import "../styles/Leaderboard.css"

const Leaderboard = ({ setPath }) => {
    const [leaderboard, setLeaderboard] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    const fetchLeaderboard = async () => {
        setIsLoading(true)
        const res = await fetch("/api/leaderboard")
        const data = await res.json()
        setLeaderboard(data)
        setIsLoading(false)
    }

    return (
        <div className="leaderboard-wrapper">
            <div className="leaderboard">
                <div className="highscorehead">High Score Leaderboard</div>
                <div className="highscorelist">
                    {isLoading ? (
                        <div className="sepctate-session-loader">
                            Loading...
                        </div>
                    ) : (
                        <>
                            {leaderboard.length ? (
                                <>
                                    {leaderboard.map(({ name, score }, i) => (
                                        <div className="highscore">
                                            <div className="highscore-index">
                                                {i + 1}.
                                            </div>
                                            <div className="highscore-info">
                                                <div>Name</div>
                                                <span>{name}</span>
                                            </div>
                                            <div className="highscore-info">
                                                <div>Score</div>
                                                <span>{score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="sepctate-session-loader">
                                    No highscores yet
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Leaderboard
