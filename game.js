/* global Phaser */

// --- 1. ESCENA DE LA PORTADA ---
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

    // Enemigos y estados
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
    const height = this.scale.height;
    this.cameras.main.setBackgroundColor('#a9d0f5'); 

    if (this.textures.exists('cloud1')) {
      this.add.image(40, 50, 'cloud1').setScale(0.12).setAlpha(0.95);
    }
    if (this.textures.exists('mountain1')) {
      this.add.image(45, height - 16, 'mountain1').setOrigin(0.5, 1).setScale(0.15);
    }

    for (let x = 0; x < this.scale.width + 16; x += 16) {
      this.add.image(x, height - 8, 'floorbricks').setDepth(2);
    }

    if (this.textures.exists('mario-feli')) {
      this.add.image(180, height - 75, 'mario-feli').setScale(0.163).setDepth(10); 
    }

    if (this.textures.exists('letrero')) {
      const logo = this.add.image(this.scale.width / 2, height / 2 - 25, 'letrero').setDepth(10); 
      logo.setScale(180 / logo.width);
    }

    const startText = this.add.text(this.scale.width / 2, height / 2 + 35, 'PRESS ENTER TO START', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '10px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: startText, alpha: 0, duration: 600, yoyo: true, repeat: -1
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
    const groundY = height - 16; // El suelo firme se dibuja en la base

    if (this.cache.audio.exists('theme') && !this.sound.get('theme')) {
      this.bgMusic = this.sound.add('theme', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else if (this.bgMusic && !this.bgMusic.isPlaying) {
      this.bgMusic.play();
    }

    this.cameras.main.setBackgroundColor('#a9d0f5'); 

    // --- GRUPOS FÍSICOS ---
    this.floor = this.physics.add.staticGroup();
    this.mysteryBoxes = this.physics.add.staticGroup();
    this.bricks = this.physics.add.staticGroup();
    this.mushrooms = this.physics.add.group();
    this.goombas = this.physics.add.group();

    // --- ANIMACIONES DEL ENTORNO ---
    if (!this.anims.exists('box-shine') && this.textures.exists('mysteryBox')) {
      this.anims.create({
        key: 'box-shine', frames: this.anims.generateFrameNumbers('mysteryBox', { start: 0, end: 2 }),
        frameRate: 6, repeat: -1
      });
    }
    if (!this.anims.exists('coin-spin') && this.textures.exists('coin')) {
      this.anims.create({
        key: 'coin-spin', frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
        frameRate: 10, repeat: -1
      });
    }
    if (!this.anims.exists('goomba-walk') && this.textures.exists('goomba')) {
      this.anims.create({
        key: 'goomba-walk', frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
        frameRate: 5, repeat: -1
      });
    }

    // --- CONSTRUCCIÓN DE PLATAFORMAS DE SUELO (CON SUS RESPECTIVOS VACÍOS) ---
    // Tramo 1: Inicio hasta primer foso
    for (let x = 0; x < 1120; x += 16) {
      this.floor.create(x + 8, groundY + 8, 'floorbricks').setDepth(2).refreshBody();
    }
    // Tramo 2: Entre primer foso y segundo foso
    for (let x = 1152; x < 1376; x += 16) {
      this.floor.create(x + 8, groundY + 8, 'floorbricks').setDepth(2).refreshBody();
    }
    // Tramo 3: Del segundo foso hasta el final
    for (let x = 1424; x < 3500; x += 16) {
      this.floor.create(x + 8, groundY + 8, 'floorbricks').setDepth(2).refreshBody();
    }

    // --- DISTRIBUCIÓN MATEMÁTICA EXACTA DEL MUNDO 1-1 ---
    
    // 1. Primer Bloque Sorpresa Solitario (CON HONGO)
    this.createMysteryBox(256, groundY - 56, 'mushroom');

    // 2. Primera estructura combinada (Ladrillos y Bloques Sorpresa con Monedas)
    this.createBrick(320, groundY - 56);
    this.createMysteryBox(336, groundY - 56, 'coin');
    this.createBrick(352, groundY - 56);
    this.createMysteryBox(368, groundY - 56, 'coin');
    this.createBrick(384, groundY - 56);
    // Bloque sorpresa superior céntrico
    this.createMysteryBox(352, groundY - 104, 'coin');

    // 3. Las Tuberías Iniciales Ordenadas
    this.createStaticSolid(448, groundY - 16, 'tube-small');
    this.createStaticSolid(608, groundY - 24, 'tube-medium');
    this.createStaticSolid(736, groundY - 32, 'tube-large');

    // 4. Cuarta tubería y el bloque oculto posterior (CON HONGO)
    this.createStaticSolid(912, groundY - 32, 'tube-large');
    this.createMysteryBox(1024, groundY - 56, 'mushroom'); 

    // 5. Estructura flotante intermedia tras los fosos
    this.createBrick(1232, groundY - 56);
    this.createMysteryBox(1248, groundY - 56, 'coin');
    this.createBrick(1264, groundY - 56);

    // --- COLOCACIÓN DE ENEMIGOS ---
    this.createGoomba(300, groundY - 16);
    this.createGoomba(400, groundY - 16);
    this.createGoomba(660, groundY - 16);
    this.createGoomba(820, groundY - 16);
    this.createGoomba(1000, groundY - 16);

    this.registerPlayerAnimations();

    // --- JUGADOR (MARIO) ---
    this.mario = this.physics.add.sprite(80, groundY - 40, 'mario')
      .setOrigin(0.5, 0.5)
      .setCollideWorldBounds(true)
      .setGravityY(350)
      .setDepth(4)
      .setScale(0.163);
      
    this.mario.body.setSize(160, 240);
    this.mario.body.setOffset(56, 300);
    
    this.mario.isBig = false; 
    this.mario.isEating = false; 
    this.mario.isDead = false;

    this.physics.world.setBounds(0, 0, 3500, height);

    // --- INTERFAZ DEL CONTADOR (UI FIJA) ---
    this.coinText = this.add.text(16, 16, 'MONEDAS: 0', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '12px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(10).setScrollFactor(0);
    
    // --- CONFIGURACIÓN DE COLISIONES ---
    this.physics.add.collider(this.mario, this.floor);
    this.physics.add.collider(this.mario, this.bricks);
    this.physics.add.collider(this.mushrooms, this.floor);
    this.physics.add.collider(this.mushrooms, this.bricks);
    this.physics.add.collider(this.goombas, this.floor);
    this.physics.add.collider(this.goombas, this.bricks);
    this.physics.add.collider(this.goombas, this.mysteryBoxes);

    // Al cabecear los Bloques Sorpresa
    this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
      if (mario.body.touching.up) {
        if (boxHit.content !== 'empty') {
          const contentType = boxHit.content;
          boxHit.content = 'empty';
          
          boxHit.anims.stop();
          if (this.textures.exists('emptyBox')) boxHit.setTexture('emptyBox'); 
          boxHit.refreshBody();

          if (contentType === 'mushroom') {
            if (this.cache.audio.exists('sprout')) this.sound.play('sprout');
            const mushroom = this.mushrooms.create(boxHit.x, boxHit.y - 16, 'mushroom').setDepth(3);
            mushroom.setVelocityX(50); 
          } 
          else if (contentType === 'coin') {
            if (this.cache.audio.exists('powerup')) this.sound.play('powerup');
            
            this.coinsCollected++;
            this.coinText.setText('MONEDAS: ' + this.coinsCollected);

            const animatedCoin = this.add.sprite(boxHit.x, boxHit.y - 12, 'coin').setDepth(3);
            animatedCoin.play('coin-spin');

            this.tweens.add({
              targets: animatedCoin,
              y: boxHit.y - 36,
              alpha: 0,
              duration: 350,
              yoyo: true,
              hold: 30,
              onComplete: () => { animatedCoin.destroy(); }
            });
          }
        } else {
          if (this.cache.audio.exists('bump')) this.sound.play('bump');
        }
      }
    });

    // Conseguir el Champiñón
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

    // Colisión contra Goombas
    this.physics.add.collider(this.mario, this.goombas, (mario, goombaHit) => {
      if (mario.isEating || mario.isDead) return;
      
      if (mario.body.touching.down && goombaHit.body.touching.up) {
        mario.setVelocityY(-180); 
        if (this.cache.audio.exists('kick')) this.sound.play('kick');
        
        goombaHit.setVelocityX(0);
        goombaHit.body.enable = false;
        goombaHit.setFrame(2);

        this.tweens.add({
          targets: goombaHit, alpha: 0, duration: 300,
          onComplete: () => { goombaHit.destroy(); }
        });
      } else {
        if (mario.isBig) {
          mario.isBig = false;
          mario.setTexture('mario'); 
          mario.setScale(0.163); 
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
            targets: mario, alpha: 0, delay: 1000, duration: 800, 
            onComplete: () => { showGameOverMenu(this); }
          });
        }
      }
    });

    this.cameras.main.setBounds(0, 0, 3500, height);
    this.cameras.main.startFollow(this.mario);
    this.keys = this.input.keyboard.createCursorKeys();
  }

  createMysteryBox(x, y, contentType) {
    const box = this.mysteryBoxes.create(x, y, 'mysteryBox').setOrigin(0.5).setDepth(2).refreshBody();
    box.content = contentType;
    if (this.anims.exists('box-shine')) box.anims.play('box-shine', true);
    return box;
  }

  createBrick(x, y) {
    return this.bricks.create(x, y, 'brick').setOrigin(0.5).setDepth(2).refreshBody();
  }

  createStaticSolid(x, y, assetKey) {
    let element = this.add.image(x, y, assetKey).setOrigin(0.5, 1).setDepth(2);
    this.physics.add.existing(element, true);
    this.floor.add(element);
    return element;
  }

  createGoomba(x, y) {
    const goomba = this.goombas.create(x, y, 'goomba').setOrigin(0.5, 1).setDepth(3);
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
    mario.y -= 20; 
    mario.body.setSize(160, 180);
    mario.body.setOffset(56, 360);
    mario.body.reset(mario.x, mario.y);
  }

  registerPlayerAnimations() {
    if (!this.anims.exists('jaiba-walk') && this.textures.exists('mario')) {
      this.anims.create({
        key: 'jaiba-walk', frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 3 }),
        frameRate: 10, repeat: -1
      });
    }
    if (!this.anims.exists('jaiba-idle') && this.textures.exists('mario')) {
      this.anims.create({ key: 'jaiba-idle', frames: [{ key: 'mario', frame: 0 }] });
    }
    if (!this.anims.exists('jaiba-big-walk') && this.textures.exists('mario-grow')) {
      this.anims.create({
        key: 'jaiba-big-walk', frames: this.anims.generateFrameNumbers('mario-grow', { start: 1, end: 3 }),
        frameRate: 10, repeat: -1
      });
    }
    if (!this.anims.exists('jaiba-big-idle') && this.textures.exists('mario-grow')) {
      this.anims.create({ key: 'jaiba-big-idle', frames: [{ key: 'mario-grow', frame: 0 }] });
    }
    if (!this.anims.exists('jaiba-eat-mushroom') && this.textures.exists('jaiba-eating')) {
      this.anims.create({
        key: 'jaiba-eat-mushroom', frames: this.anims.generateFrameNumbers('jaiba-eating', { start: 0, end: 5 }),
        frameRate: 6, repeat: 0
      });
    }
    // ARREGLADO: Solo lee el frame 0 para evitar el error de consola "Frame 5 not found"
    if (!this.anims.exists('jaiba-dead') && this.textures.exists('mario-dead')) {
      this.anims.create({
        key: 'jaiba-dead', frames: [{ key: 'mario-dead', frame: 0 }],
        frameRate: 4, repeat: 0
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

    const walkKey = this.mario.isBig ? 'jaiba-big-walk' : 'jaiba-walk';
    const idleKey = this.mario.isBig ? 'jaiba-big-idle' : 'jaiba-idle';

    if (this.keys.left.isDown) {
      this.mario.setVelocityX(-120); 
      this.mario.anims.play(walkKey, true); 
      this.mario.flipX = true;
    } else if (this.keys.right.isDown) {
      this.mario.setVelocityX(120);  
      this.mario.anims.play(walkKey, true); 
      this.mario.flipX = false;
    } else {
      this.mario.setVelocityX(0);     
      this.mario.anims.play(idleKey, true); 
    }

    if (this.keys.up.isDown && this.mario.body.touching.down) {
      this.mario.setVelocityY(-300);
      if (this.cache.audio.exists('jump')) this.sound.play('jump');
    }

    if (this.mario.y >= this.scale.height + 20) {
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
    fontFamily: 'Arial', fontSize: '14px', fill: '#ffffff', backgroundColor: '#000000', padding: { x: 8, y: 4 }
  }).setOrigin(0.5);

  retryButton.setInteractive({ useHandCursor: true });
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
    arcade: { gravity: { y: 300 }, debug: false }
  },
  scene: [TitleScene, GameScene]
};

new Phaser.Game(config);
