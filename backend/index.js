import dotenv from "dotenv"
import Webserver from "./webserver/webserver.js"

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
}

// Load environment variables for development
if (process.env.NODE_ENV !== "production") {
    dotenv.config()
}

const webserver = new Webserver(process.env.PORT || 3000)
webserver.start()
