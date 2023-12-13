import Spell from "./spell.js"

export default class Player {
    constructor(user, position) {
        // allows setting of spawn position when creating object
        this.user = user
        this.position = position
        this.hasKey = false
        this.spells = []
        this.effects = []
    }

    addSpell(spell) {
        if (!(spell instanceof Spell)) {
            throw new Error(
                "Illegal Argument, Argument must be instance of Spell class",
            )
        }

        switch (spell.type) {
            case "haste":
                this.spells.push(spell)
                console.log(`Added Spell of type: ${spell.type}`)
                break

            case "stun":
                this.spells.push(spell)
                console.log(`Added Spell of type: ${spell.type}`)
                break

            case "slow":
                this.spells.push(spell)
                console.log(`Added Spell of type: ${spell.type}`)
                break

            default:
                console.warn(
                    `Unknown spell type: ${spell.type}. Spell not added.`,
                )
        }
    }

    removeSpell(spell) {
        //TypeCheck
        if (!(spell instanceof Spell)) {
            throw new Error(
                "Illegal Argument, Argument must be instance of Spell class",
            )
        }

        //Finds and removes spell with spelltype
        for (let i = 0; i < this.spells.length; i++) {
            if (this.spells[i].type == spell.type) {
                this.spells.splice(i, 1)
                console.log(`removed spell: ${spell.type}`)
                return
            }
        }
        console.log("spell not found doing nothing")
    }

    setPosition(Coord) {
        this.position = Coord
    }

    setEffect(spell) {
        this.effects.push(spell)
        console.log(`added spell EFFECT: ${spell.type}`)
    }

    removeEffect(spell) {
        for (let i = 0; i < this.effects.length; i++) {
            if (this.effects[i].type == spell.type) {
                this.spells.splice(i, 1)
                console.log(`removed spell EFFECT: ${spell.type}`)
            }
        }
    }
}
