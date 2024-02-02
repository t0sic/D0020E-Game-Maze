import Player from "./player.js"
import config from "../../config.json" assert { type: "json" }

export default class Game {
    constructor(playerIds) {
        const { maps, spells } = config
        const spellTypes = Object.keys(spells)

        this.map = maps.random()
        this.spells = [...this.map.spells].map((spell) => ({
            ...spell,
            spellType: spellTypes.random(),
        }))

        this.players = {
            [playerIds[0]]: new Player(
                this.map.spawnpoints[0].x,
                this.map.spawnpoints[0].y
            ),
            [playerIds[1]]: new Player(
                this.map.spawnpoints[1].x,
                this.map.spawnpoints[1].y
            ),
        }
    }
}
