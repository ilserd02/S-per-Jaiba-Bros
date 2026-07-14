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

  // Assets con tus nombres reales
  this.load.image('mysteryBox', 'assets/scenery/overworld/floorbricks.png')
  this.load.image('mushroom', 'assets/entities/super-mushroom.png') 

  // Spritesheet de la jaiba pequeña (Opción 1: 1744x902)
  this.load.spritesheet(
    'mario', 
    'assets/entities/mario.png',
    { frameWidth: 290, frameHeight: 902 } 
  )

  // Spritesheet de la jaiba grande (1641x959)
  this.load.spritesheet(
    'mario-grow', 
    'assets/entities/mario-grow.png',
    { frameWidth: 273, frameHeight: 959 } 
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

  // --- MYSTERY BOX Y GRUPO DE HONGOS ---
  this.mysteryBoxes = this.physics.add.staticGroup()
  const box = this.mysteryBoxes.create(320, config.height - 90, 'mysteryBox').setOrigin(0, 0.5).refreshBody()
  box.hasItem = true 

  this.mushrooms = this.physics.add.group()

  // --- CONFIGURACIÓN DE LA JAIBA PEQUEÑA INICIAL ---
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0.5, 0.5)
    .setCollideWorldBounds(true)
    .setGravityY(300)
    .setScale(0.05) 

  // Ajuste inicial de la caja rosa (Tamaño Pequeño)
  this.mario.body.setSize(180, 400)
  this.mario.body.setOffset(55, 450)
  this.mario.isBig = false 
  
  // --- ANIMACIONES JAIBA PEQUEÑA ---
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

  // --- ANIMACIONES JAIBA GRANDE ---
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

  this.physics.world.setBounds(0, 0, 2000, config.height)
  
  // Colisiones bases
  this.physics.add.collider(this.mario, this.floor)
  this.physics.add.collider(this.mushrooms, this.floor)

  // --- COLISIÓN GOLPEAR CAJA DESDE ABAJO ---
  this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
    if (mario.body.touching.up && boxHit.hasItem) {
      boxHit.hasItem = false
      boxHit.setTint(0x555555) 

      const mushroom = this.mushrooms.create(boxHit.x + 8, boxHit.y - 20, 'mushroom')
      mushroom.setOrigin(0.5, 0.5)
      mushroom.setScale(1) 
      mushroom.setVelocityX(60) 
    }
  })

  // --- COLISIÓN OVERLAP PARA VOLVERSE GRANDE ---
  this.physics.add.overlap(this.mario, this.mushrooms, (mario, mushroomHit) => {
    mushroomHit.destroy() 

    if (!mario.isBig) {
      mario.isBig = true
      
      // Cambiamos la textura base al nuevo spritesheet grande
      mario.setTexture('mario-grow')
      mario.setScale(0.12)
      
      // Caja rosa optimizada para el nuevo archivo de la jaiba grande (anti-paredes)
      mario.body.setSize(240, 260)
      mario.body.setOffset(20, 320)
    }
  })

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  this.keys = this.input.keyboard.createCursorKeys()

  // --- BLOQUEO DE DESPLAZAMIENTO DEL NAVEGADOR ---
  // Esto captura las flechas para que no te muevan la barra de la ventana web
  this.input.keyboard.addCapture([
    Phaser.Input.Keyboard.KeyCodes.UP,
    Phaser.Input.Keyboard.KeyCodes.DOWN,
    Phaser.Input.Keyboard.KeyCodes.LEFT,
    Phaser.Input.Keyboard.KeyCodes.RIGHT
  ])
}

function update () {
  if (this.mario.isDead) return

  // Elegimos las llaves de animación correctas dinámicamente según el tamaño
  const walkKey = this.mario.isBig ? 'jaiba-big-walk' : 'jaiba-walk'
  const idleKey = this.mario.isBig ? 'jaiba-big-idle' : 'jaiba-idle'

  // --- MOVIMIENTO CON VELOCIDAD FÍSICA ---
  if (this.keys.left.isDown) {
    this.mario.setVelocityX(-120) 
    this.mario.anims.play(walkKey, true)
    this.mario.flipX = true
  } else if (this.keys.right.isDown) {
    this.mario.setVelocityX(120)  
    this.mario.anims.play(walkKey, true)
    this.mario.flipX = false
  } else {
    this.mario.setVelocityX(0)     
    this.mario.anims.play(idleKey, true)
  }

  if (this.keys.up.isDown && this.mario.body.touching.down) {
    this.mario.setVelocityY(-285)
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
