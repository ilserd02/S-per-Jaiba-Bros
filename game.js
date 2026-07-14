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
      debug: true // Para ver las cajas de colisión y el cuadro rosa
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

  // --- CONTENEDORES Y BLOCKS ---
  this.load.image('mysteryBox', 'assets/scenery/overworld/misteryBlock.png')
  this.load.image('emptyBox', 'assets/scenery/overworld/emptyBlock.png')
  this.load.image('mushroom', 'assets/entities/super-mushroom.png') 

  // --- TUBERÍAS ---
  this.load.image('tube-small', 'assets/scenery/overworld/vertical-small-tube.png')
  this.load.image('tube-medium', 'assets/scenery/overworld/vertical-medium-tube.png')
  this.load.image('tube-large', 'assets/scenery/overworld/vertical-large-tube.png')

  // --- JAIBA (PEQUEÑA Y GRANDE) ---
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

  // --- GOOMBA ENMIGO (3 cuadros: 2 caminan, 1 aplastado) ---
  this.load.spritesheet(
    'goomba',
    'assets/entities/goomba.png',
    { frameWidth: 16, frameHeight: 16 } // Dimensiones estándar de Goomba retro
  )

  this.load.audio('gameover', 'assets/sound/music/gameover.mp3')
}

function create () {
  this.add.image(100, 50, 'cloud1').setOrigin(0, 0).setScale(0.15)

  // Grupo estático para todo lo que no se mueve y sirve de suelo/paredes
  this.floor = this.physics.add.staticGroup()

  // --- SUELO CONTINUO ---
  for (let x = 0; x < 2000; x += 16) {
    if (x >= 600 && x <= 680) continue
    this.floor.create(x, config.height - 16, 'floorbricks').setOrigin(0, 0.5).refreshBody()
  }

  // --- BLOQUES FLOTANTES REPRODUCIDOS DEL MAPA ---
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

  // --- COLOCACIÓN DE LAS TUBERÍAS ---
  // Las agregamos al grupo estático para que actúen como paredes sólidas infranqueables
  this.floor.create(500, config.height - 32, 'tube-small').setOrigin(0.5, 0.5).refreshBody()
  this.floor.create(580, config.height - 40, 'tube-medium').setOrigin(0.5, 0.5).refreshBody()
  this.floor.create(700, config.height - 48, 'tube-large').setOrigin(0.5, 0.5).refreshBody()

  // --- RECTÁNGULOS DE BLOQUES MISTERIOSOS ---
  this.mysteryBoxes = this.physics.add.staticGroup()
  const box = this.mysteryBoxes.create(320, config.height - 90, 'mysteryBox').setOrigin(0, 0.5).refreshBody()
  box.hasItem = true 

  this.mushrooms = this.physics.add.group()

  // --- GRUPO FÍSICO DE ENEMIGOS (GOOMBAS) ---
  this.goombas = this.physics.add.group()

  // Creación de Goombas entre los espacios de las tuberías
  const goomba1 = this.goombas.create(450, config.height - 30, 'goomba').setOrigin(0.5, 0.5)
  goomba1.setVelocityX(-40) // Empieza caminando a la izquierda
  
  const goomba2 = this.goombas.create(540, config.height - 30, 'goomba').setOrigin(0.5, 0.5)
  goomba2.setVelocityX(40)  // Empieza caminando a la derecha

  // --- CONFIGURACIÓN DE LA JAIBA PEQUEÑA ---
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0.5, 0.5)
    .setCollideWorldBounds(true)
    .setGravityY(300)
    .setScale(0.05) 

  this.mario.body.setSize(180, 400)
  this.mario.body.setOffset(55, 450)
  this.mario.isBig = false 
  
  // --- ANIMACIONES ---
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

  // Animaciones del Goomba
  this.anims.create({
    key: 'goomba-walk',
    frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
    frameRate: 5,
    repeat: -1
  })

  this.physics.world.setBounds(0, 0, 2000, config.height)
  
  // --- COLISIONES Y ENCUENTROS ---
  this.physics.add.collider(this.mario, this.floor)
  this.physics.add.collider(this.mushrooms, this.floor)
  
  // Colisión de Goombas contra el suelo y tuberías
  this.physics.add.collider(this.goombas, this.floor, (goombaObj, floorObj) => {
    // Si el goomba choca por los lados (con las tuberías), invierte su dirección instantáneamente
    if (goombaObj.body.blocked.left || goombaObj.body.blocked.right) {
      goombaObj.setVelocityX(goombaObj.body.velocity.x * -1)
    }
  })

  // --- REGLA: GOLPEAR MISTERY BLOCK CAMBIA A EMPTYBLOCK ---
  this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
    if (mario.body.touching.up && boxHit.hasItem) {
      boxHit.hasItem = false
      
      // Cambia la textura directamente al bloque vacío de metal
      boxHit.setTexture('emptyBox')
      boxHit.refreshBody()

      const mushroom = this.mushrooms.create(boxHit.x + 8, boxHit.y - 20, 'mushroom')
      mushroom.setOrigin(0.5, 0.5)
      mushroom.setScale(1) 
      mushroom.setVelocityX(60) 
    }
  })

  // --- RECOLECTAR HONGO ---
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

  // --- COMBATE CON GOOMBAS (PISAR O SER HERIDO) ---
  this.physics.add.collider(this.mario, this.goombas, (mario, goombaHit) => {
    // Si caemos desde arriba sobre el Goomba...
    if (mario.body.touching.down && goombaHit.body.touching.up) {
      mario.setVelocityY(-180) // Impulso pequeño hacia arriba al aplastarlo
      
      goombaHit.setVelocityX(0) // Se frena por completo
      goombaHit.setFrame(2)      // Coloca el Frame de aplastado plano
      goombaHit.body.enable = false // Desactiva sus físicas para que no dañe mientras desaparece

      // Se desvanece y desaparece después de un momento corto
      this.tweens.add({
        targets: goombaHit,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          goombaHit.destroy()
        }
      })
    } else {
      // Si te toca de lado y eres grande, encoges, si eres pequeño mueres
      if (mario.isBig) {
        mario.isBig = false
        mario.setTexture('mario')
        mario.setScale(0.05)
        mario.body.setSize(180, 400)
        mario.body.setOffset(55, 450)
        // Pequeño tiempo de inmunidad
        goombaHit.setVelocityX(goombaHit.body.velocity.x * -1)
      } else {
        // Ejecuta la muerte del jugador
        mario.isDead = true
        mario.setVelocity(0, -300)
        mario.setCollideWorldBounds(false)
        this.sound.add('gameover', { volume: 0.2 }).play()
        setTimeout(() => this.scene.restart(), 2000)
      }
    }
  })

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  this.keys = this.input.keyboard.createCursorKeys()

  this.input.keyboard.addCapture([
    Phaser.Input.Keyboard.KeyCodes.UP,
    Phaser.Input.Keyboard.KeyCodes.DOWN,
    Phaser.Input.Keyboard.KeyCodes.LEFT,
    Phaser.Input.Keyboard.KeyCodes.RIGHT
  ])
}

function update () {
  // Asegura que los goombas vivos sigan reproduciendo su marcha
  this.goombas.children.iterate(goomba => {
    if (goomba && goomba.body && goomba.body.enable) {
      goomba.anims.play('goomba-walk', true)
    }
  })

  if (this.mario.isDead) return

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
