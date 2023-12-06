import cookie from "cookie"

export default class WebsocketRoom {
    constructor(name, eventHandler, io) {
        this.name = name
        this.eventHandler = eventHandler
        this.io = io
        this.namespace = io.of("/" + name)

        this.namespace.on("connection", (socket) => {
            this.onConnection(socket)

            socket.on("disconnect", () => {
                this.onDisconnect(socket)
            })
        })

        this.namespace.use((socket, next) => {
            const cookies = cookie.parse(socket.handshake.headers.cookie)

            if (cookies.userId) {
                socket.userId = cookies.userId
                next()
            }
        })
    }

    onConnection = (socket) => {
        this.eventHandler("connection", socket.userId)
    }
    onDisconnect = (socket) => {
        this.eventHandler("disconnect", socket.userId)
    }
    onEvent = () => {}
}
