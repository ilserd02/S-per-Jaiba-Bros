/* global Phaser */

// --- 1. ESCENA DE LA PORTADA (PANTALLA DE TÍTULO) ---
class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    // Fondos y decoraciones
    this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
    this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
    this.load.image('letrero', 'assets/scenery/letrero.png'); 

    // Bloques e Items
    this.load.spritesheet('mysteryBox', 'assets/blocks/overworld/misteryBlock.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('emptyBox', 'assets/blocks/overworld/emptyBlock.png');
    this.load.image('mushroom', 'assets/collectibles/super-mushroom.png');
    
    // Tuberías
    this.load.image('tube-small', 'assets/scenery/vertical-small-tube.png');
    this.load.image('tube-medium', 'assets/scenery/vertical-large-tube.png');
    this.load.image('tube-large', 'assets/scenery/vertical-large-tube.png');

    // Personajes y sus estados de animación
    this.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 273, frameHeight: 547 });
    this.load.spritesheet('mario-grow', 'assets/entities/mario-grown.png', { frameWidth: 273, frameHeight: 547 });
    this.load.spritesheet('jaiba-eating', 'assets/entities/mario-eat.png', { frameWidth: 256, frameHeight: 1024 });
    this.load.spritesheet('mario-dead', 'assets/entities/mario-dead.png', { frameWidth: 273, frameHeight: 547 });
    this.load.spritesheet('goomba', 'assets/entities/overworld/goomba.png', { frameWidth: 16, frameHeight: 16 });

    // Música y Efectos de Sonido
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

    // Fondo azul cielo
    this.cameras.main.setBackgroundColor('#92a1fc'); 

    // Nubes
    this.add.image(20, 30, 'cloud1').setScale(0.08).setAlpha(0.9).setDepth(1);
    this.add.image(90, 35, 'cloud1').setScale(0.08).setAlpha(0.9).setDepth(1);
    this.add.image(210, 40, 'cloud1').setScale(0.08).setAlpha(0.9).setDepth(1);

    // Suelo de título
    for (let x = 0; x < width + 16; x += 16) {
      this.add.image(x, height - 8, 'floorbricks').setDepth(2);
    }

    // Jaiba estática de muestra en el suelo (Escala 0.203)
    const titleJaiba = this.add.sprite(45, height - 16, 'mario')
      .setOrigin(0.5, 1) 
      .setScale(0.203)
      .setDepth(10); 
    titleJaiba.setFrame(0); 

    // Letrero del logo
    if (this.textures.exists('letrero')) {
      const logo = this.add.image(width / 2, 60, 'letrero').setDepth(10); 
      logo.setScale(180 / logo.width);
    }

    // Texto de inicio "PRESIONA ENTER"
    const startText = this.add.text(width / 2, 175, 'PRESIONA ENTER', {
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

    // Tecla Enter para saltar al nivel
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

  create() {
    // Música de fondo
    if (this.cache.audio.exists('theme') && !this.sound.get('theme')) {
      this.bgMusic = this.sound.add('theme', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else if (this.bgMusic && !this.bgMusic.isPlaying) {
      this.bgMusic.play();
    }

    this.add.image(100, 50, 'cloud1').setOrigin(0, 0).setScale(0.15);

    this.floor = this.physics.add.staticGroup();

    // Suelo
    for (let x = 0; x < 2000; x += 16) {
      if (x >= 600 && x <= 680) continue;
      this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).refreshBody();
    }

    // Tuberías
    this.floor.create(500, config.height - 32, 'tube-small').setOrigin(0.5, 0.5).refreshBody();
    this.floor.create(580, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).refreshBody();
    this.floor.create(700, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).refreshBody();

    // --- CREACIÓN SEGURA DE ANIMACIONES ---
    if (!this.anims.exists('box-shine') && this.textures.exists('mysteryBox')) {
      this.anims.create({
        key: 'box-shine',
        frames: this.anims.generateFrameNumbers('mysteryBox', { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1
      });
    }

    this.mysteryBoxes = this.physics.add.staticGroup();
    const box = this.mysteryBoxes.create(80, config.height - 90, 'mysteryBox').setOrigin(0, 0.5).refreshBody();
    box.hasItem = true;
    if (this.anims.exists('box-shine')) {
      box.anims.play('box-shine', true);
    }

    this.mushrooms = this.physics.add.group();
    this.goombas = this.physics.add.group();

    if (!this.anims.exists('goomba-walk') && this.textures.exists('goomba')) {
      this.anims.create({
        key: 'goomba-walk',
        frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
      });
    }

    const goomba1 = this.goombas.create(350, config.height - 60, 'goomba').setOrigin(0.5, 0.5);
    goomba1.setVelocityX(-40);
    goomba1.setCollideWorldBounds(true);

    // Animaciones de la Jaiba (Mario)
    if (!this.anims.exists('jaiba-walk') && this.textures.exists('mario')) {
      this.anims.create({
        key: 'jaiba-walk',
        frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('jaiba-idle') && this.textures.exists('mario')) {
      this.anims.create({
        key: 'jaiba-idle',
        frames: [{ key: 'mario', frame: 0 }]
      });
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
      this.anims.create({
        key: 'jaiba-big-idle',
        frames: [{ key: 'mario-grow', frame: 0 }]
      });
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

    // Creación del jugador (Escala original 0.203)
    this.mario = this.physics.add.sprite(50, 100, 'mario')
      .setOrigin(0.5, 0.5)
      .setCollideWorldBounds(true)
      .setGravityY(300);
      
    this.mario.setScale(0.203); 
    this.mario.body.setSize(160, 240);
    this.mario.body.setOffset(56, 300);
    
    this.mario.isBig = false; 
    this.mario.isEating = false; 
    this.mario.isDead = false;

    this.physics.world.setBounds(0, 0, 2000, config.height);
    
    this.physics.add.collider(this.mario, this.floor);
    this.physics.add.collider(this.mushrooms, this.floor);
    this.physics.add.collider(this.goombas, this.floor);

    // Colisión con bloques
    this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
      if (mario.body.touching.up) {
        if (boxHit.hasItem) {
          boxHit.hasItem = false;
          if (this.anims.exists('box-shine')) {
            boxHit.anims.stop();
          }
          if (this.textures.exists('emptyBox')) {
            boxHit.setTexture('emptyBox'); 
          }
          boxHit.refreshBody();

          if (this.cache.audio.exists('sprout')) {
            this.sound.play('sprout');
          }

          const mushroom = this.mushrooms.create(boxHit.x + 8, boxHit.y - 18, 'mushroom');
          mushroom.setOrigin(0.5, 0.5);
          mushroom.setVelocityX(50); 
        } else {
          if (this.cache.audio.exists('bump')) {
            this.sound.play('bump');
          }
        }
      }
    });

    // Colisión con el Hongo (Lógica de alimentación protegida)
    this.physics.add.overlap(this.mario, this.mushrooms, (mario, mushroomHit) => {
      if (mario.isEating || mario.isDead) return;
      
      mushroomHit.destroy(); 
      
      if (!mario.isBig) {
        mario.isEating = true;
        mario.setVelocity(0, 0);
        mario.body.allowGravity = false; 
        
        if (this.cache.audio.exists('bump')) {
          this.sound.play('bump');
        }
        
        // Verificación de seguridad: si la textura 'jaiba-eating' NO cargó bien (404), nos saltamos la animación para no crashearnos
        if (this.textures.exists('jaiba-eating') && this.anims.exists('jaiba-eat-mushroom')) {
          mario.setTexture('jaiba-eating');
          mario.setScale(0.203); 
          mario.body.setSize(160, 240);
          mario.body.setOffset(48, 760);
          mario.anims.play('jaiba-eat-mushroom');

          mario.once('animationcomplete-jaiba-eat-mushroom', () => {
            this.convertirEnGrande(mario);
          });
        } else {
          // Si falló el sprite de comer, se hace grande de golpe de forma segura
          this.convertirEnGrande(mario);
        }
      }
    });

    // Colisión con Goombas
    this.physics.add.collider(this.mario, this.goombas, (mario, goombaHit) => {
      if (mario.isEating || mario.isDead) return;
      
      if (mario.body.touching.down && goombaHit.body.touching.up) {
        mario.setVelocityY(-180); 
        
        if (this.cache.audio.exists('kick')) {
          this.sound.play('kick');
        }
        
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
          mario.setScale(0.203);
          
          mario.y -= 5;
          mario.body.setSize(160, 240);
          mario.body.setOffset(56, 300);
          mario.body.reset(mario.x, mario.y);
          
          goombaHit.x += (goombaHit.x > mario.x) ? 30 : -30;
        } else {
          mario.isDead = true;
          if (this.bgMusic) this.bgMusic.stop();

          mario.body.allowGravity = false;
          mario.body.setVelocity(0, 0);
          mario.body.enable = false; 
          
          if (this.cache.audio.exists('gameover')) {
            this.sound.play('gameover');
          }
          
          if (this.textures.exists('mario-dead') && this.anims.exists('jaiba-dead')) {
            mario.setTexture('mario-dead');
            mario.setScale(0.215); 
            mario.anims.play('jaiba-dead');
          }

          this.tweens.add({
            targets: mario,
            alpha: 0,
            delay: 1000, 
            duration: 800, 
            ease: 'Linear',
            onComplete: () => {
              showGameOverMenu(this);
            }
          });
        }
      }
    });

    this.cameras.main.setBounds(0, 0, 2000, config.height);
    this.cameras.main.startFollow(this.mario);

    this.keys = this.input.keyboard.createCursorKeys();
  }

  // Función auxiliar para crecer de forma limpia
  convertirEnGrande(mario) {
    mario.isBig = true;
    mario.isEating = false;
    mario.body.allowGravity = true; 
    
    if (this.cache.audio.exists('powerup')) {
      this.sound.play('powerup');
    }

    if (this.textures.exists('mario-grow')) {
      mario.setTexture('mario-grow');
      mario.setScale(0.227); 
    }
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
      if (this.cache.audio.exists('jump')) {
        this.sound.play('jump');
      }
    }

    if (this.mario.y >= config.height) {
      this.mario.isDead = true;
      if (this.bgMusic) this.bgMusic.stop();
      if (this.cache.audio.exists('gameover')) {
        this.sound.play('gameover');
      }
      setTimeout(() => { showGameOverMenu(this); }, 1000);
    }
  }
}

// --- MENÚ GAME OVER ---
function showGameOverMenu (scene) {
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

  retryButton.on('pointerdown', () => {
    scene.scene.restart();
  });
}

// --- CONFIGURACIÓN GLOBAL ---
const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 244,
  backgroundColor: '#049cd8',
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false 
    }
  },
  scene: [TitleScene, GameScene] // Ambas escenas registradas en orden
};

new Phaser.Game(config);
