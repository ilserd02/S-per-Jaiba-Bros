/* global Phaser */

// --- NUEVA ESCENA: PANTALLA DE TÍTULO ---
class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    // Fondos y decoraciones
    this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
    this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');
    this.load.image('mountain', 'assets/scenery/overworld/mountain.png'); // Si tienes la montaña, si no se dibuja plano
    this.load.image('bush', 'assets/scenery/overworld/bush.png'); // Arbustos

    // Bloques e Items
    this.load.spritesheet('mysteryBox', 'assets/blocks/overworld/misteryBlock.png', { frameWidth: 16, frameHeight: 16 });

    // Personajes
    this.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 273, frameHeight: 547 });
    this.load.spritesheet('goomba', 'assets/entities/overworld/goomba.png', { frameWidth: 16, frameHeight: 16 });

    // Música de fondo
    this.load.audio('theme', 'assets/sound/music/overworld.mp3');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 1. Fondo azul cielo pálido
    this.cameras.main.setBackgroundColor('#92a1fc'); 

    // 2. Nubes (Tres en la parte superior izquierda, una a la derecha, una abajo a la izquierda)
    this.add.image(20, 30, 'cloud1').setScale(0.08).setAlpha(0.9);
    this.add.image(55, 25, 'cloud1').setScale(0.08).setAlpha(0.9);
    this.add.image(90, 35, 'cloud1').setScale(0.08).setAlpha(0.9);
    this.add.image(210, 40, 'cloud1').setScale(0.08).setAlpha(0.9);
    this.add.image(35, 120, 'cloud1').setScale(0.08).setAlpha(0.9);

    // 3. Suelo de ladrillo marrón
    this.floorGroup = this.add.group();
    for (let x = 0; x < width + 16; x += 16) {
      this.floorGroup.create(x, height - 8, 'floorbricks');
    }

    // 4. Montaña verde y arbustos en el fondo
    // Representación simplificada de la montaña verde con gráficos si no está el asset exacto
    const mountainGeom = this.add.graphics();
    mountainGeom.fillStyle(0x00a800, 1); // Verde oscuro de 8-bits
    mountainGeom.beginPath();
    mountainGeom.moveTo(140, height - 16);
    mountainGeom.lineTo(165, height - 55);
    mountainGeom.lineTo(190, height - 16);
    mountainGeom.closePath();
    mountainGeom.fillPath();

    // Puntos negros decorativos en la montaña
    mountainGeom.fillStyle(0x000000, 1);
    mountainGeom.fillRect(160, height - 30, 2, 2);
    mountainGeom.fillRect(170, height - 40, 2, 2);
    mountainGeom.fillRect(152, height - 24, 2, 2);

    // Dos pequeños arbustos verdes al lado
    const bush1 = this.add.graphics();
    bush1.fillStyle(0x00fc00, 1); // Verde claro
    bush1.fillEllipse(130, height - 22, 16, 12);
    bush1.fillEllipse(142, height - 22, 14, 10);

    // 5. Decoraciones flotantes (Bloques de preguntas "?")
    this.anims.create({
      key: 'box-shine-title',
      frames: this.anims.generateFrameNumbers('mysteryBox', { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1
    });

    // Bloque solitario amarillo bajo el cartel
    const centerBox = this.add.sprite(width / 2, 115, 'mysteryBox');
    centerBox.anims.play('box-shine-title', true);

    // Bloque de ladrillo/pregunta flotando arriba a la derecha
    const rightBox = this.add.sprite(220, 75, 'mysteryBox');
    rightBox.anims.play('box-shine-title', true);

    // 6. Personajes estáticos / decorativos en pantalla
    // Jaiba pequeña (0.131) mirando a la derecha
    const titleJaiba = this.add.sprite(45, height - 28, 'mario').setScale(0.131);
    titleJaiba.setFrame(0); // Pose idle mirando a la derecha

    // Goomba caminando hacia la izquierda
    this.anims.create({
      key: 'goomba-walk-title',
      frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });
    const titleGoomba = this.add.sprite(215, height - 24, 'goomba');
    titleGoomba.anims.play('goomba-walk-title', true);

    // 7. GRAN LETRERO RECTANGULAR DE COLOR NARANJA ("SUPER JAIBA BROS.")
    const bannerWidth = 190;
    const bannerHeight = 45;
    const bannerX = (width - bannerWidth) / 2;
    const bannerY = 25;

    const rectGraphics = this.add.graphics();
    // Borde negro exterior
    rectGraphics.fillStyle(0x000000, 1);
    rectGraphics.fillRect(bannerX - 2, bannerY - 2, bannerWidth + 4, bannerHeight + 4);
    // Fondo Naranja
    rectGraphics.fillStyle(0xfc9838, 1);
    rectGraphics.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);

    // Puntos negros en las esquinas del borde naranja
    rectGraphics.fillStyle(0x000000, 1);
    rectGraphics.fillRect(bannerX + 2, bannerY + 2, 3, 3); // Arriba Izq
    rectGraphics.fillRect(bannerX + bannerWidth - 5, bannerY + 2, 3, 3); // Arriba Der
    rectGraphics.fillRect(bannerX + 2, bannerY + bannerHeight - 5, 3, 3); // Abajo Izq
    rectGraphics.fillRect(bannerX + bannerWidth - 5, bannerY + bannerHeight - 5, 3, 3); // Abajo Der

    // Texto del Título: "SUPER JAIBA BROS."
    this.add.text(width / 2 + 1, bannerY + 15 + 1, 'SUPER JAIBA BROS.', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '15px',
      fontStyle: 'bold',
      fill: '#000000', // Sombra negra
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, bannerY + 15, 'SUPER JAIBA BROS.', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '15px',
      fontStyle: 'bold',
      fill: '#ffffff', // Texto blanco
      align: 'center'
    }).setOrigin(0.5);

    // 8. Mensaje de interacción para empezar
    const startText = this.add.text(width / 2, 160, 'PRESIONA ENTER', {
      fontFamily: 'Arial',
      fontSize: '10px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Parpadeo del texto
    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // 9. Input para saltar al juego principal
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }
}

