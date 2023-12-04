import config from "../config.json" assert { type: "json" }
import express from "express"
import dotenv from "dotenv"

// Load environment variables for development
if (process.env.NODE_ENV !== "production") {
    dotenv.config()
}

const app = express() // Create webserver
const PORT = process.env["PORT"] || 3000 // Define port

app.use(express.static("public")) // Create static routes

// Start listening on port for connections
app.listen(PORT, () => {
    console.log("Started webserver on port:", PORT)
})
