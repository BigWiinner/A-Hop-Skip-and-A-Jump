class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                     // Packed tilemap
        this.load.image("tilemap_tiles2", "tilemap_packed2.png");
        this.load.image("tilemap_backgrounds", "tilemap-backgrounds_packed.png");
        this.load.tilemapTiledJSON("platformer-level-1", "Platform-Project-Level1.tmj");   // Tilemap in JSON

        // Load the tilemaps as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("tilemap_sheet2", "tilemap_packed2.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("tilemap_sheet_background", "tilemap-backgrounds_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // audio for jump
        this.load.audio("sfx_jump", "Jump_1.wav");

        // audio for powerup
        this.load.audio("sfx_powerup", "Powerup.wav");

        // text font
        this.load.bitmapFont("blockFont", "Kenny_Block_Font_0.png", "Kenny_Block_Font.fnt");

        // particles for movement
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    update() {}
}