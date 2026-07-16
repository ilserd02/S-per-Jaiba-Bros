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
    this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png'); // Cargamos la nube
    
    // Ruta correcta verificada para mario-feli
    this.load.image('mario-feli', 'assets/scenery/mario-feli.png'); 

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

    // Fondo azul claro tal como se especificó
    this.cameras.main.setBackgroundColor('#a9d0f5'); 

    // --- NUBES EN EL FONDO DE LA PORTADA ---
    if (this.textures.exists('cloud1')) {
      // Nube 1 (Izquierda y un poco baja)
      this.add.image(40, 50, 'cloud1').setScale(0.12).setAlpha(0.85).setDepth(1);
      // Nube 2 (Centro y más arriba)
      this.add.image(130, 25, 'cloud1').setScale(0.14).setAlpha(0.85).setDepth(1);
      // Nube 3 (Derecha y un poco baja)
      this.add.image(220, 45, 'cloud1').setScale(0.11).setAlpha(0.85).setDepth(1);
    }

    // Suelo inferior
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
    const height = this.scale.height; // Usaremos esto para colocar los elementos de fondo

    // Música de fondo segura
    if (this.cache.audio.exists('theme') && !this.sound.get('theme')) {
      this.bgMusic = this.sound.add('theme', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else if (this.bgMusic && !this.bgMusic.isPlaying) {
      this.bgMusic.play();
    }

    // Fondo azul claro tal como se especificó
    this.cameras.main.setBackgroundColor('#a9d0f5'); 

    // --- NUBES EN EL FONDO DEL JUEGO ---
    if (this.textures.exists('cloud1')) {
      // Replicamos la nube de la portada
      this.add.image(130, 25, 'cloud1').setScale(0.14).setAlpha(0.85).setDepth(1);
    }

    // --- MONTAÑAS EN EL FONDO DEL JUEGO ---
    // Agregamos montañas replicadas de la portada
    const mountainGraphics = this.add.graphics({ fillStyle: { color: 0x009a00 } }); // Verde para la montaña
    
    // Función helper para dibujar una montaña (Triángulo)
    function drawMountain(graphics, x, y, baseWidth, mountainHeight) {
      const triangle = new Phaser.Geom.Triangle(
        x, y, // Vértice inferior izquierdo
        x + baseWidth / 2, y - mountainHeight, // Vértice superior
        x + baseWidth, y // Vértice inferior derecho
      );
      graphics.fillTriangleShape(triangle);
    }
    
    // Montaña grande izquierda
    drawMountain(mountainGraphics, 30, height - 16, 60, 40); 
    // Montaña pequeña derecha
    drawMountain(mountainGraphics, 200, height - 16, 40, 25);
    
    // Le damos profundidad a las montañas para que estén detrás de todo
    mountainGraphics.setDepth(1);

    this.floor = this.physics.add.staticGroup();

    // Generación del suelo
    for (let x = 0; x < 2000; x += 16) {
      if (x >= 600 && x <= 680) continue;
      this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).refreshBody();
    }

    // Tuberías
    this.floor.create(500, config.height - 32, 'tube-small').setOrigin(0.5, 0.5).refreshBody();
    this.floor.create(580, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).refreshBody();
    this.floor.create(700, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).refreshBody();

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

    // Creación del jugador
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

          mario.body.allowGravity = false;
          mario.body.setVelocity(0, 0);
          mario.body.enable = false; 
          
          if (this.cache.audio.exists('gameover')) {
            this.sound.play('gameover');
          }
          
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

  convertirEnGrande(mario) {
    mario.isBig = true;
    mario.isEating = false;
    mario.body.allowGravity = true; 
    
    if (this.cache.audio.exists('powerup')) {
      this.sound.play('powerup');
    }

    if (this.textures.exists('mario-grow')) {
      mario.setTexture('mario-grow');
      mario.setScale(0.187); 
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

  retryButton.on('pointerdown', () => {
    scene.scene.restart();
  });
}

// --- CONFIGURACIÓN GLOBAL ---
const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 244,
  backgroundColor: '#049cd8', // Color celeste claro modificado
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
