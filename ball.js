// ball.js

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 17;
        this.vx = 0;
        this.vy = 0;
        this.inMotion = false;
        this.heldBy = null;
        this.thrower = null;
        this.friction = 0.92;
        this.bounce = 0.65;
    }

    update(dt, arena) {
        if (this.heldBy) {
            this.inMotion = false;
            this.x = this.heldBy.x;
            // Ball is positioned by player (handled in Player.update)
            this.y = this.heldBy.isAI
                ? this.heldBy.y + this.heldBy.radius + 3
                : this.heldBy.y - this.heldBy.radius - 3;
            this.vx = this.vy = 0;
            return;
        }
        if (this.inMotion) {
            // Move
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            // Friction
            this.vx *= Math.pow(this.friction, dt * 40);
            this.vy *= Math.pow(this.friction, dt * 40);
            // Bounce off arena
            if (arena) {
                let bounced = false;
                if (this.x < arena.bounds.left + this.radius) {
                    this.x = arena.bounds.left + this.radius;
                    this.vx = -this.vx * this.bounce;
                    bounced = true;
                }
                if (this.x > arena.bounds.right - this.radius) {
                    this.x = arena.bounds.right - this.radius;
                    this.vx = -this.vx * this.bounce;
                    bounced = true;
                }
                if (this.y < arena.bounds.top + this.radius) {
                    this.y = arena.bounds.top + this.radius;
                    this.vy = -this.vy * this.bounce;
                    bounced = true;
                }
                if (this.y > arena.bounds.bottom - this.radius) {
                    this.y = arena.bounds.bottom - this.radius;
                    this.vy = -this.vy * this.bounce;
                    bounced = true;
                }
                if (bounced && Math.abs(this.vx) < 35 && Math.abs(this.vy) < 35) {
                    // Stop ball if too slow after bounce
                    this.vx = this.vy = 0;
                    this.inMotion = false;
                }
            }
            // If slow enough, stop
            if (Math.abs(this.vx) + Math.abs(this.vy) < 12) {
                this.inMotion = false;
            }
        } else if (!this.heldBy) {
            // Idle: can be picked up if close
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f90';
        ctx.shadowColor = '#c81';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        // White stripe
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 6, Math.PI / 4, Math.PI * 5 / 4);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 6;
        ctx.stroke();
        // Outline
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#943900';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }
}

window.Ball = Ball;