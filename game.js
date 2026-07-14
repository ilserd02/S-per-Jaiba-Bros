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
      debug: true // Muestra las cajas rosas de colisión para ajustar saltos
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
  this.load.image('mysteryBox', 'assets/scenery/overworld/misteryBlock.png')
  this.load.image('emptyBox', 'assets/scenery/overworld/emptyBlock.png')
  this.load.image('mushroom', 'assets/collectibles/super-mushroom.png') // Ruta corregida

  // --- TUBERÍAS (RUTAS CORREGIDAS EXACTAS) ---
  this.load.image('tube-small', 'assets/scenery/vertical-small-tube.png') // Ruta corregida
  this.load.image('tube-medium', 'assets/scenery/vertical-large-tube.png') // Ruta corregida
  this.load.image('tube-large', 'assets/scenery/vertical-large-tube.png') // Ruta corregida

  // --- SPRITES DEL JUGADOR ---
  this.load.spritesheet(
    'mario', 
    'assets/entities/mario.png',
    { frameWidth: 290, frameHeight: 902 } 
  )
  this.load.spritesheet(
    'mario-grow', 
    'assets/entities/mario-grown.png', 
    { frameWidth: 273, frameHeight: 959 } 
  )

  // --- ENEMIGO GOOMBA ---
  this.load.spritesheet(
    'goomba',
    'assets/entities/overworld/goomba.png', // Ruta corregida
    { frameWidth: 16, frameHeight: 16 } // Tamaño estándar del sprite de Goomba
  )

  this.load.audio('gameover', 'assets/sound/music/gameover.mp3')
}

function create () {
  this.add.image(100, 50, 'cloud1').setOrigin(0, 0).setScale(0.15)

  this.floor = this.physics.add.staticGroup()

  // --- SUELO ---
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

  // --- COLOCACIÓN DE LAS TUBERÍAS ---
  this.floor.create(500, config.height - 32, 'tube-small').setOrigin(0.5, 0.5).refreshBody()
  this.floor.create(580, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).refreshBody()
  this.floor.create(700, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).refreshBody()

  // --- BLOQUES MISTERIOSOS ---
  this.mysteryBoxes = this.physics.add.staticGroup()
  const box = this.mysteryBoxes.create(320, config.height - 90, 'mysteryBox').setOrigin(0, 0.5).refreshBody()
  box.hasItem = true 

  this.mushrooms = this.physics.add.group()
  this.goombas = this.physics.add.group()

  // --- GENERACIÓN DE GOOMBAS ---
  const goomba1 = this.goombas.create(450, config.height - 30, 'goomba').setOrigin(0.5, 0.5)
  goomba1.setVelocityX(-40) // Va hacia la izquierda
  
  const goomba2 = this.goombas.create(540, config.height - 30, 'goomba').setOrigin(0.5, 0.5)
  goomba2.setVelocityX(40)  // Va hacia la derecha

  // Animación del Goomba caminando
  this.anims.create({
    key: 'goomba-walk',
    frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
    frameRate: 5,
    repeat: -1
  })

  // --- JAIBA PEQUEÑA ---
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0.5, 0.5)
    .setCollideWorldBounds(true)
    .setGravityY(300)
    .setScale(0.05) 

  this.mario.body.setSize(180, 400)
  this.mario.body.setOffset(55, 450)
  this.mario.isBig = false 
  
  // --- ANIMACIONES JUGADOR ---
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

  this.physics.world.setBounds(0, 0, 2000, config.height)
  
  // Colisiones físicas estables
  this.physics.add.collider(this.mario, this.floor)
  this.physics.add.collider(this.mushrooms, this.floor)
  
  // Los goombas caminan y rebotan al tocar tubos o bordes
  this.physics.add.collider(this.goombas, this.floor, (goombaObj) => {
    if (goombaObj.body.blocked.left || goombaObj.body.blocked.right) {
      goombaObj.setVelocityX(goombaObj.body.velocity.x * -1)
    }
  })

  // --- GOLPEAR MISTERY BLOCK -> EMPTY BLOCK ---
  this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
    if (mario.body.touching.up && boxHit.hasItem) {
      boxHit.hasItem = false
      boxHit.setTexture('emptyBox') // Se transforma en el bloque vacío
      boxHit.refreshBody()

      const mushroom = this.mushrooms.create(boxHit.x + 8, boxHit.y - 20, 'mushroom')
      mushroom.setOrigin(0.5, 0.5)
      mushroom.setScale(1) 
      mushroom.setVelocityX(60) 
    }
  })

  // --- RECOLECTAR HONGO Y CAMBIAR DE TAMAÑO ---
  this.physics.add.overlap(this.mario, this.mushrooms, (mario, mushroomHit) => {
    mushroomHit.destroy() 
    if (!mario.isBig) {
      mario.isBig = true
      mario.setTexture('mario-grow')
      mario.setScale(0.12)
      mario.body.setSize(240, 260)
      mario.body.setOffset(20, 320)
    }
  })

  // --- COMBATE CONTRA GOOMBAS ---
  this.physics.add.collider(this.mario, this.goombas, (mario, goombaHit) => {
    // Si saltas sobre él desde arriba...
    if (mario.body.touching.down && goombaHit.body.touching.up) {
      mario.setVelocityY(-180) // Impulso hacia arriba
      goombaHit.setVelocityX(0)
      goombaHit.body.enable = false
      goombaHit.setFrame(2) // Frame aplastado

      this.tweens.add({
        targets: goombaHit,
        alpha: 0,
        duration: 300,
        onComplete: () => { goombaHit.destroy() }
      })
    } else {
      // Si te golpea por los lados
      if (mario.isBig) {
        mario.isBig = false
        mario.setTexture('mario')
        mario.setScale(0.05)
        mario.body.setSize(180, 400)
        mario.body.setOffset(55, 450)
        goombaHit.setVelocityX(goombaHit.body.velocity.x * -1) // Rebota al dañarte
      } else {
        mario.isDead = true
        mario.setVelocity(0, -300)
        mario.setCollideWorldBounds(false)
        try { this.sound.add('gameover', { volume: 0.2 }).play() } catch(e){}
        setTimeout(() => this.scene.restart(), 2000)
      }
    }
  })

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  this.keys = this.input.keyboard.createCursorKeys()

  // Bloqueo de desplazamiento para las flechas
  this.input.keyboard.addCapture([
    Phaser.Input.Keyboard.KeyCodes.UP,
    Phaser.Input.Keyboard.KeyCodes.DOWN,
    Phaser.Input.Keyboard.KeyCodes.LEFT,
    Phaser.Input.Keyboard.KeyCodes.RIGHT
  ])
}

function update () {
  // Mueve las patitas de los goombas activos
  this.goombas.children.iterate(goomba => {
    if (goomba && goomba.body && goomba.body.enable) {
      goomba.anims.play('goomba-walk', true)
    }
  })

  if (this.mario.isDead) return

  const walkKey = this.mario.isBig ? 'jaiba-big-walk' : 'jaiba-walk'
  const idleKey = this.mario.isBig ? 'jaiba-big-idle' : 'jaiba-idle'

  // --- CONTROLES ---
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
    try { this.sound.add('gameover', { volume: 0.2 }).play() } catch(e){}

    setTimeout(() => { this.mario.setVelocityY(-350) }, 100)
    setTimeout(() => { this.scene.restart() }, 2000)
  }
}
