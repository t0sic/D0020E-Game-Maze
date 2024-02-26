export default class Player {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.hasKey = false
        this.isWinner = false
        this.spells = []
        this.effects = []
    }
}
