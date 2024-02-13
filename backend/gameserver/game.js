import Player from "./player.js"
import config from "../../config.json" assert { type: "json" }

export default class Game {
    constructor(playerIds) {
        const { maps, spells } = config
        const spellTypes = Object.keys(spells)

        this.map = maps.random()

        const spawnpoints = this.map.spawnpoints.random()

        this.map.key = spawnpoints.key

        this.spells = [...this.map.spells].map((spell) => ({
            ...spell,
            spellType: spellTypes.random(),
        }))
        this.players = {
            [playerIds[0]]: new Player(
                spawnpoints.players[0].x,
                spawnpoints.players[0].y,
            ),
            [playerIds[1]]: new Player(
                spawnpoints.players[1].x,
                spawnpoints.players[1].y,
            ),
        }
    }
}
