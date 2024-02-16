import React, { useState, useEffect } from "react"
import "/frontend/styles/SpriteAnimation.css" // Import your CSS
import spritesheet from "/public/assets/pickups/key3.png" // Import your spritesheet

const SpriteAnimation = ({ frameCount, frameWidth }) => {
    const [frame, setFrame] = useState(0)
    console.log(frameCount, frameWidth)

    useEffect(() => {
        const interval = setInterval(() => {
            setFrame((prevFrame) => (prevFrame + 1) % frameCount)
        }, 100) // Change frame every 100ms

        return () => clearInterval(interval)
    }, [frameCount])

    const xPos = -(frame * frameWidth) // Calculate the x position of the background

    return (
        <div
            className="sprite"
            style={{
                backgroundImage: `url(${spritesheet})`,
                backgroundPosition: `${xPos}px 0px`,
            }}
        />
    )
}

export default SpriteAnimation
