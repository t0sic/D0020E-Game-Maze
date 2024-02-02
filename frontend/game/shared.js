import config from "../../config.json"

export const createProjectileAnimations = (scene) => {
    scene.anims.create({
        key: "stunAnimation",
        frames: scene.anims.generateFrameNumbers("stun_projectile", {
            start: 0,
            end: 3,
        }),
        frameRate: 10,
        repeat: -1,
    })
    scene.anims.create({
        key: "slowAnimation",
        frames: scene.anims.generateFrameNumbers("slow_projectile", {
            start: 0,
            end: 8,
        }),
        frameRate: 10,
        repeat: -1,
    })
    scene.anims.create({
        key: "confuseAnimation",
        frames: scene.anims.generateFrameNumbers("confuse_projectile", {
            start: 17,
            end: 20,
        }),
        frameRate: 10,
        repeat: -1,
    })
}

export const preload = (scene) => {
    console.log("config", config)

    const { spells, key, player, tiles, maps } = config
    const { confuse, stun, slow, haste } = spells

    // Viles
    scene.load.image("confuse_vile", confuse["vile_asset"])
    scene.load.image("slow_vile", slow["vile_asset"])
    scene.load.image("haste_vile", haste["vile_asset"])
    scene.load.image("stun_vile", stun["vile_asset"])

    // Buttons
    scene.load.image("confuse_button", confuse["button_asset"])
    scene.load.image("slow_button", slow["button_asset"])
    scene.load.image("haste_button", haste["button_asset"])
    scene.load.image("stun_button", stun["button_asset"])

    // Projectiles
    scene.load.spritesheet("slow_projectile", slow["projectile_asset"], {
        frameWidth: 16,
        frameHeight: 16,
    })
    scene.load.spritesheet("stun_projectile", stun["projectile_asset"], {
        frameWidth: 16,
        frameHeight: 16,
    })
    scene.load.spritesheet("confuse_projectile", confuse["projectile_asset"], {
        frameWidth: 12,
        frameHeight: 12,
    })

    // Key
    scene.load.image("key", key["asset"])

    // Player
    scene.load.spritesheet("player", player["asset"], {
        frameWidth: 16,
        frameHeight: 16,
    })

    // Tiles
    scene.load.image("tiles", tiles["asset"])
    scene.load.image("decor", tiles["decor_asset"])

    // Maps
    maps.forEach(({ name, asset }) => scene.load.tilemapTiledJSON(name, asset))
}
