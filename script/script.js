class Player {
    constructor(game) {
        this.game = game
        this.width = 100
        this.height = 100
        this.x = this.game.width * 0.5 - this.width * 0.5
        this.y = this.game.height - this.height 
        this.speed = 3
        this.lives = 3
    }

    draw(context) {
        context.fillRect(this.x, this.y, this.width, this.height)
    }

    update() {
        if(this.game.keys.includes("ArrowLeft")) {
            this.x -= this.speed
        } 
        if(this.game.keys.includes("ArrowRight")) {
            this.x += this.speed
        }

        // boundaries
        if (this.x < -this.width * 0.45) this.x = -this.width * 0.45
        else if (this.x > this.game.width - this.width * 0.55) this.x = this.game.width - this.width * 0.55
    }

    shoot() {   
        const projectile = this.game.getProjectile()
        if(projectile) projectile.start(this.x + this.width * 0.5, this.y)
    }

    restart() {
        this.x = this.game.width * 0.5 - this.width * 0.5
        this.y = this.game.height - this.height 
        this.lives = 3
    }
}

class Projectile {

    constructor() {
        this.width = 4
        this.height = 20
        this.speed = 20
        this.x = 0
        this.y = 0
        this.free = true 
    }
    draw(context) {
        if(!this.free)
            context.fillRect(this.x, this.y, this.width, this.height)
    }
    update() {
        if(!this.free) {
            this.y -= this.speed
            if(this.y < -this.height) this.reset()
        }
            
    }
    start(x, y) {
        this.x = x - this.width * 0.5
        this.y = y
        this.free = false
    }
    reset() {
        this.free = true
    }
}

class Enemy {

    constructor(game, relativeX, relativeY) {
        if(this.constructor.name === Enemy.name) {
            throw new Error("Base class cannot be called immediately")
        }

        this.game = game
        this.width = this.game.enemySize
        this.height = this.game.enemySize
        this.x = 0
        this.y = 0
        this.relativeX = relativeX
        this.relativeY = relativeY
        this.markedForDeletion = false
    }
    draw(context) {
        context.drawImage(this.image, this.frameX * this.game.enemySize, this.frameY * this.game.enemySize, this.game.enemySize, this.game.enemySize,this.x, this.y, this.width, this.height)
    }
    update(x, y) {
        this.x = x + this.relativeX
        this.y = y + this.relativeY

        // projectile collision enemies 
        this.game.projectilesPool.forEach(projectile => {
            if(!projectile.free && this.game.checkCollision(this, projectile)) {
                this.hit(1)
                projectile.reset()
            }
        })

        if(this.lives < 1) {
            this.frameX++
            if(this.frameX > this.maxFrame) {
                this.markedForDeletion = true
                if(!this.game.isGameOver) this.game.score+=this.maxLives
            }
        }

        // player collision enemies
        if(this.game.checkCollision(this, this.game.player)) {
            this.markedForDeletion = true
            this.game.player.lives--

            if(!this.game.isGameOver && this.game.score > 0) this.game.score--
            if(this.game.player.lives < 1) this.game.isGameOver = true
        }

        if(this.y + this.height > this.game.height) {
            this.game.isGameOver = true
            this.markedForDeletion = true
        }
    }
    hit(damage) {
        this.lives-= damage
    }
}

class Beetlemorph extends Enemy {
    constructor(game, relativeX, relativeY) {
        super(game, relativeX, relativeY)
        this.image = document.getElementById("beetlemorph")
        this.frameX = 0
        this.frameY = Math.floor(Math.random() * 4)
        this.maxFrame = 2;
        this.lives = 1;
        this.maxLives = this.lives
    }
}

class Wave {
    constructor(game) {
        this.game = game
        this.width = this.game.columns * this.game.enemySize
        this.height = this.game.rows * this.game.enemySize
        this.x = this.game.width * 0.5 - this.game.enemySize
        this.y = -this.height
        this.speedX = Math.random() < 0.5 ? -1 : 1
        this.speedY = 0
        this.nextY = 0
        this.enemies = []
        this.nextWaveTriggered = false
        this.create()
    }

