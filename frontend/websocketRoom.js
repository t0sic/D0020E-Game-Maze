import { io } from "socket.io-client"

export default class WebsocketRoom {
    constructor(name, eventHandler) {
        this.eventHandler = eventHandler
        this.name = name

        setTimeout(() => {
            this.namespace = io("/" + name)

            this.namespace.on("connect", this.onConnect)

            // On disconnect
            this.namespace.on("disconnect", () => {
                this.eventHandler("disconnect")
            })

            this.namespace.onAny((event, data) =>
                this.eventHandler(event, data)
            )
        }, 1000)
    }

    sendEvent = (event, data) => {
        console.log("Sending event:", event, data)
        this.namespace.emit(event, data)
    }

    onConnect = (socket) => {
        this.eventHandler("connect", socket)
    }
}
