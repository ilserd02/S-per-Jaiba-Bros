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
}

new Phaser.Game(config)

function preload () {
  this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png')
  this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png')

  // --- BLOQUES Y ELEMENTOS ---
  this.load.spritesheet('mysteryBox', 'assets/blocks/overworld/misteryBlock.png', { frameWidth: 16, frameHeight: 16 })
  this.load.image('emptyBox', 'assets/blocks/overworld/emptyBlock.png')     
  this.load.image('mushroom', 'assets/collectibles/super-mushroom.png')

  // --- TUBERÍAS ---
  this.load.image('tube-small', 'assets/scenery/vertical-small-tube.png') 
  this.load.image('tube-medium', 'assets/scenery/vertical-large-tube.png') 
  this.load.image('tube-large', 'assets/scenery/vertical-large-tube.png') 

  // --- CONFIGURACIÓN DE SPRITESHEETS ---
  this.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 273, frameHeight: 547 }) 
  this.load.spritesheet('mario-grow', 'assets/entities/mario-grown.png', { frameWidth: 273, frameHeight: 547 }) 
  this.load.spritesheet('jaiba-eating', 'assets/entities/mario-eat.png', { frameWidth: 256, frameHeight: 1024 })
  this.load.spritesheet('mario-dead', 'assets/entities/mario-dead.png', { frameWidth: 273, frameHeight: 547 })

  // --- ENEMIGO GOOMBA ---
  this.load.spritesheet('goomba', 'assets/entities/overworld/goomba.png', { frameWidth: 16, frameHeight: 16 })

  // --- EFECTOS DE SONIDO ---
  this.load.audio('jump', 'assets/sound/effects/jump.mp3')
  this.load.audio('powerup', 'assets/sound/effects/powerup.mp3')
  this.load.audio('kick', 'assets/sound/effects/kick.mp3') 
  this.load.audio('gameover', 'assets/sound/music/gameover.mp3')
}

function create () {
  this.add.image(100, 50, 'cloud1').setOrigin(0, 0).setScale(0.15)

  this.floor = this.physics.add.staticGroup()

  // --- GENERACIÓN DEL SUELO ---
  for (let x = 0; x < 2000; x += 16) {
    if (x >= 600 && x <= 680) continue
    this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  }

  // --- TUBERÍAS ---
  this.floor.create(500, config.height - 32, 'tube-small').setOrigin(0.5, 0.5).refreshBody()
  this.floor.create(580, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).refreshBody()
  this.floor.create(700, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).refreshBody()

  // --- ANIMACIONES DEL ENTORNO Y ENEMIGOS ---
  this.anims.create({
    key: 'box-shine',
    frames: this.anims.generateFrameNumbers('mysteryBox', { start: 0, end: 2 }),
    frameRate: 6,
    repeat: -1
  })

  this.mysteryBoxes = this.physics.add.staticGroup()
  const box = this.mysteryBoxes.create(80, config.height - 90, 'mysteryBox').setOrigin(0, 0.5).refreshBody()
  box.hasItem = true 
  box.anims.play('box-shine', true)

  this.mushrooms = this.physics.add.group()
  this.goombas = this.physics.add.group()

  this.anims.create({
    key: 'goomba-walk',
    frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
    frameRate: 5,
    repeat: -1
  })

  const goomba1 = this.goombas.create(350, config.height - 60, 'goomba').setOrigin(0.5, 0.5)
  goomba1.setVelocityX(-40)
  goomba1.setCollideWorldBounds(true)

  // --- ANIMACIONES DE LA JAIBA ---
  this.anims.create({
    key: 'jaiba-walk',
    frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 3 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'jaiba-idle',
    frames: [{ key: 'mario', frame: 0 }]
  })

  this.anims.create({
    key: 'jaiba-big-walk',
    frames: this.anims.generateFrameNumbers('mario-grow', { start: 1, end: 3 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'jaiba-big-idle',
    frames: [{ key: 'mario-grow', frame: 0 }]
  })

  this.anims.create({
    key: 'jaiba-eat-mushroom',
    frames: this.anims.generateFrameNumbers('jaiba-eating', { start: 0, end: 5 }),
    frameRate: 6,
    repeat: 0
  })

  // MODIFICADO: frameRate reducido a 4 para que la animación de la muerte sea más pausada y tardada
  this.anims.create({
    key: 'jaiba-dead',
    frames: this.anims.generateFrameNumbers('mario-dead', { start: 0, end: 5 }),
