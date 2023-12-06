export default class WebsocketRoom {
    constructor(name, eventHandler, io) {
        this.name = name
        this.eventHandler = eventHandler
        this.io = io
        this.namespace = io.of("/" + name)
    }
    onConnection() {
        this.namespace.on("connection", (socket) => {
            console.log("connected", socket)
        })
    }
    onDisconnect() {}
    onEvent() {}
}
