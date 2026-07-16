/* global Phaser */

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
  scene: {
    preload,
    create,
    update
  }
};

new Phaser.Game(config);

function preload () {
  this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
  this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png');

  // --- BLOQUES Y ELEMENTOS ---
  this.load.spritesheet('mysteryBox', 'assets/blocks/overworld/misteryBlock.png', { frameWidth: 16, frameHeight: 16 });
  this.load.image('emptyBox', 'assets/blocks/overworld/emptyBlock.png');     
  this.load.image('mushroom', 'assets/collectibles/super-mushroom.png');

  // --- TUBERÍAS ---
  this.load.image('tube-small', 'assets/scenery/vertical-small-tube.png'); 
  this.load.image('tube-medium', 'assets/scenery/vertical-large-tube.png'); 
  this.load.image('tube-large', 'assets/scenery/vertical-large-tube.png'); 

  // --- CONFIGURACIÓN DE SPRITESHEETS ---
  this.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 273, frameHeight: 547 }); 
  this.load.spritesheet('mario-grow', 'assets/entities/mario-grown.png', { frameWidth: 273, frameHeight: 547 }); 
  this.load.spritesheet('jaiba-eating', 'assets/entities/mario-eat.png', { frameWidth: 256, frameHeight: 1024 });
  this.load.spritesheet('mario-dead', 'assets/entities/mario-dead.png', { frameWidth: 273, frameHeight: 547 });

  // --- ENEMIGO GOOMBA ---
  this.load.spritesheet('goomba', 'assets/entities/overworld/goomba.png', { frameWidth: 16, frameHeight: 16 });

  // --- EFECTOS DE SONIDO Y MÚSICA ---
  this.load.audio('theme', 'assets/sound/music/overworld.mp3'); 
  this.load.audio('jump', 'assets/sound/effects/jump.mp3');
  this.load.audio('powerup', 'assets/sound/effects/powerup.mp3');
  this.load.audio('kick', 'assets/sound/effects/kick.mp3'); 
  this.load.audio('gameover', 'assets/sound/music/gameover.mp3');
  this.load.audio('bump', 'assets/sound/effects/bump.mp3'); 
  this.load.audio('sprout', 'assets/sound/effects/sprout.mp3'); 
}

function create () {
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

  // --- CREACIÓN DEL JUGADOR (Jaiba viva un 20% más pequeña: 0.048) ---
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0.5, 0.5)
    .setCollideWorldBounds(true)
    .setGravityY(300);
    
  this.mario.setScale(0.048); 

  // Ajuste fino de hitbox para la escala 0.048
  this.mario.body.setSize(160, 220);
  this.mario.body.setOffset(56, 320);
  
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
      mario.setScale(0.048); 
      
      mario.body.setSize(160, 220);
      mario.body.setOffset(48, 780);
      mario.anims.play('jaiba-eat-mushroom');

      mario.once('animationcomplete-jaiba-eat-mushroom', () => {
        mario.isBig = true;
        mario.isEating = false;
        mario.body.allowGravity = true; 
        
        if (this.cache.audio.exists('powerup')) {
          this.sound.play('powerup');
        }

        mario.setTexture('mario-grow');
        mario.setScale(0.072); // Jaiba gigante proporcionalmente reducida
        mario.y -= 15; 
        
        mario.body.setSize(160, 160);
        mario.body.setOffset(56, 380);
        
        mario.body.reset(mario.x, mario.y);
      });
    }
  });

  // --- LÓGICA DE INTERACCIÓN GOOMBA ---
  this.physics.add.collider(this.mario, this.goombas, (mario, goombaHit) => {
    if (mario.isEating || mario.isDead) return;
    
    if (mario.body.touching.down && goombaHit.body.touching.up) {
      mario.setVelocityY(-160); 
      
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
        mario.setScale(0.048);
        
        mario.y -= 5;
        mario.body.setSize(160, 220);
        mario.body.setOffset(56, 320);
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
        
        // La animación de muerte mantiene su tamaño solicitado (0.06)
        mario.setTexture('mario-dead');
        mario.setScale(0.06); 
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

function update () {
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

  // Ajustado ligeramente la potencia del salto para la nueva escala pequeña
  if (this.keys.up.isDown && this.mario.body.touching.down) {
    this.mario.setVelocityY(-260);
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
