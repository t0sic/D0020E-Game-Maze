export default class Game {
    constructor(playerIds) {
        console.log(playerIds)

        const randomDecimal = Math.random()
        const randomNumber = Math.floor(randomDecimal * 4) + 1
        this.map = randomNumber
        this.key = 1 // ska sättas till random koordinater av möjliga spawnpoints
        this.players = {
            [playerIds[0]]: "player1",
            [playerIds[1]]: "player2",
        }
        this.time = new Date()
        this.spells = ["placeholder"] // listan ska fyllas med alla platser där spells har spawnat.
    }
}
