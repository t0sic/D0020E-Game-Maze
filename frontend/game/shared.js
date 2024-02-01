export const preload = (scene) => {
    scene.load.image("confuse", "/assets/confuse.png")
    scene.load.image("slow", "/assets/slow.png")
    scene.load.image("haste", "/assets/haste.png")
    scene.load.image("stun", "/assets/stun.png")
    scene.load.spritesheet("slow_projectile", "/assets/slow_projectile.png", {
        frameWidth: 16,
        frameHeight: 16,
    })
    scene.load.spritesheet("stun_projectile", "/assets/stun_projectile.png", {
        frameWidth: 38,
        frameHeight: 38,
    })
    scene.load.spritesheet(
        "confuse_projectile",
        "/assets/confuse_projectile.png",
        {
            frameWidth: 12,
            frameHeight: 12,
        }
    )

    scene.load.image("key", "/assets/key.png")
    scene.load.spritesheet("player", "/assets/player.png", {
        frameWidth: 16,
        frameHeight: 16,
    })

    scene.load.image("tiles", "/assets/dungeon_tiles.png")
    scene.load.image("decor", "/assets/decorative.png")

    scene.load.tilemapTiledJSON("Tilemap1", "/assets/sprint1map_1.json")
}
