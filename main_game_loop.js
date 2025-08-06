// main_game_loop.js

// Defensive dependency checks
const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Ensure all dependencies are loaded
function dependenciesReady() {
    return (
        typeof window.Player !== 'undefined' &&
        typeof window.Ball !== 'undefined' &&
        typeof window.Arena !== 'undefined' &&
        typeof window.UI !== 'undefined'
    );
}

class DodgeBallGame {
    constructor() {
        // Defensive: Check canvas, context
        if (!canvas || !ctx) {
            alert('Canvas not found!');
            return;
        }

        this.width = canvas.width;
        this.height = canvas.height;
        this.state = 'menu'; // menu, playing, gameover
        this.arena = null;
        this.players = [];
        this.balls = [];
        this.ui = null;
        this.playerIndex = 0; // Only one human player
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
            throw: false,
            catch: false
        };
        this.lastTime = 0;
        this.gameOverReason = '';
        this.winner = '';
        this.sfxQueue = []; // For sound events
        this.init();
    }

    init() {
        // Arena Setup
        if (typeof window.Arena !== 'undefined') {
            this.arena = new window.Arena(this.width, this.height);
        }
        // Players: 1 human, 2 AI
        if (typeof window.Player !== 'undefined') {
            this.players = [
                new window.Player(this.width / 2, this.height - 80, 'You', 'blue', false),
                new window.Player(this.width / 3, 80, 'AI 1', 'red', true),
                new window.Player(this.width * 2 / 3, 80, 'AI 2', 'green', true)
            ];
            this.playerIndex = 0;
        }
        // Balls: Place some on field at start
        if (typeof window.Ball !== 'undefined') {
            this.balls = [
                new window.Ball(this.width / 2, this.height / 2),
                new window.Ball(this.width / 2 - 60, this.height / 2 + 30)
            ];
        }
        // UI
        if (typeof window.UI !== 'undefined') {
            this.ui = new window.UI(this.width, this.height);
        }
        // Reset state
        this.state = 'menu';
        this.gameOverReason = '';
        this.winner = '';
        // Input
        this.resetInput();
        this.addEventListeners();
        // Immediate draw
        this.render(0);
    }

    resetInput() {
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
            throw: false,
            catch: false
        };
    }

    addEventListeners() {
        // Prevent double-binding
        window.removeEventListener('keydown', this._keydownHandler);
        window.removeEventListener('keyup', this._keyupHandler);

        this._keydownHandler = (e) => this.handleKeyDown(e);
        this._keyupHandler = (e) => this.handleKeyUp(e);

        window.addEventListener('keydown', this._keydownHandler);
        window.addEventListener('keyup', this._keyupHandler);

        // Mouse for menu
        canvas.addEventListener('mousedown', (e) => {
            if (this.state === 'menu') {
                this.startGame();
            } else if (this.state === 'gameover') {
                this.init();
            }
        });
    }

    handleKeyDown(e) {
        if (this.state !== 'playing') return;
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.input.left = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.input.right = true;
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.input.up = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.input.down = true;
                break;
            case 'Space':
                this.input.throw = true;
                break;
            case 'KeyC':
                this.input.catch = true;
                break;
        }
    }
    handleKeyUp(e) {
        if (this.state !== 'playing') return;
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.input.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.input.right = false;
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.input.up = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.input.down = false;
                break;
            case 'Space':
                this.input.throw = false;
                break;
            case 'KeyC':
                this.input.catch = false;
                break;
        }
    }

    startGame() {
        // Reset all
        this.init();
        this.state = 'playing';
        // Immediate render
        this.render(0);
        window.requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    gameLoop(timestamp) {
        if (this.lastTime === 0) this.lastTime = timestamp;
        const delta = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.update(delta);
        this.render(delta);

        if (this.state === 'playing') {
            window.requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }

    update(dt) {
        if (this.state !== 'playing') return;
        // Players
        for (let i = 0; i < this.players.length; ++i) {
            const p = this.players[i];
            if (p.eliminated) continue;
            if (!p.isAI) {
                p.handleInput(this.input, this.arena);
            } else {
                p.handleAI(this.balls, this.players, this.arena);
            }
            p.update(dt, this.arena);
        }
        // Balls
        for (let ball of this.balls) {
            ball.update(dt, this.arena);
        }
        // Handle throws/catches for player
        this.handlePlayerActions();
        // AI throws/catches
        this.handleAIActions();
        // Ball collision with players
        this.handleBallHits();
        // Check win/lose
        this.checkGameOver();
    }

    handlePlayerActions() {
        // Player index 0 is human
        const player = this.players[0];
        if (player.eliminated) return;
        // Throw
        if (this.input.throw && player.holdingBall && !player.justThrew) {
            const direction = { x: 0, y: -1 }; // Up
            const throwBall = player.throwBall(direction, this.balls);
            if (throwBall) {
                this.sfxQueue.push('throw');
                player.justThrew = true;
            }
        } else if (!this.input.throw) {
            player.justThrew = false;
        }
        // Catch
        if (this.input.catch && !player.catching) {
            player.catching = true;
            player.catchTimer = 0.18;
            this.sfxQueue.push('catch');
        }
    }

    handleAIActions() {
        for (let i = 1; i < this.players.length; ++i) {
            const ai = this.players[i];
            if (ai.eliminated) continue;
            // AI throws
            if (ai.holdingBall && !ai.justThrew && Math.random() < 0.012) {
                // Aim at nearest opponent
                let target = this.players[0];
                if (target.eliminated) {
                    for (let j = 1; j < this.players.length; ++j) {
                        if (j !== i && !this.players[j].eliminated) {
                            target = this.players[j];
                            break;
                        }
                    }
                }
                if (!target.eliminated) {
                    const dx = target.x - ai.x;
                    const dy = target.y - ai.y;
                    const mag = Math.sqrt(dx * dx + dy * dy);
                    const dir = { x: dx / mag, y: dy / mag };
                    const throwBall = ai.throwBall(dir, this.balls);
                    if (throwBall) {
                        this.sfxQueue.push('throw');
                        ai.justThrew = true;
                    }
                }
            } else if (!ai.holdingBall) {
                ai.justThrew = false;
            }
            // AI catch (randomly try)
            if (!ai.catching && Math.random() < 0.006) {
                ai.catching = true;
                ai.catchTimer = 0.18;
                this.sfxQueue.push('catch');
            }
        }
    }

    handleBallHits() {
        // Balls may hit players
        for (let ball of this.balls) {
            if (!ball.inMotion) continue;
            for (let i = 0; i < this.players.length; ++i) {
                const p = this.players[i];
                if (p.eliminated) continue;
                // Don't let thrower hit self
                if (ball.thrower === p) continue;
                if (p.checkBallCatch(ball)) {
                    ball.inMotion = false;
                    ball.heldBy = p;
                    p.holdingBall = true;
                    this.sfxQueue.push('catch-success');
                } else if (p.checkBallHit(ball)) {
                    // Only if not catching
                    p.eliminated = true;
                    ball.inMotion = false;
                    ball.heldBy = null;
                    this.sfxQueue.push('hit');
                }
            }
        }
    }

    checkGameOver() {
        // Game ends if only one player remains
        const alive = this.players.filter(p => !p.eliminated);
        if (alive.length <= 1 && this.state === 'playing') {
            this.state = 'gameover';
            this.winner = alive.length === 1 ? alive[0].name : 'None';
            this.gameOverReason = this.winner === 'You' ? 'You win!' : `${this.winner} wins!`;
        } else if (this.players[0].eliminated && this.state === 'playing') {
            this.state = 'gameover';
            this.winner = alive.length === 1 ? alive[0].name : 'None';
            this.gameOverReason = 'You lose!';
        }
    }

    render(dt) {
        // Clear
        ctx.clearRect(0, 0, this.width, this.height);

        if (this.state === 'menu') {
            this.ui.drawMenu(ctx);
        } else if (this.state === 'playing') {
            this.arena.draw(ctx);
            for (let ball of this.balls) {
                ball.draw(ctx);
            }
            for (let p of this.players) {
                p.draw(ctx);
            }
            this.ui.drawStatus(ctx, this.players, this.balls, this.state);
        } else if (this.state === 'gameover') {
            this.arena.draw(ctx);
            for (let ball of this.balls) {
                ball.draw(ctx);
            }
            for (let p of this.players) {
                p.draw(ctx);
            }
            this.ui.drawGameOver(ctx, this.winner, this.gameOverReason);
        }
        this.playQueuedSounds();
    }

    playQueuedSounds() {
        // Use oscillator for simple sfx
        while (this.sfxQueue.length > 0) {
            const sfx = this.sfxQueue.shift();
            this.playSound(sfx);
        }
    }

    playSound(type) {
        if (typeof window.AudioContext === 'undefined') return;
        const ctx = new window.AudioContext();
        let duration = 0.09, freq = 440, vol = 0.13, typeOsc = 'square';
        switch (type) {
            case 'throw':
                freq = 460; duration = 0.08; typeOsc = 'triangle'; break;
            case 'catch':
                freq = 750; duration = 0.07; typeOsc = 'square'; break;
            case 'catch-success':
                freq = 1100; duration = 0.13; typeOsc = 'triangle'; break;
            case 'hit':
                freq = 90; duration = 0.18; typeOsc = 'sawtooth'; vol = 0.23; break;
        }
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = typeOsc;
        o.frequency.value = freq;
        g.gain.value = vol;
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + duration);
        o.onended = () => ctx.close();
    }
}

window.DodgeBallGame = DodgeBallGame;

// Initialization
function initGame() {
    if (!dependenciesReady()) {
        setTimeout(initGame, 30);
        return;
    }
    window.dodgeBallGame = new window.DodgeBallGame();
}
// DOMContentLoaded triggers initialization
window.addEventListener('DOMContentLoaded', initGame);