// --- ESCENA DE JUEGO PRINCIPAL (Tu escena actual adaptada) ---
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // --- INICIAR MÚSICA DE FONDO ---
    if (this.cache.audio.exists('theme') && !this.sound.get('theme')) {
      this.bgMusic = this.sound.add('theme', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else if (this.bgMusic && !this.bgMusic.isPlaying) {
      this.bgMusic.play();
    }

    this.add.image(100, 50, 'cloud1').setOrigin(0, 0).setScale(0.15);

    this.floor = this.physics.add.staticGroup();

    // --- GENERACIÓN DEL SUELO ---
    for (let x = 0; x < 2000; x += 16) {
      if (x >= 600 && x <= 680) continue;
      this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).refreshBody();
    }

    // --- TUBERÍAS ---
    this.floor.create(500, config.height - 32, 'tube-small').setOrigin(0.5, 0.5).refreshBody();
    this.floor.create(580, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).refreshBody();
    this.floor.create(700, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).refreshBody();

    // --- ANIMACIONES DEL ENTORNO Y ENEMIGOS ---
    this.anims.create({
      key: 'box-shine',
      frames: this.anims.generateFrameNumbers('mysteryBox', { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1
    });

    this.mysteryBoxes = this.physics.add.staticGroup();
    const box = this.mysteryBoxes.create(80, config.height - 90, 'mysteryBox').setOrigin(0, 0.5).refreshBody();
    box.hasItem = true;
    box.anims.play('box-shine', true);

    this.mushrooms = this.physics.add.group();
    this.goombas = this.physics.add.group();

    this.anims.create({
      key: 'goomba-walk',
      frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
      frameRate: 5,
      repeat: -1
    });

    const goomba1 = this.goombas.create(350, config.height - 60, 'goomba').setOrigin(0.5, 0.5);
    goomba1.setVelocityX(-40);
    goomba1.setCollideWorldBounds(true);

    // --- ANIMACIONES DE LA JAIBA ---
    this.anims.create({
      key: 'jaiba-walk',
      frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jaiba-idle',
      frames: [{ key: 'mario', frame: 0 }]
    });

    this.anims.create({
      key: 'jaiba-big-walk',
      frames: this.anims.generateFrameNumbers('mario-grow', { start: 1, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jaiba-big-idle',
      frames: [{ key: 'mario-grow', frame: 0 }]
    });

    this.anims.create({
      key: 'jaiba-eat-mushroom',
      frames: this.anims.generateFrameNumbers('jaiba-eating', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: 0
    });

    this.anims.create({
      key: 'jaiba-dead',
      frames: this.anims.generateFrameNumbers('mario-dead', { start: 0, end: 5 }),
      frameRate: 4,
      repeat: 0
    });

    // --- CREACIÓN DEL JUGADOR (Escala ajustada a 0.131) ---
    this.mario = this.physics.add.sprite(50, 100, 'mario')
      .setOrigin(0.5, 0.5)
      .setCollideWorldBounds(true)
      .setGravityY(300);
      
    this.mario.setScale(0.131); 

    this.mario.body.setSize(160, 240);
    this.mario.body.setOffset(56, 300);
    
    this.mario.isBig = false; 
    this.mario.isEating = false; 
    this.mario.isDead = false;

    this.physics.world.setBounds(0, 0, 2000, config.height);
    
    this.physics.add.collider(this.mario, this.floor);
    this.physics.add.collider(this.mushrooms, this.floor);
    this.physics.add.collider(this.goombas, this.floor);

    // Golpear bloque misterioso
    this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
      if (mario.body.touching.up) {
        if (boxHit.hasItem) {
          boxHit.hasItem = false;
          boxHit.anims.stop();
          boxHit.setTexture('emptyBox'); 
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

    // --- LÓGICA DE ALIMENTACIÓN ---
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
        
        mario.setTexture('jaiba-eating');
        mario.setScale(0.131); 
        
        mario.body.setSize(160, 240);
        mario.body.setOffset(48, 760);
        mario.anims.play('jaiba-eat-mushroom');

        mario.once('animationcomplete-jaiba-eat-mushroom', () => {
          mario.isBig = true;
          mario.isEating = false;
          mario.body.allowGravity = true; 
          
          if (this.cache.audio.exists('powerup')) {
            this.sound.play('powerup');
          }

          mario.setTexture('mario-grow');
          mario.setScale(0.155); 
          mario.y -= 25; 
          
          mario.body.setSize(160, 180);
          mario.body.setOffset(56, 360);
          
          mario.body.reset(mario.x, mario.y);
        });
      }
    });

    // --- LÓGICA DE INTERACCIÓN GOOMBA ---
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
          mario.setScale(0.131);
          
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
          
          mario.setTexture('mario-dead');
          mario.setScale(0.155); 
          mario.anims.play('jaiba-dead');

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

  update() {
    this.goombas.children.iterate(goomba => {
      if (goomba && goomba.body && goomba.body.enable) {
        goomba.anims.play('goomba-walk', true);
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
      this.mario.setVelocityY(-285);
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

// --- MENÚ DE REINTENTAR ---
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
  // Cargamos ambas escenas, empezando por la de título
  scene: [TitleScene, GameScene]
};

new Phaser.Game(config);
