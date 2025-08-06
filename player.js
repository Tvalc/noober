// player.js

class Player {
    constructor(x, y, name, color, isAI) {
        this.x = x;
        this.y = y;
        this.radius = 29;
        this.name = name;
        this.color = color;
        this.isAI = isAI;
        this.eliminated = false;
        this.holdingBall = false;
        this.catching = false;
        this.catchTimer = 0;
        this.justThrew = false;
        this.speed = 238;
        this.holdBallObj = null;
    }

    handleInput(input, arena) {
        if (this.eliminated) return;
        let dx = 0, dy = 0;
        if (input.left) dx -= 1;
        if (input.right) dx += 1;
        if (input.up) dy -= 1;
        if (input.down) dy += 1;
        if (dx || dy) {
            const mag = Math.sqrt(dx * dx + dy * dy);
            this.x += (dx / (mag || 1)) * this.speed * 0.016;
            this.y += (dy / (mag || 1)) * this.speed * 0.016;
            this.keepInArena(arena);
        }
    }

    handleAI(balls, players, arena) {
        if (this.eliminated) return;
        // If holding ball, move toward nearest opponent
        if (this.holdingBall) {
            let nearest = null, minDist = 99999;
            for (let p of players) {
                if (p === this || p.eliminated) continue;
                const d = Math.abs(p.y - this.y) + Math.abs(p.x - this.x);
                if (d < minDist) { minDist = d; nearest = p; }
            }
            if (nearest) {
                const dx = nearest.x - this.x;
                const dy = nearest.y - this.y;
                const mag = Math.sqrt(dx * dx + dy * dy);
                this.x += (dx / (mag || 1)) * this.speed * 0.012;
                this.y += (dy / (mag || 1)) * this.speed * 0.012;
            }
        } else {
            // Move toward nearest free ball
            let minDist = 99999, nearestBall = null;
            for (let b of balls) {
                if (!b.inMotion && !b.heldBy) {
                    const d = Math.abs(b.x - this.x) + Math.abs(b.y - this.y);
                    if (d < minDist) { minDist = d; nearestBall = b; }
                }
            }
            if (nearestBall) {
                const dx = nearestBall.x - this.x, dy = nearestBall.y - this.y;
                const mag = Math.sqrt(dx * dx + dy * dy);
                if (mag > 5) {
                    this.x += (dx / (mag || 1)) * this.speed * 0.016;
                    this.y += (dy / (mag || 1)) * this.speed * 0.016;
                }
            } else {
                // Idle, random jitter
                if (Math.random() < 0.012) {
                    this.x += (Math.random() - 0.5) * 2.2;
                    this.y += (Math.random() - 0.5) * 2.2;
                }
            }
        }
        this.keepInArena(arena);
    }

    keepInArena(arena) {
        if (!arena) return;
        this.x = Math.max(arena.bounds.left + this.radius, Math.min(this.x, arena.bounds.right - this.radius));
        this.y = Math.max(arena.bounds.top + this.radius, Math.min(this.y, arena.bounds.bottom - this.radius));
    }

    update(dt, arena) {
        if (this.catching) {
            this.catchTimer -= dt;
            if (this.catchTimer <= 0) this.catching = false;
        }
        this.keepInArena(arena);
        if (this.holdingBall && this.holdBallObj) {
            // Hold ball at front (above for player, below for AI)
            const offsetY = this.isAI ? this.radius + 3 : -(this.radius + 3);
            this.holdBallObj.x = this.x;
            this.holdBallObj.y = this.y + offsetY;
        }
    }

    throwBall(direction, balls) {
        if (!this.holdingBall || !this.holdBallObj) return false;
        // Throw the held ball
        const ball = this.holdBallObj;
        ball.inMotion = true;
        ball.heldBy = null;
        ball.vx = direction.x * 500;
        ball.vy = direction.y * 500;
        ball.thrower = this;
        this.holdingBall = false;
        this.holdBallObj = null;
        return true;
    }

    checkBallCatch(ball) {
        if (this.eliminated || !this.catching || this.holdingBall) return false;
        // Ball must be close and coming toward player
        const dx = ball.x - this.x, dy = ball.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.radius + ball.radius + 2) {
            if (this.isAI) return Math.random() < 0.7; // AI sometimes fails
            else return true;
        }
        return false;
    }

    checkBallHit(ball) {
        if (this.eliminated) return false;
        if (this.catching) return false;
        const dx = ball.x - this.x, dy = ball.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.radius + ball.radius - 5) {
            return true;
        }
        return false;
    }

    draw(ctx) {
        // Body
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.globalAlpha = this.eliminated ? 0.36 : 1;
        ctx.fillStyle = this.color;
        ctx.shadowColor = '#222';
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Face
        ctx.beginPath();
        ctx.arc(this.x, this.y - 8, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe';
        ctx.globalAlpha = this.eliminated ? 0.18 : 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
        // Name
        ctx.font = '15px sans-serif';
        ctx.fillStyle = '#242';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y + this.radius + 19);
        // Ball indicator
        if (this.holdingBall && !this.eliminated) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - 12, 0, Math.PI * 2);
            ctx.strokeStyle = '#fc0';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        // Catching
        if (this.catching && !this.eliminated) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#0ff';
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.56;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }
}

window.Player = Player;