import dotenv from "dotenv"
import Webserver from "./webserver/webserver.js"
import Gameserver from "./gameserver/gameserver.js"

// Load environment variables for development
if (process.env.NODE_ENV !== "production") {
    dotenv.config()
}

const webserver = new Webserver(process.env.PORT || 3000)
webserver.start()
const gameserver = new Gameserver(webserver)
