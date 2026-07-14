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

  // --- ENEMIGO GOOMBA ---
  this.load.spritesheet('goomba', 'assets/entities/overworld/goomba.png', { frameWidth: 16, frameHeight: 16 })

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

  // --- ANIMACIÓN DE LA CAJA MISTERIOSA ---
  this.anims.create({
    key: 'box-shine',
    frames: this.anims.generateFrameNumbers('mysteryBox', { start: 0, end: 2 }),
    frameRate: 6,
    repeat: -1
  })

  // --- CREACIÓN DE LA CAJA ---
  this.mysteryBoxes = this.physics.add.staticGroup()
  const box = this.mysteryBoxes.create(80, config.height - 90, 'mysteryBox').setOrigin(0, 0.5).refreshBody()
  box.hasItem = true 
  box.anims.play('box-shine', true)

  this.mushrooms = this.physics.add.group()
  this.goombas = this.physics.add.group()

  // --- GOOMBAS ---
  const goomba1 = this.goombas.create(450, config.height - 30, 'goomba').setOrigin(0.5, 0.5)
  goomba1.setVelocityX(-40)

  this.anims.create({
    key: 'goomba-walk',
    frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
    frameRate: 5,
    repeat: -1
  })

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

  // --- CREACIÓN DEL JUGADOR ---
  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0.5, 0.5)
    .setCollideWorldBounds(true)
    .setGravityY(300)
    .setScale(0.04) 

  // Caja limpia inicial
  this.mario.body.setSize(240, 500)
  this.mario.body.setOffset(15, 20)
  
  this.mario.isBig = false 
  this.mario.isEating = false 

  this.physics.world.setBounds(0, 0, 2000, config.height)
  
  this.physics.add.collider(this.mario, this.floor)
  this.physics.add.collider(this.mushrooms, this.floor)
  this.physics.add.collider(this.goombas, this.floor)

  // Golpear bloque misterioso
  this.physics.add.collider(this.mario, this.mysteryBoxes, (mario, boxHit) => {
    if (mario.body.touching.up && boxHit.hasItem) {
      boxHit.hasItem = false
      boxHit.anims.stop()
      boxHit.setTexture('emptyBox') 
      boxHit.refreshBody()

      const mushroom = this.mushrooms.create(boxHit.x + 8, boxHit.y - 18, 'mushroom')
      mushroom.setOrigin(0.5, 0.5)
      mushroom.setVelocityX(50) 
    }
  })

  // --- REPARADO DEFINITIVO: EVITAR ATRAPADO EN BLOQUES ---
  this.physics.add.overlap(this.mario, this.mushrooms, (mario, mushroomHit) => {
    if (mario.isEating) return 
    
    mushroomHit.destroy() 
    
    if (!mario.isBig) {
      mario.isEating = true
      mario.setVelocity(0, 0)
      mario.body.allowGravity = false 
      
      mario.setTexture('jaiba-eating')
      mario.setScale(0.04) 
      mario.anims.play('jaiba-eat-mushroom')

      mario.once('animationcomplete-jaiba-eat-mushroom', () => {
        mario.isBig = true
        mario.isEating = false
        mario.body.allowGravity = true 
        
        mario.setTexture('mario-grow')
        mario.setScale(0.08) 
        
        // REPOSICIONAMIENTO SEGURO: Empuja al jugador hacia arriba para que no lo absorba el piso
        mario.y -= 25 
        
        // Caja física optimizada y limpia para el tamaño grande
        mario.body.setSize(240, 500)
        mario.body.setOffset(15, 20)
        
        // Forzar al motor físico a recalcular la posición fuera de colisiones
        mario.body.reset(mario.x, mario.y)
      })
    }
  })

  // Interacción Goombas
  this.physics.add.collider(this.mario, this.goombas, (mario, goombaHit) => {
    if (mario.isEating) return 
    
    if (mario.body.touching.down && goombaHit.body.touching.up) {
      mario.setVelocityY(-180) 
      goombaHit.setVelocityX(0)
      goombaHit.body.enable = false
      goombaHit.setFrame(2)

      this.tweens.add({
        targets: goombaHit,
        alpha: 0,
        duration: 300,
        onComplete: () => { goombaHit.destroy() }
      })
    } else {
      if (mario.isBig) {
        mario.isBig = false
        mario.setTexture('mario') 
        mario.setScale(0.04)
        mario.y -= 10
        mario.body.setSize(240, 500)
        mario.body.setOffset(15, 20)
        mario.body.reset(mario.x, mario.y)
      } else {
        mario.isDead = true
        mario.setVelocity(0, -300)
        mario.setCollideWorldBounds(false)
        setTimeout(() => this.scene.restart(), 2000)
      }
    }
  })

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  this.keys = this.input.keyboard.createCursorKeys()
}

function update () {
  this.goombas.children.iterate(goomba => {
    if (goomba && goomba.body && goomba.body.enable) {
      goomba.anims.play('goomba-walk', true)
    }
  })

  if (this.mario.isDead || this.mario.isEating) return

  const walkKey = this.mario.isBig ? 'jaiba-big-walk' : 'jaiba-walk'
  const idleKey = this.mario.isBig ? 'jaiba-big-idle' : 'jaiba-idle'

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
    setTimeout(() => { this.scene.restart() }, 2000)
  }
}
