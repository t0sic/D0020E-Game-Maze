export const preload = (scene) => {
    scene.load.image("air", "/assets/air.png")
    scene.load.image("water", "/assets/water.png")
    scene.load.image("earth", "/assets/earth.png")
    scene.load.image("fire", "/assets/fire.png")
    scene.load.spritesheet("flame", "/assets/flame_horizontal.png", {
        frameWidth: 12,
        frameHeight: 12,
    })

    scene.load.image("key", "/assets/key.png")
    scene.load.spritesheet("player", "/assets/player.png", {
        frameWidth: 16,
        frameHeight: 16,
    })

    scene.load.image("tiles", "/assets/dungeon_tiles.png")
    scene.load.tilemapTiledJSON("Tilemap1", "/assets/sprint3.json")
}
