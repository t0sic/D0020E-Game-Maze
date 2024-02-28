import { io } from "socket.io-client"

export default class WebsocketRoom {
    constructor(name, eventHandler) {
        this.name = name
        this.eventHandler = eventHandler

        // Connect to the server on the default namespace
        this.socket = io()

        this.socket.on("connect", () => {
            this.onConnect()
            // Optionally, join a room immediately after connecting
            // This requires server-side logic to handle the "joinRoom" event
            this.socket.emit("joinRoom", this.name)
        })

        // Handle disconnection
        this.socket.on("disconnect", () => {
            this.eventHandler("disconnect")
        })

        // Listen for any events and pass them to the event handler
        this.socket.onAny((event, data) => {
            this.eventHandler(event, data)
        })
    }

    sendEvent = (event, data) => {
        console.log(
            "Sending event:",
            event,
            "to room:",
            this.name,
            "with data:",
            data
        )
        // When emitting an event, include the room name so the server knows which room to broadcast to
        // This assumes the server has logic to handle room-specific broadcasting
        this.socket.emit(event, { room: this.name, data: data })
    }

    onConnect = () => {
        // Handle what happens on connection
        this.eventHandler("connect")
    }
}
