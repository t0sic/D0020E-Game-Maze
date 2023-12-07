import React, { useState } from "react"
import "../styles/Leaderboard.css"

const Leaderboard = ({ setPath }) => {
    const [leaderboard, setLeaderboard] = useState([
        { name: "Player 1", score: 3400 },
        { name: "Player 2", score: 3400 },
        { name: "Player 3", score: 3400 },
        { name: "Player 4", score: 3400 },
        { name: "Player 5", score: 3400 },
        { name: "Player 6", score: 3400 },
        { name: "Player 7", score: 3400 },
        { name: "Player 8", score: 3400 },
        { name: "Player 9", score: 3400 },
        { name: "Player 10", score: 3400 },
    ])

    return (
        <div className="leaderboard">
            <div className="highscorehead">High Score Leaderboard</div>
            <ol className="highscorelist">
                {leaderboard.map(({ name, score }) => (
                    <li>
                        {name} : {score}
                    </li>
                ))}
            </ol>
        </div>
    )
}

export default Leaderboard
