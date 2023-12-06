import { io } from "socket.io-client"

export default class WebsocketRoom {
    constructor(name, eventHandler) {
        this.eventHandler = eventHandler
        this.name = name

        this.namespace = io("/" + name)
        this.namespace.on("connect", this.onConnect)
    }

    onConnect = (socket) => {
        this.eventHandler("connect", socket)
    }
}
