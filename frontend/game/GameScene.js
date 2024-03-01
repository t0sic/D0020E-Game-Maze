import {
    preload,
    createProjectileAnimations,
    createKeyAnimations,
} from "./shared.js"
import eventEmitter from "../eventEmitter.js"
import Player from "./Player.js"
import Phaser from "phaser"
import Map from "./Map.js"

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" })
        this.socketListeners = [
            "keyPickup",
            "spellPickup",
            "updateScore",
            "castSpell",
            "playerWon",
            "dropKey",
            "spawnSpell",
            "sessionEnded",
            "updatePlayerPosition",
            "gameData",
            "applySpellEffect",
        ]
    }

    preload = () => {
        preload(this)
    }

    init = () => {
        this.socket = this.registry.get("socket")
        this.projectiles = this.add.group()
        this.spells = []
    }

    create = () => {
        this.map = new Map(this)

        createProjectileAnimations(this)
        createKeyAnimations(this)

        eventEmitter.on("setGameData", this.setGameData)
        eventEmitter.emit("sceneCreated")
    }

    setGameData = (gameData) => {
        this.gameData = gameData

        const { players, map, spells } = this.gameData
        const ids = Object.keys(players)

        this.opponentId = ids[0] === this.socket.id ? ids[1] : ids[0]

        this.map.createMap(map.name)

        this.player = new Player(
            this,
            players[this.socket.id].x,
            players[this.socket.id].y,
            true,
            ids[0] === this.socket.id ? "opponent" : "player"
        )
        this.opponent = new Player(
            this,
            players[this.opponentId].x,
            players[this.opponentId].y,
            false,
            ids[1] === this.socket.id ? "opponent" : "player"
        )

        this.opponent.playIdleAnimation(new Phaser.Math.Vector2(1, 0))

        this.opponent.opponent = this.player
        this.player.opponent = this.opponent

        this.map.addCollisions([this.player])

        this.socket.on(
            "updatePlayerPosition",
            this.opponent.updatePlayerPosition
        )
        this.socket.on("keyPickup", this.onKeyPickup)
        this.socket.on("spellPickup", this.map.destroySpell)
        this.socket.on("updateScore", this.setOpponetScore)
        //this.socket.on("onSpellButtonClicked", this.player.onSpellButtonClicked)
        this.socket.on("castSpell", this.opponent.castSpell)
        this.socket.on("playerWon", this.onPlayerWon)
        this.socket.on("dropKey", this.onKeyDrop)
        this.socket.on("spawnSpell", this.createSpell)
        this.socket.on("sessionEnded", this.endSession)
        this.socket.on("applySpellEffect", ({ spellType }) => {
            console.log("spelltype : ", spellType)
            this.player.applySpellEffect(spellType, this.player)
        })

        eventEmitter.on(
            "onSpellButtonClicked",
            this.player.onSpellButtonClicked
        )

        this.scene
            .get("UIScene")
            .events.on("joystickMove", this.player.joystickMove)

        this.addCamera()

        spells.forEach((spell) => this.map.createSpell(spell, [this.player]))

        this.map.createKey(map.key.x, map.key.y, [this.player])
    }

    applySpellEffect = (projectile) => {
        console.log("oweeee, i have been hit by", projectile)
    }

    endSession = () => {
        this.removeAllGameListeners()
        eventEmitter.emit("sessionEnded")
    }

    removeAllGameListeners = () => {
        this.socketListeners.forEach((event) => {
            // Deregisters All socket listeners related to gamescene for this client.
            this.socket.off(event)
        })
    }

    createSpell = (spell) => {
        const newSpell = this.map.createSpell(spell, [this.player])

        this.spells.push(newSpell)
    }

    onKeyDrop = (coords) => {
        this.map.createKey(coords.x, coords.y, [this.player])
        eventEmitter.emit("onObjectiveData", "key")
    }

    onKeyPickup = () => {
        this.opponent.hasKey = true
        eventEmitter.emit("onObjectiveData", "opponent")
        this.map.destroyKey()
    }

    addCamera = () => {
        const camera = this.cameras.main
        camera.startFollow(this.player)
        camera.setZoom(5)
    }

    handleDoorCollision = (_player, _tile) => {
        if (this.player.hasKey) {
            this.socket.emit("playerWon", this.player.score)
            this.onPlayerWon(true)
        }
    }

    onPlayerWon = (isWinner) => {
        this.socketListeners.forEach((event) => {
            this.socket.off(event)
        })
        eventEmitter.emit("gameEnded", {
            isWinner: isWinner === true,
            score: this.player.score,
        })
    }
}

export default GameScene