    render(context) {
        if(this.y < 0) this.y += 5
        if(this.y >= this.nextY && this.speedY) this.speedY = 0
        if(this.x < 0 || this.x > this.game.width - this.width) {
            this.speedX *= -1
            this.speedY = 3
            this.nextY += this.game.enemySize
        }
        this.x += this.speedX
        this.y += this.speedY

        this.enemies.forEach(enemy => {
            enemy.update(this.x, this.y)
            enemy.draw(context)
        })
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion)
    }

    create() {
        for(let y = 0; y < this.game.rows; y++) {
            for(let x = 0; x < this.game.columns; x++) {
                const relativeX = x * this.game.enemySize
                const relativeY = y * this.game.enemySize
                this.enemies.push(new Beetlemorph(this.game, relativeX, relativeY))
            }
        }
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.width = canvas.width
        this.height = canvas.height
        this.player = new Player(this)
        this.keys = []

        this.projectilesPool = []
        this.numberOfProjectiles = 10 
        this.createProjectiles()
        this.fired = false

        this.columns = 3
        this.rows = 3
        this.enemySize = 80

        this.waves = []
        this.waves.push(new Wave(this))
        this.waveCount = 1

        this.score = 0
        this.isGameOver = false

        window.addEventListener("keydown", (e) => {
            if(e.key === "1" && !this.fired) this.player.shoot()
            this.fired = true

            if(!this.keys.includes(e.key)) this.keys.push(e.key)
            if(e.key === "r" && this.isGameOver) this.restart()
        })
        window.addEventListener("keyup", (e) => {
            const i = this.keys.indexOf(e.key)
            if(i > -1) this.keys.splice(i, 1)
            this.fired = false
        })
    }

    render(context) {
        this.player.draw(context)
        this.player.update()

        this.projectilesPool.forEach(projectile => {
            projectile.update()
            projectile.draw(context)
        })

        this.waves.forEach(wave => {
            wave.render(context)
            if(wave.enemies.length < 1 && !wave.nextWaveTriggered && !this.isGameOver) {
                this.newWave()
                this.waveCount++
                wave.nextWaveTriggered = true
                if(this.player.lives <= 7) this.player.lives++
            }
        })

        this.drawStatusText(context)
    }

    createProjectiles() {
        for(let i = 0; i < this.numberOfProjectiles; i++) {
            this.projectilesPool.push(new Projectile())
        }
    }

    getProjectile() {
        for(let i = 0; i < this.projectilesPool.length; i++) {
            if(this.projectilesPool[i].free) return this.projectilesPool[i]
        }
    }
    // simple axis aligned rectangles collision
    checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        )
    }

    drawStatusText(context) {
        context.save()
        context.shadowOffsetX = 2
        context.shadowOffsetY = 2
        context.shadow = "black"
        context.fillText("Score: " + this.score, 20, 40)
        context.fillText("Wave: " + this.waveCount, 20, 80)
        if(this.isGameOver) {
            context.textAlign = "center"
            context.font = "100px impact"
            context.fillText("GAME OVER!", this.width * 0.5, this.height * 0.5 )
            context.font = "20px impact"
            context.fillText("Press R to restart!", this.width * 0.5, this.height * 0.5 + 30)
        }
        for(let i =1; i<= this.player.lives; i++) {
            context.fillRect(20 * i, 100, 10,25)
        }
        context.restore()
    }
    newWave() {
        if(Math.random() < 0.6 && this.columns * this.enemySize < this.width * 0.8) 
            this.columns++
        else if (this.rows * this.enemySize < this.height * 0.6) 
            this.rows++
        this.waves.push(new Wave(this))
    }
    restart() {
        this.player.restart()
        this.columns = 3
        this.rows = 3

        this.waves = []
        this.waves.push(new Wave(this))
        this.waveCount = 1

        this.score = 0
        this.isGameOver = false
    }
}

window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas-main")
    const ctx = canvas.getContext("2d")
    canvas.width = 600
    canvas.height = 800
    ctx.fillStyle="white"
    ctx.strokeStyle="white"
    ctx.font = "30px impact"

    const game = new Game(canvas)

    function animate() {
        ctx.clearRect(0,0,canvas.width, canvas.height)
        game.render(ctx)
        requestAnimationFrame(animate)
    }
    animate()
})