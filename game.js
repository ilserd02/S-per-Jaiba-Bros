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
    const sceneryPositions = [40, 320, 600, 880, 1160, 1440, 1720];
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

    // --- GENERACIÓN DEL SUELO CONTINUO ---
    for (let x = 0; x < 2000; x += 16) {
      this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).setDepth(2).refreshBody();
    }

    // --- DISTRIBUCIÓN DEL NIVEL ELEVADA (EVITA ATASCAMIENTOS) ---

    // 1. Primer Bloque de Misterio Solitario (Contiene un Hongo)
    this.createMysteryBox(256, config.height - 96, true);

    // 2. Primera Estructura Combinada Elevada (Ladrillo - Misterio - Ladrillo - Misterio - Ladrillo)
    this.createBrick(320, config.height - 96);
    this.createMysteryBox(336, config.height - 96, false); 
    this.createBrick(352, config.height - 96);
    this.createMysteryBox(368, config.height - 96, false); 
    this.createBrick(384, config.height - 96);

    // 3. Bloque de Misterio Elevado superior (Ajustado proporcionalmente)
    this.createMysteryBox(352, config.height - 146, false);

    // 4. Las Tuberías Progresivas
    this.floor.create(496, config.height - 32
