/* global Phaser */

// --- 1. ESCENA DE LA PORTADA (PANTALLA DE TÍTULO ORIGINAL) ---
class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    // Cargamos los elementos para la portada y el fondo del juego
    this.load.image('letrero', 'assets/scenery/letrero.png'); 
    this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
    
    // Ruta correcta verificada para mario-feli
    this.load.image('mario-feli', 'assets/scenery/mario-feli.png'); 

    // Assets de escenario reales (obtenidos de tu carpeta)
    this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
    this.load.image('mountain1', 'assets/scenery/overworld/mountain1.png');
    this.load.image('mountain2', 'assets/scenery/overworld/mountain2.png');
    this.load.image('bush1', 'assets/scenery/overworld/bush1.png');

    // Pre-cargamos los elementos del juego
    this.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 273, frameHeight: 547 });
    this.load.spritesheet('mysteryBox', 'assets/blocks/overworld/misteryBlock.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('emptyBox', 'assets/blocks/overworld/emptyBlock.png');
    this.load.image('mushroom', 'assets/collectibles/super-mushroom.png');
    this.load.image('tube-small', 'assets/scenery/vertical-small-tube.png');
    this.load.image('tube-medium', 'assets/scenery/vertical-large-tube.png');
    this.load.image('tube-large', 'assets/scenery/vertical-large-tube.png');
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

    // Fondo azul claro
    this.cameras.main.setBackgroundColor('#a9d0f5'); 

    // --- NUBES EN LA PORTADA ---
    if (this.textures.exists('cloud1')) {
      this.add.image(40, 50, 'cloud1').setOrigin(0.5).setScale(0.12).setAlpha(0.95).setDepth(1);
      this.add.image(130, 25, 'cloud1').setOrigin(0.5).setScale(0.14).setAlpha(0.95).setDepth(1);
      this.add.image(220, 45, 'cloud1').setOrigin(0.5).setScale(0.11).setAlpha(0.95).setDepth(1);
    }

    // --- MONTAÑAS Y ARBUSTOS EN LA PORTADA (POR DETRÁS DE LOS BLOQUES DE SUELO) ---
    if (this.textures.exists('mountain1')) {
      this.add.image(45, height - 16, 'mountain1').setOrigin(0.5, 1).setScale(0.15).setDepth(1);
    }
    if (this.textures.exists('mountain2')) {
      this.add.image(210, height - 16, 'mountain2').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
    }
    if (this.textures.exists('bush1')) {
      this.add.image(110, height - 16, 'bush1').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
    }

    // Suelo inferior de la portada (Por delante del escenario)
    for (let x = 0; x < width + 16; x += 16) {
      this.add.image(x, height - 8, 'floorbricks').setDepth(2);
    }

    // --- MARIO-FELI SALTANDO A LA DERECHA Y ELEVADO ---
    if (this.textures.exists('mario-feli')) {
      this.add.image(180, height - 75, 'mario-feli') 
        .setOrigin(0.5, 0.5) 
        .setScale(0.163) 
        .setDepth(10)
        .setFlipX(false); 
    }

    // Letrero centrado
    if (this.textures.exists('letrero')) {
      const logo = this.add.image(width / 2, height / 2 - 25, 'letrero').setDepth(10); 
      logo.setScale(180 / logo.width);
    }

    // Texto de inicio "PRESS ENTER TO START"
    const startText = this.add.text(width / 2, height / 2 + 35, 'PRESS ENTER TO START', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '10px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // Parpadeo del texto
    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Iniciar juego con Enter
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
    const height = this.scale.height;

    // Música de fondo segura
    if (this.cache.audio.exists('theme') && !this.sound.get('theme')) {
      this.bgMusic = this.sound.add('theme', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else if (this.bgMusic && !this.bgMusic.isPlaying) {
      this.bgMusic.play();
    }

    // Fondo azul claro del cielo en juego
    this.cameras.main.setBackgroundColor('#a9d0f5'); 

    // --- ESCENARIO DE FONDO REPETIDO (POR DETRÁS DE TODO) ---
    // Colocamos montañas, nubes y arbustos distribuidos a lo largo del nivel (eje X de 0 a 2000 px)
    for (let x = 80; x < 2000; x += 280) {
      if (this.textures.exists('mountain1')) {
        this.add.image(x, height - 16, 'mountain1').setOrigin(0.5, 1).setScale(0.15).setDepth(1);
      }
      if (this.textures.exists('mountain2')) {
        this.add.image(x + 120, height - 16, 'mountain2').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
      }
      if (this.textures.exists('bush1')) {
        this.add.image(x + 50, height - 16, 'bush1').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
        this.add.image(x + 180, height - 16, 'bush1').setOrigin(0.5, 1).setScale(0.12).setDepth(1);
      }
      if (this.textures.exists('cloud1')) {
        this.add.image(x, 40, 'cloud1').setOrigin(0.5).setScale(0.12).setAlpha(0.95).setDepth(1);
        this.add.image(x + 140, 20, 'cloud1').setOrigin(0.5).setScale(0.14).setAlpha(0.95).setDepth(1);
      }
    }

    this.floor = this.physics.add.staticGroup();

    // Generación del suelo (Por encima de las montañas por su setDepth(2))
    for (let x = 0; x < 2000; x += 16) {
      if (x >= 600 && x <= 680) continue;
      this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).setDepth(2).refreshBody();
    }

    // Tuberías
    this.floor.create(500, config.height - 32, 'tube-small').setOrigin(0.5, 0.5).setDepth(2).refreshBody();
    this.floor.create(580, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).setDepth(2).refreshBody();
    this.floor.create(700, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).setDepth(2).refreshBody();

    // Creación segura de animaciones
    if (!this.anims.exists('box-shine') && this.textures.exists('mysteryBox')) {
      this.anims.create({
        key: 'box-shine',
        frames: this.anims.generateFrameNumbers('mysteryBox', { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1
      });
    }

    this.mysteryBoxes = this.physics.add.staticGroup();
    const box = this.mysteryBoxes.create(80, config.height - 90, 'mysteryBox').setOrigin(0, 0.5).setDepth(2).refreshBody();
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

    const goomba1 = this.goombas.create(350, config.height - 60, 'goomba').setOrigin(0.5, 0.5).setDepth(3);
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

    // Creación del jugador (Por encima de todo)
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

          const mushroom = this.mushrooms.create(boxHit.x + 8, boxHit.y - 18, 'mushroom').setDepth(3);
          mushroom.setOrigin(0.5, 0.5);
          mushroom.setVelocityX(50); 
        } else {
          if (this.cache.audio.exists('bump')) {
            this.sound.play('bump');
          }
        }
      }
    });

    // Colisión con el Hongo
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
        
        if (this.textures.exists('jaiba-eating') && this.anims.exists('jaiba-eat-mushroom')) {
          mario.setTexture('jaiba-eating');
          mario.setScale(0.163); 
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
          mario.setScale(0.163); 
          
          mario.y -= 5;
          mario.body.setSize(160, 240);
          mario.body.setOffset(56, 300);
          mario.body.reset(mario.x, mario.y);
          
          goombaHit.x += (goombaHit.x > mario.x) ? 30 : -30;
        } else {
          mario.isDead = true;
          if (this.bgMusic) this.bgMusic.stop();
