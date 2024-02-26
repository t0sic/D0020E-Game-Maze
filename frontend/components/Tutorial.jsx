import SpriteAnimation from "./utility/SpriteAnimation"
import React, { useState, useEffect } from "react"
import "../styles/Tutorial.css"

const Tutorial = ({ onTutorialExit }) => {
    const [step, setStep] = useState(0)
    const [isHorizontal, setIsHorizontal] = useState(false)
    const [timer, setTimer] = useState(10)

    useEffect(() => {
        const handleOrientationChange = () => {
            if (window.innerWidth < window.innerHeight) {
                setIsHorizontal(false)
            } else {
                setIsHorizontal(true)
            }
        }

        window.addEventListener("orientationchange", handleOrientationChange)
        handleOrientationChange()

        return () => {
            window.removeEventListener(
                "orientationchange",
                handleOrientationChange
            )
        }
    }, [])

    useEffect(() => {
        if (step === 2) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (!prev) return clearInterval(interval)
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [step])

    let stepElements = [
        <div className="tutorial-step">
            <h3>Objective</h3>
            <p>
                You will be playing as a wizard trying to escape a maze by
                finding the key in the maze and then exiting through the door.
                The catch is there is another wizard with the same goals as you,
                but there is only one key. Be the first to get the key and
                escape!
            </p>
            <h3>Find the Key</h3>
            <p>Explore the map and find the key! It looks like this</p>
            <div className="tutorial-sprite">
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
            <h3>Find the Door</h3>
            <p>Once you have the key, find the door to escape the maze!</p>
            <div className="tutorial-sprite">
                <img src="/assets/ui/door.png" width="135px"></img>
            </div>

            <div className="tutorial-skip">
                <button className="button-primary" onClick={() => setStep(1)}>
                    Next
                </button>
            </div>
        </div>,
        <div className="tutorial-step">
            <h3>Controls</h3>
            <p>
                To move your character simply drag the joystick on the screen to
                go in the desired direction
            </p>
            <div className="tutorial-sprite">
                <img src="/assets/ui/joystick-controls.gif" width="100%"></img>
            </div>
            <h3>Spells</h3>
            <p>
                You can cast spells by tapping the spell buttons on the screen.
                The projectile will be shot in the direction you are facing.
            </p>
            <div className="tutorial-sprite">
                <img src="/assets/ui/spellcastGif.gif" width="100%"></img>
            </div>
            <h3>Stun Spell (Important)</h3>
            <p>
                Stuns the opponent for a few seconds as well as makes them drop
                the key if they have it. Always available on a short cooldown
            </p>
            <div className="tutorial-sprite">
                <img src="/assets/ui/stun.png" width="135px"></img>
            </div>
            <h3>Slow Spell</h3>
            <p>
                The slow spell is acquired by picking it up on the map it will
                greatly slow your opponent
            </p>
            <div className="tutorial-sprite">
                <img src="/assets/ui/slow.png" width="135px"></img>
            </div>
            <h3>Confuse</h3>
            <p>
                The confuse spells invers the opponents controls for a few
                seconds
            </p>
            <div className="tutorial-sprite">
                <img src="/assets/ui/confuse.png" width="135px"></img>
            </div>
            <h3>Haste</h3>
            <p>The haste spell makes you incredibly fast</p>
            <div className="tutorial-sprite">
                <img src="/assets/ui/haste.png" width="135px"></img>
            </div>
            <div className="tutorial-skip">
                <button className="button-primary" onClick={() => setStep(2)}>
                    Next
                </button>
            </div>
        </div>,
        <div className="tutorial-step">
            {isHorizontal ? (
                <>
                    <h3>Good luck</h3>
                    <p>
                        You are now ready to play! Remember to use your spells
                        wisely and good luck!
                    </p>
                    <div className="tutorial-skip">
                        <button
                            className="button-primary"
                            onClick={onTutorialExit}
                        >
                            Play
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <h3>Please rotate your device</h3>
                    <p>
                        Magic Maze Quest is best played in landscape mode.
                        Please rotate your device to continue the tutorial.
                    </p>
                    <div className="tutorial-sprite">
                        <img src="/assets/ui/rotate.png" width="100%"></img>
                    </div>
                    <div className="tutorial-skip">
                        <button
                            className="button-primary"
                            onClick={timer ? null : onTutorialExit}
                            style={{ opacity: timer ? "0.5" : "1" }}
                        >
                            Play Anyway {timer ? timer : ""}
                        </button>
                    </div>
                </>
            )}
        </div>,
    ]

    return (
        <div className="tutorial">
            <div className="tutorial-container">
                <h1 className="tutorial-header">
                    Welcome to
                    <br />
                    Magic Maze Quest!
                </h1>
                <p>
                    To help you get started, we've prepared a short tutorial to
                    guide you through your first game.
                </p>

                {stepElements[step]}
            </div>
        </div>
    )
}

export default Tutorial
