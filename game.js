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
      debug: true
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

  // Cargamos la jaiba como spritesheet dividida en sus 6 frames
  // Buscamos esta sección y cambiamos los tamaños:
this.load.spritesheet(
    'mario', 
    'assets/entities/mario.png',
    { frameWidth: 216, frameHeight: 606 } // <-- Nuevas medidas exactas para la cuadrícula
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

  // Obstáculo
  this.floor.create(900, config.height - 32, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  this.floor.create(916, config.height - 32, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  this.floor.create(916, config.height - 48, 'floorbricks').setOrigin(0, 0.5).refreshBody()

  // Creamos la Jaiba y la reducimos un poco para que no sea gigante
this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0.5, 0.5)
    .setCollideWorldBounds(true)
    .setGravityY(300)
    .setScale(0.08) // Escala adaptada para la nueva resolución

  // Ajustamos la caja de colisión para que toque el suelo
  // Ancho: 180, Alto: 380 (quita el espacio vacío de arriba y abajo)
  this.mario.body.setSize(180, 380)
  // Desplazamos la caja hacia abajo para que quede justo en sus patas
  this.mario.body.setOffset(18, 200)
  //
 this.anims.create({
    key: 'jaiba-walk',
    // Los cuadros 7, 8, 9, 10 equivalen al índice 6, 7, 8, 9 en programación
    frames: this.anims.generateFrameNumbers('mario', { start: 6, end: 9 }),
    frameRate: 12,
    repeat: -1
  })

  this.anims.create({
    key: 'jaiba-idle',
    frames: [{ key: 'mario', frame: 0 }] // Posición quieta (el cuadro 1)
  })
  //

  this.physics.world.setBounds(0, 0, 2000, config.height)
  this.physics.add.collider(this.mario, this.floor)

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  this.keys = this.input.keyboard.createCursorKeys()
}

function update () {
  if (this.mario.isDead) return

  if (this.keys.left.isDown) {
    this.mario.anims.play('jaiba-walk', true)
    this.mario.x -= 2
    this.mario.flipX = true
  } else if (this.keys.right.isDown) {
    this.mario.anims.play('jaiba-walk', true)
    this.mario.x += 2
    this.mario.flipX = false
  } else {
    this.mario.anims.play('jaiba-idle', true)
  }

  if (this.keys.up.isDown && this.mario.body.touching.down) {
    this.mario.setVelocityY(-250)
  }

  if (this.mario.y >= config.height) {
    this.mario.isDead = true
    this.mario.setCollideWorldBounds(false)
    this.sound.add('gameover', { volume: 0.2 }).play()

    setTimeout(() => {
      this.mario.setVelocityY(-350)
    }, 100)

    setTimeout(() => {
      this.scene.restart()
    }, 2000)
  }
}

