// ui.js

class UI {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    drawMenu(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.93;
        ctx.fillStyle = 'rgba(34,72,0,0.98)';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1;
        ctx.font = "bold 54px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("DODGEBALL", this.width / 2, this.height / 2 - 80);
        ctx.font = "22px sans-serif";
        ctx.fillStyle = "#e2ffb7";
        ctx.fillText("Move: Arrow Keys or WASD", this.width / 2, this.height / 2 - 25);
        ctx.fillText("Throw: SPACE  |  Catch: C", this.width / 2, this.height / 2 + 10);
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText("Click to Start", this.width / 2, this.height / 2 + 80);
        ctx.restore();
    }

    drawStatus(ctx, players, balls, state) {
        // Draw score/status bar at top
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = "rgba(0,0,0,0.42)";
        ctx.fillRect(0, 0, this.width, 46);
        ctx.globalAlpha = 1;
        ctx.font = "bold 22px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText("You: " + (players[0].eliminated ? "OUT" : "IN"), 22, 32);

        ctx.textAlign = "center";
        ctx.fillText("Balls: " + balls.length, this.width / 2, 32);

        ctx.textAlign = "right";
        ctx.fillStyle = "#f8c";
        ctx.fillText(players[1].name + ": " + (players[1].eliminated ? "OUT" : "IN"), this.width - 28, 30);
        ctx.fillStyle = "#7ef";
        ctx.fillText(players[2].name + ": " + (players[2].eliminated ? "OUT" : "IN"), this.width - 28, 53);

        ctx.restore();
    }

    drawGameOver(ctx, winner, message) {
        ctx.save();
        ctx.globalAlpha = 0.83;
        ctx.fillStyle = "rgba(0,0,0,0.88)";
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1;
        ctx.font = "bold 50px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", this.width / 2, this.height / 2 - 90);
        ctx.font = "32px sans-serif";
        ctx.fillStyle = "#ffe";
        ctx.fillText(message, this.width / 2, this.height / 2 - 30);
        ctx.font = "24px sans-serif";
        ctx.fillStyle = "#ffc";
        ctx.fillText("Winner: " + winner, this.width / 2, this.height / 2 + 30);
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText("Click to play again!", this.width / 2, this.height / 2 + 110);
        ctx.restore();
    }
}

window.UI = UI;