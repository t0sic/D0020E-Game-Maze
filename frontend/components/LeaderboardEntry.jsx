import React, { useState, useEffect } from "react"
import "../styles/Leaderboard.css"

const LeaderboardEntry = ({ leaderboardEntry, setPath }) => {
    const [name, setName] = useState("")

    const { place, score, id } = leaderboardEntry

    const placeText = () => {
        if (place === 1) return "1st"
        if (place === 2) return "2nd"
        if (place === 3) return "3rd"
        return `${place}th`
    }

    const handleSubmit = async () => {
        if (!name || name.length < 3) return

        await fetch("/api/leaderboard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, id }),
        })

        setPath("Leaderboard")
    }

    return (
        <div className="leaderboard-entry">
            <div className="leaderboard-entry-container">
                <h1>New Highscore! {placeText()} Place</h1>
                <p>
                    Congratulations! You have achieved a new highscore and are
                    now in {placeText()} place on the leaderboard with a score
                    of {score}!
                </p>
                <div className="leaderboard-entry-input-group">
                    <label>Enter Name</label>
                    <input
                        onChange={({ target }) => setName(target.value)}
                        value={name}
                    />
                </div>
                <button
                    className="button-primary"
                    style={{ opacity: !name || name.length < 3 ? "0.5" : "1" }}
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    )
}

export default LeaderboardEntry
