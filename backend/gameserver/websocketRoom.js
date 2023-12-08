export default class WebsocketRoom {
    constructor(name, eventHandler, io) {
        this.name = name
        this.eventHandler = eventHandler
        this.io = io
        this.namespace = io.of("/" + name)

        this.namespace.on("connection", (socket) => {
            this.onConnection(socket)

            socket.onAny((event, data) => {
                console.log("In namespace: ", name, "sending event:", event)

                this.onEvent(socket, event, data)
            })

            socket.on("disconnect", () => {
                this.onDisconnect(socket)
            })
        })
    }

    onConnection = (socket) => {
        this.eventHandler(socket, "connection", socket.userId)
    }
    onDisconnect = (socket) => {
        this.eventHandler(socket, "disconnect", socket.userId)
    }
    onEvent = (socket, event, data) => {
        this.eventHandler(socket, event, data)
    }

    sendEvent = (event, data) => {
        console.log("Sending event:", event, data)
        this.namespace.emit(event, data)
    }
}
