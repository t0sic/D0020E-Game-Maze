class Session {
    constructor(spectator, gameServer, id, users) {
        this.spectator = spectator
        //this.webSocketRoom = websocketRoom // needs to create websocket room with id
        this.state = "Not Started"
        this.gameServer = gameServer
        this.id = id
        this.users = users
    }
}
