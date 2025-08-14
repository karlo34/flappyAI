// ai.js
export class AIBird {
    constructor(img,canvasHeight, x = 20, y = 50) {
        this.img = img;
        this.canvasHeight = canvasHeight;
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.width = 20;
        this.height = 15;
    }

    update(poles, gap) {
        this.velocity += 0.1; // gravity
        this.y += this.velocity;

        let nearest = null;
        let minDist = Infinity;
        for (const pole of poles) {
            const dist = pole.x - this.x;
            if (dist < minDist) {
                minDist = dist;
                nearest = pole;
            }
        }

        if (nearest) {
            const gapTop = nearest.gapY;
            const gapBottom = nearest.gapY + gap;
            // console.log(this.y, gapTop, gapBottom);
            if(this.y > gapBottom - 20 || this.y < this.canvasHeight - 10) {
                this.velocity = -2; // jump
            }
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }
}
