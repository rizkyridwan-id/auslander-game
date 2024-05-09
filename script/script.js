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
        this.x += this.speed
    }
}

class Projectiles {

}

class Enemy {

}

class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.width = canvas.width
        this.height = canvas.height
        this.player = new Player(this)
    }

    render(context) {
        this.player.draw(context)
        this.player.update()
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