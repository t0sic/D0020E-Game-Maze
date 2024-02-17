import React from "react"
import "../styles/Guide.css"
import key from "/public/assets/pickups/key.png"
import SpriteAnimation from "./utility/SpriteAnimation"
import door from "/public/assets/ui/door.png"
import joystickControls from "/public/assets/ui/joystick-controls.gif"
import spellcastGif from "/public/assets/ui/spellcastGif.gif"
import stun from "/public/assets/ui/stun.png"
import slow from "/public/assets/ui/slow.png"
import confuse from "/public/assets/ui/confuse.png"
import haste from "/public/assets/ui/haste.png"

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
                <div className="controls">
                    <h1 style={{ textAlign: "center" }}>Controls</h1>
                    <p>
                        To move your character simply drag the joystick on the
                        screen to go in the desired direction
                    </p>
                    <img
                        className="gif joystickControlGif"
                        src={joystickControls}
                    ></img>
                    <h2>Use your spells</h2>
                    <p>
                        As a wizard you are nothing without your spells, touch a
                        spell icon to cast a spell
                    </p>
                    <img className="gif spellcastGif" src={spellcastGif}></img>
                    <p>
                        Here you can see a wizard casting the stun spell. This
                        spell is always always available on a short cooldown,
                        Hitting your opponent with this spell will make them
                        drop the key if they have it!
                    </p>
                    <div className="spell-explanationContainer">
                        <div className="spellinfo spellimage stun">
                            <h5>Stun</h5>
                            <img src={stun} style={{ width: "5rem" }}></img>
                            <p>
                                Stuns the opponent for a few seconds as well as
                                makes them drop the key if they have it. Always
                                available on a short cooldown
                            </p>
                        </div>
                        <div className="spellinfo spellimage slow">
                            <h5>Slow</h5>
                            <img src={slow} style={{ width: "5rem" }}></img>
                            <p>
                                The slow spell is acquired by picking it up on
                                the map it will greatly slow your opponent
                            </p>
                        </div>
                        <div className="spellinfo spellimage confuse">
                            <h5>confuse</h5>
                            <img src={confuse} style={{ width: "5rem" }}></img>
                            <p>
                                The confuse spells invers the opponents controls
                                for a few seconds
                            </p>
                        </div>
                        <div className="spellinfo spellimage haste">
                            <h5>haste</h5>
                            <img src={haste} style={{ width: "5rem" }}></img>

                            <p>The haste spell makes you incredibly fast</p>
                        </div>
                    </div>
                    {/*This container will have all spell icons and explanations */}
                </div>
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
