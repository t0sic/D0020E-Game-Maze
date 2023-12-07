export default class WebsocketRoom {
    constructor(name, eventHandler, io) {
        this.name = name
        this.eventHandler = eventHandler
        this.io = io
        this.namespace = io.of("/" + name)

        this.namespace.on("connection", (socket) => {
            this.onConnection(socket)

            socket.onAny((event, data) => {
                this.onEvent(socket, event, data)
            })

            socket.on("disconnect", () => {
                this.onDisconnect(socket)
            })
        })
    }

    onConnection = (socket) => {
        this.eventHandler(socket.id, "connection", socket.userId)
    }
    onDisconnect = (socket) => {
        this.eventHandler(socket.id, "disconnect", socket.userId)
    }
    onEvent = (socket, event, data) => {
        this.eventHandler(socket.id, event, data)
    }
}
