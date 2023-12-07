export default class Game {
    constructor() {
        const randomNumber = Math.floor(randomDecimal * 4) + 1
        this.map = randomNumber
        this.key = 1 // ska sättas till random koordinater av möjliga spawnpoints
        this.players = {}
        this.time = new Date()
        this.spells = ["placeholder"] // listan ska fyllas med alla platser där spells har spawnat.
    }
}
