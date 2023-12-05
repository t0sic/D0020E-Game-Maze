import React from "react"
import "../styles/Home.css"

const Home = ({ setPath }) => {
    return (
        <div className="home">
            <div className="buttons">
                <div>
                    <button className="button">Play</button>
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
