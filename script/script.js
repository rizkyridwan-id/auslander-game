class Player {
    constructor(game) {
        this.game = game
        this.width = 100
        this.height = 100
        this.x = this.game.width * 0.5 - this.width * 0.5
        this.y = this.game.height - this.height 
        this.speed = 3
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
        this.game = game
        this.width = this.game.enemySize
        this.height = this.game.enemySize
        this.x = 0
        this.y = 0
        this.relativeX = relativeX
        this.relativeY = relativeY
    }
    draw(context) {
        context.strokeRect(this.x, this.y, this.width, this.height)
    }
    update(x, y) {
        this.x = x + this.relativeX
        this.y = y + this.relativeY
    }
}

class Wave {
    constructor(game) {
        this.game = game
        this.width = this.game.columns * this.game.enemySize
        this.height = this.game.rows * this.game.enemySize
        this.x = 0
        this.y = -this.height
        this.speedX = 3
        this.speedY = 0
        this.enemies = []
        this.create()
    }

    render(context) {
        if(this.y < 0) this.y += 5
        this.speedY = 0
        if(this.x < 0 || this.x > this.game.width - this.width) {
            this.speedX *= -1
            this.speedY = this.game.enemySize
        }
        this.x += this.speedX
        this.y += this.speedY

        this.enemies.forEach(enemy => {
            enemy.update(this.x, this.y)
            enemy.draw(context)
        })
    }

    create() {
        for(let y = 0; y < this.game.rows; y++) {
            for(let x = 0; x < this.game.columns; x++) {
                const relativeX = x * this.game.enemySize
                const relativeY = y * this.game.enemySize
                this.enemies.push(new Enemy(this.game, relativeX, relativeY))
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

        this.columns = 3
        this.rows = 3
        this.enemySize = 60

        this.waves = []
        this.waves.push(new Wave(this))

        window.addEventListener("keydown", (e) => {
            if(!this.keys.includes(e.key)) this.keys.push(e.key)
            if(e.key === "1") this.player.shoot()
        })
        window.addEventListener("keyup", (e) => {
            const i = this.keys.indexOf(e.key)
            if(i > -1) this.keys.splice(i, 1)
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
        })
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
}

window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas-main")
    const ctx = canvas.getContext("2d")
    canvas.width = 600
    canvas.height = 800
    ctx.fillStyle="white"
    ctx.strokeStyle="white"

    const game = new Game(canvas)

    function animate() {
        ctx.clearRect(0,0,canvas.width, canvas.height)
        game.render(ctx)
        requestAnimationFrame(animate)
    }
    animate()
})