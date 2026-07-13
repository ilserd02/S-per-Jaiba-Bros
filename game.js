/* global Phaser */

import { createAnimations } from "./animations.js"

/* global Phaser */

const config = {
  type: Phaser.AUTO, // webgl, canvas
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
    preload, // se ejecuta para precargar recursos
    create, // se ejecuta cuando el juego comienza
    update // se ejecuta en cada frame
  }
}

new Phaser.Game(config)

function preload () {
  this.load.image(
    'cloud1',
    'assets/scenery/overworld/cloud1.png'
  )

  this.load.image(
    'floorbricks',
    'assets/scenery/overworld/floorbricks.png'
  )

  // CAMBIO 1: Ahora cargamos la jaiba como una IMAGEN fija, no como spritesheet
  this.load.image(
    'mario', 
    'assets/entities/mario.png'
  )

  this.load.audio('gameover', 'assets/sound/music/gameover.mp3')
}

function create () {
  this.add.image(100, 50, 'cloud1')
    .setOrigin(0, 0)
    .setScale(0.15)

  this.floor = this.physics.add.staticGroup()

  // --- EL SUELO CONTINUO ---
  for (let x = 0; x < 2000; x += 16) {
    if (x >= 600 && x <= 680) {
      continue; // Hueco para caerse
    }
    this.floor
      .create(x, config.height - 16, 'floorbricks')
      .setOrigin(0, 0.5)
      .refreshBody()
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
    this.floor
      .create(bloque.x, bloque.y, 'floorbricks')
      .setOrigin(0, 0.5)
      .refreshBody()
  })

  // Obstáculo
  this.floor.create(900, config.height - 32, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  this.floor.create(916, config.height - 32, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  this.floor.create(916, config.height - 48, 'floorbricks').setOrigin(0, 0.5).refreshBody()

  // CAMBIO 2: Creamos el personaje y le agregamos .setScale(0.15) al final para controlar su tamaño
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(300)
    .setScale(0.15) 

  this.physics.world.setBounds(0, 0, 2000, config.height)
  this.physics.add.collider(this.mario, this.floor)

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  // CAMBIO 3: Quitamos la línea de las animaciones viejas que daba error
  this.keys = this.input.keyboard.createCursorKeys()
}

function update () {
  if (this.mario.isDead) return

  // CAMBIO 4: Quitamos todas las líneas "this.mario.anims.play(...)" de aquí adentro
  if (this.keys.left.isDown) {
    this.mario.x -= 2
    this.mario.flipX = true
  } else if (this.keys.right.isDown) {
    this.mario.x += 2
    this.mario.flipX = false
  }

  if (this.keys.up.isDown && this.mario.body.touching.down) {
    this.mario.setVelocityY(-300)
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
function preload () {
  this.load.image(
    'cloud1',
    'assets/scenery/overworld/cloud1.png'
  )

  this.load.image(
    'floorbricks',
    'assets/scenery/overworld/floorbricks.png'
  )

  this.load.spritesheet(
    'mario', // <--- id
    'assets/entities/mario.png',
    { frameWidth: 18, frameHeight: 16 }
  )

  this.load.audio('gameover', 'assets/sound/music/gameover.mp3')
} // 1.

function create () {
  // 1. Imagen de fondo (Nube)
  this.add.image(100, 50, 'cloud1')
    .setOrigin(0, 0)
    .setScale(0.15)

  // 2. Crear grupo estático para el suelo y plataformas
  this.floor = this.physics.add.staticGroup()

  // --- EL SUELO CONTINUO ---
  // Cada bloque mide 16 píxeles de ancho. Colocamos bloques seguidos hasta el final (2000 píxeles)
  for (let x = 0; x < 2000; x += 16) {
    // Dejamos un "vacío/hueco" para que Mario pueda caerse (por ejemplo, entre el píxel 600 y 680)
    if (x >= 600 && x <= 680) {
      continue; // Se salta este espacio y no dibuja suelo
    }
    
    this.floor
      .create(x, config.height - 16, 'floorbricks')
      .setOrigin(0, 0.5)
      .refreshBody()
  }

  // --- BLOQUES FLOTANTES (Estilo Mario) ---
  // Definimos las coordenadas (X, Y) donde queremos plataformas flotantes
  const bloquesFlotantes = [
    { x: 200, y: config.height - 80 },
    { x: 216, y: config.height - 80 },
    { x: 232, y: config.height - 80 },
    
    // Otro grupo más adelante y más alto
    { x: 400, y: config.height - 120 },
    { x: 416, y: config.height - 120 },
    
    // Bloques justo después del vacío
    { x: 750, y: config.height - 80 },
    { x: 766, y: config.height - 80 }
  ]

  // Dibujamos de golpe todos los bloques flotantes de la lista
  bloquesFlotantes.forEach(bloque => {
    this.floor
      .create(bloque.x, bloque.y, 'floorbricks')
      .setOrigin(0, 0.5)
      .refreshBody()
  })

  // --- OBSTÁCULOS / TUBERÍAS SIMULADAS ---
  // Estructuras en el piso que obligan a saltar
  this.floor.create(900, config.height - 32, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  this.floor.create(916, config.height - 32, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  this.floor.create(916, config.height - 48, 'floorbricks').setOrigin(0, 0.5).refreshBody() // Más alta

  // 3. Configuración de Mario
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(300)

  // 4. Límites y Colisiones
  this.physics.world.setBounds(0, 0, 2000, config.height)
  this.physics.add.collider(this.mario, this.floor)

  // 5. Cámara
  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  // Animaciones y controles
  createAnimations(this)
  this.keys = this.input.keyboard.createCursorKeys()
}

function update () { // 3. continuamente
  if (this.mario.isDead) return

  if (this.keys.left.isDown) {
    this.mario.anims.play('mario-walk', true)
    this.mario.x -= 2
    this.mario.flipX = true
  } else if (this.keys.right.isDown) {
    this.mario.anims.play('mario-walk', true)
    this.mario.x += 2
    this.mario.flipX = false
  } else {
    this.mario.anims.play('mario-idle', true)
  }

  if (this.keys.up.isDown && this.mario.body.touching.down) {
    this.mario.setVelocityY(-300)
    this.mario.anims.play('mario-jump', true)
  }

  if (this.mario.y >= config.height) {
    this.mario.isDead = true
    this.mario.anims.play('mario-dead')
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
