import React from "react"
import "../styles/Guide.css"
import key from "/public/assets/pickups/key.png"
import SpriteAnimation from "./utility/SpriteAnimation"
import door from "/public/assets/ui/door.png"

const Guide = () => {
    return (
        <div className="guide">
            <div className="textbox">
                <h1 style={{ textAlign: "center" }}>Objective</h1>
                <div className="text">
                    Welcome, You will be playing as a wizard trying to escape a
                    maze by finding the key in the maze and then exiting through
                    the door. The catch is there is another wizard with the same
                    goals as you, but there is only one key. Be the first to get
                    the key and escape!
                </div>
                <div className="goal-container">
                    <div className="key-animation">
                        <h3>Get This</h3>
                        <div
                            style={{
                                width: "70px",
                                height: "135px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <SpriteAnimation frameCount={5} frameWidth={14} />
                        </div>
                    </div>
                    <div className="arrow">-------------------&gt;</div>
                    <div className="door-image">
                        <h3>Go here</h3>
                        <img src={door} width={"135px"}></img>
                    </div>
                </div>

                <h1 style={{ textAlign: "center" }}>Controls</h1>
            </div>
            <div className="textbox">
                <div className="header">Controlls</div>
                <div className="text">placeholder</div>
                <div className="picture"></div>
            </div>
        </div>
    )
}

export default Guide
