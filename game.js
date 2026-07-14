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
      debug: true // Para que veas exactamente dónde pisa el cuadro rosa
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

  // Mantenemos tus medidas del archivo 1298x1212
   this.load.spritesheet(
    'mario', 
    'assets/entities/mario.png',
    { frameWidth: 290, frameHeight: 902 } // <-- Medidas exactas para la Opción 1
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

  // --- NUEVA CONFIGURACIÓN FIJA DE LA JAIBA ---
// Hacemos el personaje más grande (lo dejamos en 0.12 como querías)
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0.5, 0.5)
    .setCollideWorldBounds(true)
    .setGravityY(300)
    .setScale(0.12) 

  // --- EL AJUSTE PARA LAS PAREDES ---
  // Subimos el ancho de la caja a 240 (antes estaba en 160) para que proteja los lados.
  // Ajustamos el alto a 260 para que cubra bien de pies a cabeza.
  this.mario.body.setSize(240, 260)
  
  // Modificamos el desfase horizontal (el primer número) a 25 para centrar la nueva caja ancha.
  // Mantenemos el vertical cerca de 300 o 310 para que no flote ni se hunda.
  this.mario.body.setOffset(25, 305)
  
  // --- ANIMACIONES ---
 this.anims.create({
    key: 'jaiba-walk',
    // Usamos los cuadros del 1 al 3 para la caminata fluida
    frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 3 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'jaiba-idle',
    frames: [{ key: 'mario', frame: 0 }] // Cuadro 0 cuando esté quieta
  })

  this.physics.world.setBounds(0, 0, 2000, config.height)
  this.physics.add.collider(this.mario, this.floor)

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  this.keys = this.input.keyboard.createCursorKeys()
}

function update () {
  if (this.mario.isDead) return

 // --- MOVIMIENTO CON VELOCIDAD FÍSICA (Corrige el traspaso de paredes) ---
  if (this.keys.left.isDown) {
    this.mario.setVelocityX(-120) // Mueve con física hacia la izquierda
    this.mario.anims.play('jaiba-walk', true)
    this.mario.flipX = true
  } else if (this.keys.right.isDown) {
    this.mario.setVelocityX(120)  // Mueve con física hacia la derecha
    this.mario.anims.play('jaiba-walk', true)
    this.mario.flipX = false
  } else {
    this.mario.setVelocityX(0)     // Se detiene en seco al soltar la tecla
    this.mario.anims.play('jaiba-idle', true)
  }

  // Al estar la caja bien apoyada, este condicional volverá a dejarte saltar
  if (this.keys.up.isDown && this.mario.body.touching.down) {
    this.mario.setVelocityY(-280)
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
