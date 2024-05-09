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
    canvas.height = window.innerHeight

    const game = new Game(canvas)

    function animate() {
        ctx.clearRect(0,0,canvas.width, canvas.height)
        game.render(ctx)
        requestAnimationFrame(animate)
    }
    animate()
})