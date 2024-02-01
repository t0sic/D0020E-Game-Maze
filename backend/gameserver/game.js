import Player from "./player.js"

export default class Game {
    constructor(playerIds) {
        const spellTypes = ["stun", "slow", "haste", "confuse"] //Röd = stun, grön= haste, blå=slow ljusblå=confuse
        const maps = [
            {
                asset: "Tilemap1",
                spells: [
                    { x: 100, y: 150 },
                    { x: 101, y: 150 },
                    { x: 102, y: 150 },
                    { x: 103, y: 150 },
                    { x: 104, y: 150 },
                    { x: 105, y: 150 },
                    { x: 105, y: 150 },
                    { x: 105, y: 150 },
                    { x: 105, y: 150 },
                    { x: 105, y: 150 },
                    { x: 105, y: 150 },
                    { x: 105, y: 150 },
                    { x: 105, y: 150 },
                    { x: 206, y: 200 },
                ],
                spawnpoints: [
                    { x: 100, y: 100 },
                    { x: 200, y: 100 },
                ],
                key: { x: 50, y: 100 },
            },
        ]

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
