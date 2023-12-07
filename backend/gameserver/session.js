import WebsocketRoom from "./websocketRoom.js"

export default class Session {
    constructor(spectator, gameserver, id) {
        this.spectator = spectator
        this.gameserver = gameserver
        const io = gameserver.webserver.io
        this.websocketRoom = new WebsocketRoom(id, this.eventHandler, io) // needs to create websocket room with id
        this.state = "Not Started"
        this.id = id
    }

    eventHandler = (socket, event, data) => {
        console.log("new event in Session", socket.id, event, data)

        switch (event) {
            case "movePlayer":
                this.onPlayerMove()
                break
            case "playerLeft":
                this.onLeave()
                break
        }
    }

    onPlayerMove = () => {}

    onLeave = () => {}
}
