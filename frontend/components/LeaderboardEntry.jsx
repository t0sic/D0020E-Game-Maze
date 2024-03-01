import React, { useState } from "react"
import "../styles/Leaderboard.css"

const LeaderboardEntry = ({ leaderboardEntry, onLeave }) => {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const { place, score, id } = leaderboardEntry

    const placeText = () => {
        if (place === 1) return "1st"
        if (place === 2) return "2nd"
        if (place === 3) return "3rd"
        return `${place}th`
    }

    const handleSubmit = async () => {
        if (!name || name.length < 3) return

        setLoading(true)

        await fetch("/api/leaderboard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, id }),
        })

        onLeave()
    }

    return (
        <div className="leaderboard-entry">
            <div className="leaderboard-entry-container">
                {!loading ? (
                    <>
                        <h1>New Highscore! {placeText()} Place</h1>
                        <p>
                            Congratulations! You have achieved a new highscore
                            and are now in {placeText()} place on the
                            leaderboard with a score of {score}!
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
                            style={{
                                opacity: !name || name.length < 3 ? "0.5" : "1",
                            }}
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </>
                ) : (
                    <h1 style={{ textAlign: "center" }}>Loading...</h1>
                )}
            </div>
        </div>
    )
}

export default LeaderboardEntry
