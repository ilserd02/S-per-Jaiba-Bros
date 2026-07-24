// --- CONFIGURACIÓN PRINCIPAL DE PHASER ---
const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 240,
  pixelArt: true, // Mantiene los píxeles nítidos sin desenfoque
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);

// --- ESCENA PRINCIPAL DEL JUEGO ---
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // --- BLOQUES Y SUELO ---
    this.load.image('floorbricks', 'assets/brick.png');
    this.load.image('stone', 'assets/stone.png');
    this.load.image('mysteryBox', 'assets/block.png');
    this.load.image('emptyBox', 'assets/block-empty.png');
    this.load.image('platform', 'assets/platform.png');

    // --- TUBERÍAS ---
    this.load.image('tube-small', 'assets/pipe-small.png');
    this.load.image('tube-medium', 'assets/pipe-medium.png');
    this.load.image('tube-large', 'assets/pipe-large.png');
    this.load.image('tube-horizontal', 'assets/pipe-horizontal.png');

    // --- PERSONAJE Y POWER-UPS ---
    this.load.image('mario', 'assets/jaiba.png');
    this.load.image('mushroom', 'assets/mushroom.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.image('flower', 'assets/flower.png');
    this.load.image('star', 'assets/star.png');

    // --- ENEMIGOS ---
    this.load.spritesheet('goomba', 'assets/goomba.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('koopa', 'assets/koopa.png', { frameWidth: 16, frameHeight: 24 });

    // --- DECORACIÓN Y META ---
    this.load.image('cloud1', 'assets/cloud.png');
    this.load.image('hill', 'assets/hill.png');
    this.load.image('bush', 'assets/bush.png');
    this.load.image('castle', 'assets/castle.png');
    this.load.image('flag', 'assets/flag.png');

    // --- SUBTERRÁNEO Y AGUA ---
    this.load.image('underwater-bg', 'assets/underwater-bg.png');
    this.load.image('water-top', 'assets/water-top.png');
  }

  create() {
    const levelWidth = 1700;

    // --- COLOR DE FONDO (Azul cielo de Mario para evitar pantalla negra) ---
    this.cameras.main.setBackgroundColor('#5c94fc');

    // Música de fondo (si existe)
    if (this.cache.audio.exists('theme') && !this.sound.get('theme')) {
      this.bgMusic = this.sound.add('theme', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    }

    // Decoración de fondo (Nubes)
    for (let x = 100; x < levelWidth; x += 300) {
      if (this.textures.exists('cloud1')) {
        this.add.image(x, 40, 'cloud1').setOrigin(0, 0).setScale(0.15);
      }
    }

    // Grupos físicos
    this.floor = this.physics.add.staticGroup();
    this.mysteryBoxes = this.physics.add.staticGroup();
    this.mushrooms = this.physics.add.group();
    this.goombas = this.physics.add.group();

    this.createAnimations();

    // Cargar nivel 1-1
    this.loadMap1_1();

    // Jugador (Jaiba)
    this.mario = this.physics.add.sprite(50, 100, 'mario')
      .setOrigin(0.5, 0.5)
      .setCollideWorldBounds(true)
      .setGravityY(300);
      
    this.mario.setScale(0.163); 
    this.mario.body.setSize(160, 240);
    this.mario.body.setOffset(56, 300);
    
    this.mario.isBig = false; 
    this.mario.isEating = false; 
    this.mario.isDead = false;

    this.physics.world.setBounds(0, 0, levelWidth, config.height);
    
    // Colisiones
    this.physics.add.collider(this.mario, this.floor);
    this.physics.add.collider(this.mushrooms, this.floor);
    this.physics.add.collider(this.goombas, this.floor);

    // Golpe a Bloques Sorpresa
    this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
      if (mario.body.touching.up) {
        if (boxHit.hasItem) {
          boxHit.hasItem = false;
          if (this.textures.exists('emptyBox')) boxHit.setTexture('emptyBox'); 
          boxHit.refreshBody();

          if (this.cache.audio.exists('sprout')) this.sound.play('sprout');

          const mushroom = this.mushrooms.create(boxHit.x, boxHit.y - 16, 'mushroom');
          mushroom.setOrigin(0.5, 0.5);
          mushroom.setVelocityX(50); 
        } else {
          if (this.cache.audio.exists('bump')) this.sound.play('bump');
        }
      }
    });

    // Recoger Hongo
    this.physics.add.overlap(this.mario, this.mushrooms, (mario, mushroomHit) => {
      if (mario.isEating || mario.isDead) return;
      mushroomHit.destroy(); 
      this.convertirEnGrande(mario);
    });

    // Colisión con Enemigos
    this.physics.add.collider(this.mario, this.goombas, (mario, goombaHit) => {
      if (mario.isEating || mario.isDead) return;
      
      if (mario.body.touching.down && goombaHit.body.touching.up) {
        mario.setVelocityY(-180); 
        if (this.cache.audio.exists('kick')) this.sound.play('kick');
        
        goombaHit.setVelocityX(0);
        goombaHit.body.enable = false;

        this.tweens.add({
          targets: goombaHit,
          alpha: 0,
          duration: 300,
          onComplete: () => { goombaHit.destroy(); }
        });
      } else {
        if (mario.isBig) {
          mario.isBig = false;
          mario.setTexture('mario'); 
          mario.setScale(0.163); 
          mario.body.setSize(160, 240);
          mario.body.setOffset(56, 300);
        } else {
          mario.isDead = true;
          if (this.bgMusic) this.bgMusic.stop();
          mario.body.allowGravity = false;
          mario.body.setVelocity(0, 0);
          
          if (this.cache.audio.exists('gameover')) this.sound.play('gameover');
        }
      }
    });

    // Cámara
    this.cameras.main.setBounds(0, 0, levelWidth, config.height);
    this.cameras.main.startFollow(this.mario);

    this.keys = this.input.keyboard.createCursorKeys();
  }

  loadMap1_1() {
    const mapCreation = [
      { "macro": "Floor", "x": 0, "width": 552 },
      { "thing": "Block", "x": 128, "y": 32 },
      { "thing": "Brick", "x": 160, "y": 32 },
      { "thing": "Block", "x": 168, "y": 32, "contents": "Mushroom" },
      { "thing": "Goomba", "x": 176, "y": 8 },
      { "thing": "Brick", "x": 176, "y": 32 },
      { "thing": "Block", "x": 176, "y": 64 },
      { "thing": "Block", "x": 184, "y": 32 },
      { "thing": "Brick", "x": 192, "y": 32 },
      { "macro": "Pipe", "x": 224, "height": 16 },
      { "macro": "Pipe", "x": 304, "height": 24 },
      { "thing": "Goomba", "x": 340, "y": 8 },
      { "macro": "Pipe", "x": 368, "height": 32 },
      { "thing": "Goomba", "x": 412, "y": 8 },
      { "thing": "Goomba", "x": 422, "y": 8 },
      { "macro": "Pipe", "x": 456, "height": 32 },
      { "macro": "Floor", "x": 568, "width": 120 },
      { "thing": "Brick", "x": 616, "y": 32 },
      { "thing": "Block", "x": 624, "y": 32, "contents": "Mushroom" },
      { "thing": "Brick", "x": 632, "y": 32 },
      { "thing": "Brick", "x": 640, "y": 32 },
      { "thing": "Goomba", "x": 640, "y": 72 },
      { "macro": "Floor", "x": 712, "width": 512 },
      { "thing": "Goomba", "x": 776, "y": 8 },
      { "thing": "Goomba", "x": 788, "y": 8 },
      { "thing": "Koopa", "x": 856, "y": 12 },
      { "thing": "Block", "x": 872, "y": 64, "contents": "Mushroom" },
      { "thing": "Stone", "x": 1072, "y": 8 },
      { "thing": "Stone", "x": 1080, "y": 16, "height": 16 },
      { "thing": "Stone", "x": 1088, "y": 24, "height": 24 },
      { "thing": "Stone", "x": 1096, "y": 32, "height": 32 },
      { "macro": "Floor", "x": 1240, "width": 656 },
      { "macro": "Pipe", "x": 1304, "height": 16 },
      { "thing": "Goomba", "x": 1392, "y": 8 },
      { "macro": "Pipe", "x": 1432, "height": 16 },
      { "thing": "Castle", "x": 1584, "y": 0 }
    ];

    mapCreation.forEach(item => {
      const posX = item.x || 0;
      const posY = config.height - (item.y || 0) - 16;

      if (item.macro === "Floor") {
        for (let x = posX; x < posX + item.width; x += 16) {
          if (this.textures.exists('floorbricks')) {
            this.floor.create(x, config.height - 8, 'floorbricks').setOrigin(0, 0.5).refreshBody();
          }
        }
      } 
      else if (item.macro === "Pipe") {
        let pipeTexture = 'tube-small';
        if (item.height >= 32) pipeTexture = 'tube-large';
        else if (item.height >= 24) pipeTexture = 'tube-medium';

        if (this.textures.exists(pipeTexture)) {
          this.floor.create(posX, config.height - (item.height / 2), pipeTexture).refreshBody();
        }
      } 
      else if (item.thing === "Block") {
        if (this.textures.exists('mysteryBox')) {
          const box = this.mysteryBoxes.create(posX, posY, 'mysteryBox').setOrigin(0, 0.5).refreshBody();
          box.hasItem = (item.contents === "Mushroom");
        }
      } 
      else if (item.thing === "Brick") {
        if (this.textures.exists('floorbricks')) {
          this.floor.create(posX, posY, 'floorbricks').setOrigin(0, 0.5).refreshBody();
        }
      } 
      else if (item.thing === "Stone") {
        if (this.textures.exists('stone')) {
          const h = item.height || 8;
          for (let yOffset = 0; yOffset < h; yOffset += 8) {
            this.floor.create(posX, config.height - 16 - yOffset, 'stone').setOrigin(0, 0.5).refreshBody();
          }
        }
      } 
      else if (item.thing === "Goomba") {
        if (this.textures.exists('goomba')) {
          const goomba = this.goombas.create(posX, config.height - 24 - (item.y || 0), 'goomba').setOrigin(0.5, 0.5);
          goomba.setVelocityX(-40);
          goomba.setCollideWorldBounds(true);
        }
      } 
      else if (item.thing === "Koopa") {
        if (this.textures.exists('koopa')) {
          const koopa = this.goombas.create(posX, config.height - 24 - (item.y || 0), 'koopa').setOrigin(0.5, 0.5);
          koopa.setVelocityX(-35);
          koopa.setCollideWorldBounds(true);
        }
      } 
      else if (item.thing === "Castle") {
        if (this.textures.exists('castle')) {
          this.add.image(posX, config.height - 48, 'castle').setOrigin(0, 1);
        }
      }
    });
  }

  createAnimations() {
    if (!this.anims.exists('goomba-walk') && this.textures.exists('goomba')) {
      this.anims.create({
        key: 'goomba-walk',
        frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
      });
    }
  }

  convertirEnGrande(mario) {
    mario.isBig = true;
    mario.isEating = false;
    mario.body.allowGravity = true; 
    
    if (this.cache.audio.exists('powerup')) this.sound.play('powerup');

    mario.setScale(0.187); 
    mario.y -= 30; 
    mario.body.setSize(160, 180);
    mario.body.setOffset(56, 360);
    mario.body.reset(mario.x, mario.y);
  }

  update() {
    this.goombas.children.iterate(goomba => {
      if (goomba && goomba.body && goomba.body.enable && this.anims.exists('goomba-walk')) {
        goomba.anims.play('goomba-walk', true);
      }
    });

    if (this.mario.isDead || this.mario.isEating) return;

    if (this.keys.left.isDown) {
      this.mario.setVelocityX(-120); 
      this.mario.flipX = true;
    } else if (this.keys.right.isDown) {
      this.mario.setVelocityX(120);  
      this.mario.flipX = false;
    } else {
      this.mario.setVelocityX(0);     
    }

    if (this.keys.up.isDown && this.mario.body.touching.down) {
      this.mario.setVelocityY(-300);
      if (this.cache.audio.exists('jump')) this.sound.play('jump');
    }

    if (this.mario.y >= config.height) {
      this.mario.isDead = true;
      if (this.bgMusic) this.bgMusic.stop();
      if (this.cache.audio.exists('gameover')) this.sound.play('gameover');
    }
  }
}
