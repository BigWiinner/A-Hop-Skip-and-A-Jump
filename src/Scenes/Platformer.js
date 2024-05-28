class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.VELOCITY = 200;
        this.MAXVELOCITY = 175;
        this.ACCELERATION = 6;
        this.DRAG = 600;
        this.physics.world.gravity.y = 450;
        this.JUMP_VELOCITY = -250
        this.PARTICLE_VELOCITY = 25;
        this.SCALE = 1.5;
        this.win = false;
        this.enterKey = null;
        this.totalJumps = 1;
        this.currJumps = 1;
        this.timer = 0;
    }

    preload() {
        this.load.scenePlugin("AnimatedTiles", "./lib/AnimatedTiles.js", "animatedTiles", "animatedTiles");
    }

    create() {
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 45);

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.tileset = this.map.addTilesetImage("AutumnFarm_tilemap_packed", "tilemap_tiles");
        this.tileset2 = this.map.addTilesetImage("Regular_tilemap_packed", "tilemap_tiles2");
        this.backgroundSet = this.map.addTilesetImage("backgrounds_packed", "tilemap_backgrounds");

        this.helper = this.map.createFromObjects("Helper", {
            name: "help",
            key: "tilemap_sheet",
            frame: 5
        });

        this.background = this.map.createLayer("background", this.backgroundSet, 0, 0);
        this.background.setScrollFactor(0.25, 1);
        this.groundLayer2 = this.map.createLayer("ground-n-objects2", this.tileset2, 0, 0);
        this.groundLayer2.setCollisionByProperty({
            collides: true
        });
        this.groundLayer1 = this.map.createLayer("ground-n-objects1", this.tileset, 0, 0);
        this.groundLayer1.setCollisionByProperty({
            collides: true
        });
        
        this.pumpkin = this.map.createFromObjects("End-Condition", {
            name: "pumpkin",
            key: "tilemap_sheet",
            frame: 5
        });

        this.carrot = this.map.createFromObjects("Power-Ups", {
            name: "carrot",
            key: "tilemap_sheet",
            frame: 56
        })

        this.flags = this.map.createLayer("flags-n-keys", this.tileset, 0, 0);

        my.sprite.player = this.physics.add.sprite(130, 350, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.water = this.map.createLayer("water", this.tileset2, 0, 0);

        this.physics.world.enable(this.pumpkin, Phaser.Physics.Arcade.STATIC_BODY);
        this.pumpkinGroup = this.add.group(this.pumpkin);
        
        this.physics.world.enable(this.helper, Phaser.Physics.Arcade.STATIC_BODY);
        this.helperGroup = this.add.group(this.helper);

        this.physics.world.enable(this.carrot, Phaser.Physics.Arcade.STATIC_BODY);
        this.carrotGroup = this.add.group(this.carrot);

        this.animatedTiles.init(this.map);

        this.physics.world.TILE_BIAS = 36;

        this.physics.add.collider(my.sprite.player, this.groundLayer2);
        this.physics.add.collider(my.sprite.player, this.groundLayer1);
        this.physics.add.collider(my.sprite.player, this.flags);

        this.animatedTiles.init(this.map);

        cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(my.sprite.player, this.pumpkinGroup, (obj1, obj2) => {
            this.win = true;
        });

        this.physics.add.overlap(my.sprite.player, this.helperGroup, (obj1, obj2) => {
            this.timer = 30;
        });

        this.physics.add.overlap(my.sprite.player, this.carrotGroup, (obj1, obj2) => {
            obj2.destroy();
            this.totalJumps += 1;
            this.sound.play("sfx_powerup");
        });

        
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_02.png', 'dirt_03.png'],
            scale: {start: 0.02, end: 0.05},
            maxAliveParticles: 4,
            lifespan: 150,
            gravityY: -100,
            alpha: {start: 1, end: 0.1},
        });

        my.vfx.walking.stop();
        
        // Removes debug borders
        this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
        //this.physics.world.debugGraphic.clear()

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 100);
        this.cameras.main.startFollow(my.sprite.player, true, 1, 0.25, -150, 20); // (target, [,roundPixels][,lerpX][,lerpY], x offset, y offset)
        this.cameras.main.setDeadzone(30, 30);
        this.cameras.main.setZoom(this.SCALE);

        my.text.levelComplete = this.add.bitmapText(this.map.widthInPixels - 425, 100, "blockFont", "         Level complete! \nPress ENTER to restart");
        my.text.levelComplete.visible = false;

        my.text.info = this.add.bitmapText(195, 300, "blockFont", "      Collect carrots to \n        gain more jumps!\nHelp me find my friend!").setScale(0.5);
        my.text.info.visible = false;

        my.text.found = this.add.bitmapText(this.map.widthInPixels - 135, 20, "blockFont", "You found me!").setScale(0.5);
        my.text.found.visible = false;
    }

    update() {
        // Player falls off of map, loses!
        if (my.sprite.player.y > game.config.height && !this.win) {
            // Probably should display some text and stuff
            this.scene.restart();
        }
        if (this.timer > 0) {
            my.text.info.setVisible(true);
            this.timer--;
        } else {
            my.text.info.setVisible(false);
        }
        if(cursors.left.isDown) {
            my.sprite.player.setVelocityX(-this.VELOCITY);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
            else {
                my.vfx.walking.stop();
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setVelocityX(this.VELOCITY);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
            else {
                my.vfx.walking.stop();
            }

        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        } else {
            this.currJumps = this.totalJumps;
        }
        if (!my.sprite.player.body.blocked.down && this.currJumps != 0 && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (this.currJumps === this.totalJumps){
                this.currJumps--;
            }
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.currJumps--;
            this.sound.play("sfx_jump");
        }
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.currJumps = this.totalJumps - 1;
            this.sound.play("sfx_jump");
        }

        if (this.win) {
            my.text.levelComplete.setVisible(true);
            my.text.found.setVisible(true);
            this.cameras.main.stopFollow();
            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.scene.restart();
            }
        }
    }
}