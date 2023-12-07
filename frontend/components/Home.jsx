import React from "react"
import "../styles/Home.css"

const Home = ({ setPath, onPlay }) => {
    return (
        <div className="home">
            <div className="buttons">
                <div>
                    <button onClick={onPlay} className="button">
                        Play
                    </button>
                    <button onClick={() => setPath("Guide")} className="button">
                        Guide
                    </button>
                </div>
                <button
                    onClick={() => setPath("Leaderboard")}
                    className="button"
                >
                    Leaderboard
                </button>
            </div>
        </div>
    )
}

export default Home
