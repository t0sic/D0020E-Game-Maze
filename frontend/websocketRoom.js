import { io } from "socket.io-client"

export default class WebsocketRoom {
    constructor(name, eventHandler) {
        this.eventHandler = eventHandler
        this.name = name

        this.namespace = io("/" + name)
        this.namespace.on("connect", this.onConnect)
        this.namespace.onAny(eventHandler)
    }

    sendEvent = (event, data) => {
        console.log("Sending event:", event, data)
        this.namespace.emit(event, data)
    }

    onConnect = (socket) => {
        this.eventHandler("connect", socket)
    }
}
