import React, { useState, useEffect } from "react"
import "../styles/Spectate.css"

const Spectate = ({ handleSetSessionId }) => {
    const [sessions, setSessions] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchSession()
    }, [])

    const fetchSession = () => {
        setIsLoading(true)
        fetch("/api/sessions")
            .then((res) => res.json())
            .then((data) => {
                setIsLoading(false)
                setSessions(data)
            })
    }

    const getTimestampBetweenDates = (date1, date2) => {
        const diff = Math.abs(date1 - date2)
        const minutes = Math.floor((diff % 3600000) / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        return `${minutes} min ${seconds} seconds`
    }

    return (
        <div className="spectate-container">
            <div className="spectate-inner">
                <div className="spectate-inner-head">
                    <h1>Active Sessions</h1>
                    <button
                        className="spectate-button"
                        style={{ position: "absolute", right: "0" }}
                        onClick={fetchSession}
                    >
                        Refresh
                    </button>
                </div>
                <div className="spectate-session-list">
                    {isLoading ? (
                        <div className="spectate-session-loader">
                            Loading...
                        </div>
                    ) : sessions.length ? (
                        <>
                            {sessions.map((session) => (
                                <div
                                    className="spectate-session"
                                    key={session.id}
                                >
                                    <div className="spectate-session-info">
                                        <div>Session ID</div>
                                        <div>{session.id}</div>
                                    </div>
                                    <div className="spectate-session-info">
                                        <div>Elapsed Game Time</div>
                                        <div>
                                            {getTimestampBetweenDates(
                                                new Date(),
                                                new Date(session.time)
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="spectate-button"
                                        onClick={() =>
                                            handleSetSessionId(session.id)
                                        }
                                    >
                                        Spectate
                                    </button>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="spectate-session-loader">
                            No active sessions
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Spectate
