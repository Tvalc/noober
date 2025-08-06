// arena.js

class Arena {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.bounds = {
            left: 50,
            right: width - 50,
            top: 70,
            bottom: height - 60
        };
        this.centerLine = (this.bounds.top + this.bounds.bottom) / 2;
    }

    draw(ctx) {
        // Field
        ctx.save();
        ctx.fillStyle = '#eefad8';
        ctx.fillRect(this.bounds.left, this.bounds.top, this.bounds.right - this.bounds.left, this.bounds.bottom - this.bounds.top);
        // Center line
        ctx.beginPath();
        ctx.moveTo(this.bounds.left, this.centerLine);
        ctx.lineTo(this.bounds.right, this.centerLine);
        ctx.strokeStyle = '#555';
        ctx.setLineDash([10, 6]);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
        // Border
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#388e3c';
        ctx.strokeRect(this.bounds.left, this.bounds.top, this.bounds.right - this.bounds.left, this.bounds.bottom - this.bounds.top);
        // Zones
        ctx.globalAlpha = 0.10;
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(this.bounds.left, this.bounds.top, this.bounds.right - this.bounds.left, (this.centerLine - this.bounds.top));
        ctx.fillStyle = '#f44336';
        ctx.fillRect(this.bounds.left, this.centerLine, this.bounds.right - this.bounds.left, (this.bounds.bottom - this.centerLine));
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

window.Arena = Arena;