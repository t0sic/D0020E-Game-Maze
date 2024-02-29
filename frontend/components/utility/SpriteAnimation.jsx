import React, { useState, useEffect } from "react"
import "/frontend/styles/SpriteAnimation.css"

const SpriteAnimation = ({ frameCount, frameWidth }) => {
    const [frame, setFrame] = useState(0)

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
                backgroundImage: "url(/assets/pickups/key3.png)",
                backgroundPosition: `${xPos}px 0px`,
            }}
        />
    )
}

export default SpriteAnimation
