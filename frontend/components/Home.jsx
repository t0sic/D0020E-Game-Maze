import React from "react"
import "../styles/Home.css"

const Home = ({ setPath, onPlay }) => {
    const isComputer = window.innerWidth > 900

    return (
        <div className="home">
            <div className="buttons">
                <button className="button-primary" onClick={onPlay}>
                    Play
                </button>
                <div className="button-group">
                    <button className="button" onClick={() => setPath("Guide")}>
                        Guide
                    </button>
                    <button
                        className="button"
                        onClick={() => setPath("Leaderboard")}
                    >
                        Leaderboard
                    </button>
                </div>
                {isComputer && (
                    <button
                        className="button"
                        onClick={() => setPath("Spectate")}
                    >
                        Spectate
                    </button>
                )}
            </div>
        </div>
    )
}

export default Home

{
    /* <button onClick={onPlay} className="button">
                    Play
                </button>
                <div className="button-group">
                    <button onClick={() => setPath("Guide")} className="button">
                        Guide
                    </button>
                    <button
                        onClick={() => setPath("Leaderboard")}
                        className="button"
                    >
                        Leaderboard
                    </button>
                </div>
                {isComputer && (
                    <button
                        className="button"
                        onClick={() => setPath("Spectate")}
                    >
                        Spectate
                    </button>
                )}
            </div> */
}
