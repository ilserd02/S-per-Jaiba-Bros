/* global Phaser */

// --- 1. ESCENA DE LA PORTADA (PANTALLA DE TÍTULO ORIGINAL) ---
class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    this.load.image('letrero', 'assets/scenery/letrero.png'); 
    this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
    this.load.image('mario-feli', 'assets/scenery/mario-feli.png'); 

    // Assets de escenario de fondo
    this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
    this.load.image('mountain1', 'assets/scenery/overworld/mountain1.png');
    this.load.image('mountain2', 'assets/scenery/overworld/mountain2.png');
    this.load.image('bush1', 'assets/scenery/overworld/bush1.png');

    // Elementos del juego y coleccionables
    this.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 273, frameHeight: 547 });
    this.load.spritesheet('mysteryBox', 'assets/blocks/overworld/misteryBlock.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('emptyBox', 'assets/blocks/overworld/emptyBlock.png');
    this.load.image('mushroom', 'assets/collectibles/super-mushroom.png');
    this.load.spritesheet('coin', 'assets/collectibles/coin.png', { frameWidth: 16, frameHeight: 16 });
    
    // Tuberías y bloques normales
    this.load.image('tube-small', 'assets/scenery/vertical-small-tube.png');
    this.load.image('tube-medium', 'assets/scenery/vertical-large-tube.png');
    this.load.image('tube-large', 'assets/scenery/vertical-large-tube.png');
    this.load.image('brick', 'assets/blocks/overworld/brick.png'); 

    // Spritesheets adicionales de la jaiba y enemigos
    this.load.spritesheet('mario-grow', 'assets/entities/mario-grown.png', { frameWidth: 273, frameHeight: 547 });
    this.load.spritesheet('jaiba-eating', 'assets/entities/mario-eat.png', { frameWidth: 256, frameHeight: 1024 });
    this.load.spritesheet('mario-dead', 'assets/entities/mario-dead.png', { frameWidth: 273, frameHeight: 547 });
    this.load.spritesheet('goomba', 'assets/entities/overworld/goomba.png', { frameWidth: 16, frameHeight: 16 });

    // Sonidos
    this.load.audio('theme', 'assets/sound/music/overworld.mp3');
    this.load.audio('jump', 'assets/sound/effects/jump.mp3');
    this.load.audio('kick', 'assets/sound/effects/kick.mp3');
    this.load.audio('powerup', 'assets/sound/effects/powerup.mp3');
    this.load.audio('bump', 'assets/sound/effects/bump.mp3');
    this.load.audio('sprout', 'assets/sound/effects/sprout.mp3');
    this.load.audio('gameover', 'assets/sound/music/gameover.mp3');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor('#a9d0f5'); 

    if (this.textures.exists('cloud1')) {
      this.add.image(40, 50, 'cloud1').setOrigin(0.5).setScale(0.12).setAlpha(0.95).setDepth(1);
      this.add.image(130, 25, 'cloud1').setOrigin(0.5).setScale(0.14).setAlpha(0.95).setDepth(1);
      this.add.image(220, 45, 'cloud1').setOrigin(0.5).setScale(0.11).setAlpha(0.95).setDepth(1);
    }

    if (this.textures.exists('mountain1')) {
      this.add.image(45, height - 16, 'mountain1').setOrigin(0.5, 1).setScale(0.15).setDepth(1);
    }
    if (this.textures.exists('mountain2')) {
      this.add.image(210, height - 16, 'mountain2').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
    }
    if (this.textures.exists('bush1')) {
      this.add.image(110, height - 16, 'bush1').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
    }

    for (let x = 0; x < width + 16; x += 16) {
      this.add.image(x, height - 8, 'floorbricks').setDepth(2);
    }

    if (this.textures.exists('mario-feli')) {
      this.add.image(180, height - 75, 'mario-feli').setOrigin(0.5, 0.5).setScale(0.163).setDepth(10); 
    }

    if (this.textures.exists('letrero')) {
      const logo = this.add.image(width / 2, height / 2 - 25, 'letrero').setDepth(10); 
      logo.setScale(180 / logo.width);
    }

    const startText = this.add.text(width / 2, height / 2 + 35, 'PRESS ENTER TO START', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '10px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }
}

// --- 2. ESCENA DEL JUEGO PRINCIPAL ---
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    this.coinsCollected = 0; 
  }

  create() {
    const height = this.scale.height;

    if (this.cache.audio.exists('theme') && !this.sound.get('theme')) {
      this.bgMusic = this.sound.add('theme', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else if (this.bgMusic && !this.bgMusic.isPlaying) {
      this.bgMusic.play();
    }

    this.cameras.main.setBackgroundColor('#a9d0f5'); 

    // --- ESCENARIO NATURAL DE FONDO CLÁSICO ---
    const sceneryPositions = [40, 320, 600, 880, 1160, 1440, 1720, 2000, 2280, 2560, 2840, 3120];
    sceneryPositions.forEach(x => {
      if (this.textures.exists('mountain1')) {
        this.add.image(x, height - 16, 'mountain1').setOrigin(0.5, 1).setScale(0.15).setDepth(1);
      }
      if (this.textures.exists('bush1')) {
        this.add.image(x + 60, height - 16, 'bush1').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
      }
      if (this.textures.exists('mountain2')) {
        this.add.image(x + 160, height - 16, 'mountain2').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
      }
      if (this.textures.exists('cloud1')) {
        this.add.image(x + 30, 45, 'cloud1').setOrigin(0.5).setScale(0.12).setAlpha(0.95).setDepth(1);
        this.add.image(x + 180, 25, 'cloud1').setOrigin(0.5).setScale(0.14).setAlpha(0.95).setDepth(1);
      }
    });

    // --- GRUPOS FÍSICOS ---
    this.floor = this.physics.add.staticGroup();
    this.mysteryBoxes = this.physics.add.staticGroup();
    this.bricks = this.physics.add.staticGroup();
    this.mushrooms = this.physics.add.group();
    this.goombas = this.physics.add.group();

    // --- GENERACIÓN DEL SUELO CON FOSOS ---
    for (let x = 0; x < 1200; x += 16) {
      this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).setDepth(2).refreshBody();
    }
    for (let x = 1232; x < 3500; x += 16) {
      this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).setDepth(2).refreshBody();
    }

    // --- DISTRIBUCIÓN TOTAL DEL NIVEL 1-1 ---

    // 1. Primer bloque sorpresa solitario (CON HONGO)
    this.createMysteryBox(224, config.height - 96, 'mushroom');

    // 2. Fila combinada (Ladrillo-Moneda-Ladrillo-Moneda-Ladrillo)
    this.createBrick(320, config.height - 96);
    this.createMysteryBox(336, config.height - 96, 'coin'); 
    this.createBrick(352, config.height - 96);
    this.createMysteryBox(368, config.height - 96, 'coin'); 
    this.createBrick(384, config.height - 96);
    this.createMysteryBox(352, config.height - 146, 'coin'); // Bloque alto central

    // 3. Tuberías Progresivas Iniciales
    this.floor.create(496, config.height - 32, 'tube-small').setOrigin(0.5, 0.5).setDepth(2).refreshBody();
    this.floor.create(608, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).setDepth(2).refreshBody();
    this.floor.create(720, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).setDepth(2).refreshBody();

    // 4. Cuarta tubería y bloque oculto (CON HONGO)
    this.floor.create(928, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).setDepth(2).refreshBody();
    this.createMysteryBox(1024, config.height - 112, 'mushroom');

    // 5. Estructuras flotantes posteriores
    this.createBrick(1280, config.height - 96);
    this.createBrick(1296, config.height - 96);
    this.createBrick(1312, config.height - 96);
    
    // Grupo de bloques posterior con bloques sorpresa (MONEDAS)
    this.createBrick(1440, config.height - 96);
    this.createMysteryBox(1456, config.height - 96, 'coin');
    this.createMysteryBox(1472, config.height - 96, 'coin');
    this.createBrick(1488, config.height - 96);

    // 6. Escaleras de la pirámide
    this.createBrick(2000, config.height - 32);
    this.createBrick(2016, config.height - 32);
    this.createBrick(2016, config.height - 48);
    this.createBrick(2032, config.height - 32);
    this.createBrick(2032, config.height - 48);
    this.createBrick(2032, config.height - 64);

    this.createBrick(2064, config.height - 64);
    this.createBrick(2064, config.height - 48);
    this.createBrick(2064, config.height - 32);
    this.createBrick(2080, config.height - 48);
    this.createBrick(2080, config.height - 32);
    this.createBrick(2096, config.height - 32);

    this.floor.create(2300, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).setDepth(2).refreshBody();

    // --- GENERACIÓN DE ENEMIGOS ---
    if (!this.anims.exists('goomba-walk') && this.textures.exists('goomba')) {
      this.anims.create({
        key: 'goomba-walk',
        frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
      });
    }

    this.createGoomba(224, config.height - 112); 
    this.createGoomba(352, config.height - 112); 
    this.createGoomba(780, config.height - 40);
    this.createGoomba(810, config.height - 40);
    this.createGoomba(1120, config.height - 40);
    this.createGoomba(1288, config.height - 112);
    this.createGoomba(1304, config.height - 112);
    this.createGoomba(1650, config.height - 40);
    this.createGoomba(1680, config.height - 40);

    // --- ANIMACIONES GENERALES ---
    if (!this.anims.exists('box-shine') && this.textures.exists('mysteryBox')) {
      this.anims.create({
        key: 'box-shine',
        frames: this.anims.generateFrameNumbers('mysteryBox', { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!this.anims.exists('coin-spin') && this.textures.exists('coin')) {
      this.anims.create({
        key: 'coin-spin',
        frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }

    this.mysteryBoxes.children.iterate(box => {
      if (box && this.anims.exists('box-shine')) {
        box.anims.play('box-shine', true);
      }
    });

    this.registerPlayerAnimations();

    // --- JUGADOR ---
    this.mario = this.physics.add.sprite(50, 100, 'mario')
      .setOrigin(0.5, 0.5)
      .setCollideWorldBounds(true)
      .setGravityY(300)
      .setDepth(4);
      
    this.mario.setScale(0.163); 
    this.mario.body.setSize(160, 240);
    this.mario.body.setOffset(56, 300);
    
    this.mario.isBig = false; 
    this.mario.isEating = false; 
    this.mario.isDead = false;

    this.physics.world.setBounds(0, 0, 3500, config.height);

    // --- TEXTO DEL CONTADOR DE MONEDAS (UI FIXED) ---
    this.coinText = this.add.text(16, 16, 'MONEDAS: 0', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '12px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(10).setScrollFactor(0);
    
    // --- COLISIONES ---
    this.physics.add.collider(this.mario, this.floor);
    this.physics.add.collider(this.mario, this.bricks);
    this.physics.add.collider(this.mushrooms, this.floor);
    this.physics.add.collider(this.mushrooms, this.bricks);
    this.physics.add.collider(this.goombas, this.floor);
    this.physics.add.collider(this.goombas, this.bricks);
    this.physics.add.collider(this.goombas, this.mysteryBoxes);

    // Interacción con bloques sorpresa
    this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
      if (mario.body.touching.up) {
        if (boxHit.content !== 'empty') {
          const contentType = boxHit.content;
          boxHit.content = 'empty';
          
          if (this.anims.exists('box-shine')) boxHit.anims.stop();
          if (this.textures.exists('emptyBox')) boxHit.setTexture('emptyBox'); 
          boxHit.refreshBody();

          if (contentType === 'mushroom') {
            if (this.cache.audio.exists('sprout')) this.sound.play('sprout');
            const mushroom = this.mushrooms.create(boxHit.x, boxHit.y - 16, 'mushroom').setDepth(3);
            mushroom.setOrigin(0.5, 0.5);
            mushroom.setVelocityX(50); 
          } 
          else if (contentType === 'coin') {
            if (this.cache.audio.exists('powerup')) this.sound.play('powerup');
            
            // Incrementar contador
            this.coinsCollected++;
            this.coinText.setText('MONEDAS: ' + this.coinsCollected);

            // Crear y animar la moneda saltando
            const animatedCoin = this.add.sprite(boxHit.x, boxHit.y - 12, 'coin').setDepth(3);
            if (this.anims.exists('coin-spin')) animatedCoin.play('coin-spin');

            this.tweens.add({
              targets: animatedCoin,
              y: boxHit.y - 40,
              alpha: 0,
              duration: 400,
              yoyo: true,
              hold: 50,
              onComplete: () => { animatedCoin.destroy(); }
            });
          }
        } else {
          if (this.cache.audio.exists('bump')) this.sound.play('bump');
        }
      }
    });

    // Obtener Hongo
    this.physics.add.overlap(this.mario, this.mushrooms, (mario, mushroomHit) => {
      if (mario.isEating || mario.isDead) return;
      mushroomHit.destroy(); 
      
      if (!mario.isBig) {
        mario.isEating = true;
        mario.setVelocity(0, 0);
        mario.body.allowGravity = false; 
        
        if (this.cache.audio.exists('bump')) this.sound.play('bump');
        
        if (this.textures.exists('jaiba-eating') && this.anims.exists('jaiba-eat-mushroom')) {
          mario.setTexture('jaiba-eating');
          mario.body.setSize(160, 240);
          mario.body.setOffset(48, 760);
          mario.anims.play('jaiba-eat-mushroom');

          mario.once('animationcomplete-jaiba-eat-mushroom', () => {
            this.convertirEnGrande(mario);
          });
        } else {
          this.convertirEnGrande(mario);
        }
      }
    });

    // Colisión con Goombas
    this.physics.add.collider(this.mario, this.goombas, (mario, goombaHit) => {
      if (mario.isEating || mario.isDead) return;
      
      if (mario.body.touching.down && goombaHit.body.touching.up) {
        mario.setVelocityY(-180); 
        if (this.cache.audio.exists('kick')) this.sound.play('kick');
        
        goombaHit.setVelocityX(0);
        goombaHit.body.enable = false;
        goombaHit.setFrame(2);

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
          mario.y -= 5;
          mario.body.setSize(160, 240);
          mario.body.setOffset(56, 300);
          mario.body.reset(mario.x, mario.y);
          goombaHit.x += (goombaHit.x > mario.x) ? 30 : -30;
        } else {
          mario.isDead = true;
          if (this.bgMusic) this.bgMusic.stop();
          mario.body.allowGravity = false;
          mario.body.enable = false; 
          
          if (this.cache.audio.exists('gameover')) this.sound.play('gameover');
          
          if (this.textures.exists('mario-dead') && this.anims.exists('jaiba-dead')) {
            mario.setTexture('mario-dead');
            mario.setScale(0.175);
            mario.anims.play('jaiba-dead');
          }

          this.tweens.add({
            targets: mario,
            alpha: 0,
            delay: 1000, 
            duration: 800, 
            onComplete: () => { showGameOverMenu(this); }
          });
        }
      }
    });

    this.cameras.main.setBounds(0, 0, 3500, config.height);
    this.cameras.main.startFollow(this.mario);
    this.keys = this.input.keyboard.createCursorKeys();
  }

  createMysteryBox(x, y, contentType) {
    const box = this.mysteryBoxes.create(x, y, 'mysteryBox').setOrigin(0.5).setDepth(2).refreshBody();
    box.content = contentType; // Puede ser 'mushroom', 'coin' o 'empty'
    return box;
  }

  createBrick(x, y) {
    const texture = this.textures.exists('brick') ? 'brick' : 'floorbricks';
    return this.bricks.create(x, y, texture).setOrigin(0.5).setDepth(2).refreshBody();
  }

  createGoomba(x, y) {
    const goomba = this.goombas.create(x, y, 'goomba').setOrigin(0.5, 0.5).setDepth(3);
    goomba.setVelocityX(-35);
    goomba.setCollideWorldBounds(true);
    goomba.body.setBounce(1, 0); 
    return goomba;
  }

  convertirEnGrande(mario) {
    mario.isBig = true;
    mario.isEating = false;
    mario.body.allowGravity = true; 
    if (this.cache.audio.exists('powerup')) this.sound.play('powerup');

    if (this.textures.exists('mario-grow')) {
      mario.setTexture('mario-grow');
      mario.setScale(0.187); 
    }
    mario.y -= 30; 
    mario.body.setSize(160, 180);
    mario.body.setOffset(56, 360);
    mario.body.reset(mario.x, mario.y);
  }

  registerPlayerAnimations() {
    if (!this.anims.exists('jaiba-walk') && this.textures.exists('mario')) {
      this.anims.create({
        key: 'jaiba-walk',
        frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists('jaiba-idle') && this.textures.exists('mario')) {
      this.anims.create({ key: 'jaiba-idle', frames: [{ key: 'mario', frame: 0 }] });
    }
    if (!this.anims.exists('jaiba-big-walk') && this.textures.exists('mario-grow')) {
      this.anims.create({
        key: 'jaiba-big-walk',
        frames: this.anims.generateFrameNumbers('mario-grow', { start: 1, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists('jaiba-big-idle') && this.textures.exists('mario-grow')) {
      this.anims.create({ key: 'jaiba-big-idle', frames: [{ key: 'mario-grow', frame: 0 }] });
    }
    if (!this.anims.exists('jaiba-eat-mushroom') && this.textures.exists('jaiba-eating')) {
      this.anims.create({
        key: 'jaiba-eat-mushroom',
        frames: this.anims.generateFrameNumbers('jaiba-eating', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: 0
      });
    }
    if (!this.anims.exists('jaiba-dead') && this.textures.exists('mario-dead')) {
      this.anims.create({
        key: 'jaiba-dead',
        frames: this.anims.generateFrameNumbers('mario-dead', { start: 0, end: 5 }),
        frameRate: 4,
        repeat: 0
      });
    }
  }

  update() {
    this.goombas.children.iterate(goomba => {
      if (goomba && goomba.body && goomba.body.enable && this.anims.exists('goomba-walk')) {
        goomba.anims.play('goomba-walk', true);
        goomba.flipX = goomba.body.velocity.x > 0;
      }
    });

    if (this.mario.isDead || this.mario.isEating) return;

    const walkKey = (this.mario.isBig && this.anims.exists('jaiba-big-walk')) ? 'jaiba-big-walk' : 'jaiba-walk';
    const idleKey = (this.mario.isBig && this.anims.exists('jaiba-big-idle')) ? 'jaiba-big-idle' : 'jaiba-idle';

    if (this.keys.left.isDown) {
      this.mario.setVelocityX(-120); 
      if (this.anims.exists(walkKey)) this.mario.anims.play(walkKey, true); 
      this.mario.flipX = true;
    } else if (this.keys.right.isDown) {
      this.mario.setVelocityX(120);  
      if (this.anims.exists(walkKey)) this.mario.anims.play(walkKey, true); 
      this.mario.flipX = false;
    } else {
      this.mario.setVelocityX(0);     
      if (this.anims.exists(idleKey)) this.mario.anims.play(idleKey, true); 
    }

    if (this.keys.up.isDown && this.mario.body.touching.down) {
      this.mario.setVelocityY(-300);
      if (this.cache.audio.exists('jump')) this.sound.play('jump');
    }

    if (this.mario.y >= config.height + 20) {
      this.mario.isDead = true;
      if (this.bgMusic) this.bgMusic.stop();
      if (this.cache.audio.exists('gameover')) this.sound.play('gameover');
      setTimeout(() => { showGameOverMenu(this); }, 1000);
    }
  }
}

// --- MENÚ GAME OVER ---
function showGameOverMenu(scene) {
  const camX = scene.cameras.main.scrollX + (config.width / 2);
  const camY = config.height / 2;

  const retryButton = scene.add.text(camX, camY, '¿Volver a intentar?', {
    fontFamily: 'Arial',
    fontSize: '14px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  }).setOrigin(0.5);

  retryButton.setInteractive({ useHandCursor: true });
  retryButton.on('pointerover', () => retryButton.setStyle({ fill: '#ff0000' }));
  retryButton.on('pointerout', () => retryButton.setStyle({ fill: '#ffffff' }));
  retryButton.on('pointerdown', () => scene.scene.restart());
}

// --- CONFIGURACIÓN GLOBAL ---
const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 244,
  backgroundColor: '#a9d0f5', 
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false 
    }
  },
  scene: [TitleScene, GameScene]
};

new Phaser.Game(config);
