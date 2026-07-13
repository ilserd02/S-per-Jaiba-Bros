/* global Phaser */

import { createAnimations } from "./animations.js"

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
      debug: true // Mantiene el cuadro rosa activado para ver las físicas
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

  // Medidas de la nueva cuadrícula (1298x1212 dividida en 6 col x 2 filas)
  this.load.spritesheet(
    'mario', 
    'assets/entities/mario.png',
    { frameWidth: 216, frameHeight: 606 }
  )

  this.load.audio('gameover', 'assets/sound/music/gameover.mp3')
}

function create () {
  this.add.image(100, 50, 'cloud1').setOrigin(0, 0).setScale(0.15)

  this.floor = this.physics.add.staticGroup()

  // --- SUELO CONTINUO ---
  for (let x = 0; x < 2000; x += 16) {
    if (x >= 600 && x <= 680) continue
    this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  }

  // --- BLOQUES FLOTANTES ---
  const bloquesFlotantes = [
    { x: 200, y: config.height - 80 },
    { x: 216, y: config.height - 80 },
    { x: 232, y: config.height - 80 },
    { x: 400, y: config.height - 120 },
    { x: 416, y: config.height - 120 },
    { x: 750, y: config.height - 80 },
    { x: 766, y: config.height - 80 }
  ]

  bloquesFlotantes.forEach(bloque => {
    this.floor.create(bloque.x, bloque.y, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  })

  this.floor.create(900, config.height - 32, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  this.floor.create(916, config.height - 32, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  this.floor.create(916, config.height - 48, 'floorbricks').setOrigin(0, 0.5).refreshBody()

  // --- CONFIGURACIÓN DE LA JAIBA ---
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0.5, 0.5)
    .setCollideWorldBounds(true)
    .setGravityY(300)
    .setScale(0.08)

  // Aquí ajustamos el tamaño de la caja rosa para el estado quieto
  this.mario.body.setSize(180, 260) 
  this.mario.body.setOffset(18, 345)

  // --- ANIMACIONES ---
  this.anims.create({
    key: 'jaiba-walk',
    frames: this.anims.generateFrameNumbers('mario', { start: 6, end: 9 }),
    frameRate: 12,
    repeat: -1
  })

  this.anims.create({
    key: 'jaiba-idle',
    frames: [{ key: 'mario', frame: 0 }]
  })

  this.physics.world.setBounds(0, 0, 2000, config.height)
  this.physics.add.collider(this.mario, this.floor)

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  this.keys = this.input.keyboard.createCursorKeys()
}

function update () {
 // --- AJUSTE DE MOVIMIENTO, LOGÍTICA Y ALTURAS ---
  if (this.keys.left.isDown) {
    this.mario.anims.play('jaiba-walk', true)
    this.mario.x -= 2
    this.mario.flipX = true
    
    // Ajusta la caja rosa para la caminata a la izquierda
    this.mario.body.setSize(160, 220)
    this.mario.body.setOffset(28, 200) 
  } else if (this.keys.right.isDown) {
    this.mario.anims.play('jaiba-walk', true)
    this.mario.x += 2
    this.mario.flipX = false
    
    // Ajusta la caja rosa para la caminata a la derecha
    this.mario.body.setSize(160, 220)
    this.mario.body.setOffset(28, 200)
  } else {
    this.mario.anims.play('jaiba-idle', true)
    
    // Ajusta la caja rosa cuando se queda quieta para que no se hunda
    this.mario.body.setSize(160, 220)
    this.mario.body.setOffset(28, 340)
  }
}
