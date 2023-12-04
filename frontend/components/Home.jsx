import React from "react"

const Home = ({setPath}) => {
    return (
        <div className="home">
            <button className="button">Play</button>
            <button onClick={() => setPath("Guide")} className="button">Guide</button>
            
            
        </div>
    )
}

export default Home
