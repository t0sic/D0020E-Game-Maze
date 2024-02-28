export default class WebsocketRoom {
    constructor(name, eventHandler, io) {
        this.name = name
        this.eventHandler = eventHandler
        this.io = io

        this.io.on("connection", (socket) => {
            socket.join(this.name)

            socket.onAny((event, data) => {
                console.log("In room: ", this.name, "sending event:", event)
                this.onEvent(socket, event, data ? data : {})
            })

            socket.on("disconnect", () => {
                this.onDisconnect(socket)
            })

            this.onConnection(socket)
        })
    }

    closeRoom = () => {
        this.io.disconnectSockets()
        this.io.socketsLeave(this.name)
    }

    onConnection = (socket) => {
        this.onEvent(socket, "connection")
    }

    onDisconnect = (socket) => {
        this.onEvent(socket, "disconnect")
    }

    onEvent = (socket, event, data) => {
        this.eventHandler(socket, event, data ? data : {})
    }

    sendEvent = (event, data) => {
        console.log(
            "Sending event to room:",
            this.name,
            "Event:",
            event,
            "Data:",
            data
        )
        // Emit an event to all sockets in the room
        this.io.to(this.name).emit(event, data)
    }
}
