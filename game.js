// --- CONFIGURACIÓN PRINCIPAL ---
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 256,
  height: 240,
  backgroundColor: '#5c94fc', // El azul que ya ves
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);

// --- ESCENA PRINCIPAL ---
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Carga de imágenes
    this.load.image('mario', 'assets/mario.png');
    this.load.image('floorbricks', 'assets/brick.png');
    this.load.image('mysteryBox', 'assets/block.png');
    this.load.image('emptyBox', 'assets/block-empty.png');
    this.load.image('tube-small', 'assets/pipe-small.png');
    this.load.image('mushroom', 'assets/mushroom.png');
    this.load.image('castle', 'assets/castle.png');
    this.load.spritesheet('goomba', 'assets/goomba.png', { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    const levelWidth = 1700;

    // Asegurar color del cielo
    this.cameras.main.setBackgroundColor('#5c94fc');

    // Grupos con físicas
    this.floor = this.physics.add.staticGroup();
    this.mysteryBoxes = this.physics.add.staticGroup();
    this.mushrooms = this.physics.add.group();
    this.goombas = this.physics.add.group();

    // 1. Crear el suelo a lo largo del nivel
    for (let x = 0; x < levelWidth; x += 16) {
      if (this.textures.exists('floorbricks')) {
        // Coloca los bloques justo en el borde inferior (y = 232)
        this.floor.create(x, 232, 'floorbricks').setOrigin(0, 0.5).refreshBody();
      }
    }

    // 2. Crear al personaje principal
    if (this.textures.exists('mario')) {
      // Aparece en x: 40, y: 180 (justo arriba del suelo)
      this.mario = this.physics.add.sprite(40, 180, 'mario')
        .setOrigin(0.5, 0.5)
        .setCollideWorldBounds(true);

      // Ajuste de escala adecuado para la pantalla de 256x240
      this.mario.setScale(0.08); 
      this.mario.body.setSize(180, 200);

      // Colisión con el piso
      this.physics.add.collider(this.mario, this.floor);
      this.physics.add.collider(this.goombas, this.floor);

      // Seguimiento de Cámara
      this.cameras.main.setBounds(0, 0, levelWidth, 240);
      this.cameras.main.startFollow(this.mario);
    }

    // Cargar bloques del mapa
    this.loadMap1_1();

    this.physics.world.setBounds(0, 0, levelWidth, 240);
    this.keys = this.input.keyboard.createCursorKeys();
  }

  loadMap1_1() {
    // Bloques de prueba a una altura visible (y: 160)
    const objetos = [
      { type: 'Block', x: 100, y: 160 },
      { type: 'Brick', x: 116, y: 160 },
      { type: 'Block', x: 132, y: 160 },
      { type: 'Pipe', x: 180, y: 208 }
    ];

    objetos.forEach(obj => {
      if (obj.type === 'Block' && this.textures.exists('mysteryBox')) {
        this.mysteryBoxes.create(obj.x, obj.y, 'mysteryBox').refreshBody();
      } else if (obj.type === 'Brick' && this.textures.exists('floorbricks')) {
        this.floor.create(obj.x, obj.y, 'floorbricks').refreshBody();
      } else if (obj.type === 'Pipe' && this.textures.exists('tube-small')) {
        this.floor.create(obj.x, obj.y, 'tube-small').refreshBody();
      }
    });

    if (this.mario && this.mysteryBoxes) {
      this.physics.add.collider(this.mario, this.mysteryBoxes);
    }
  }

  update() {
    if (!this.mario) return;

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
      this.mario.setVelocityY(-250);
    }
  }
}
