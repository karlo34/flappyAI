export class AIBird {
    constructor(img, resetCallback, canvasHeight, birdWidth, birdHeight, x = 20, y = 50) {
        this.img = img;
        this.canvasHeight = canvasHeight;
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.width = birdWidth;
        this.height = birdHeight;
        this.gravity = 0.1;
        this.lift = -1.5;
        this.resetCallback = resetCallback;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    update(poles, gap) {
        // Gravity
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Find nearest pole in front of the bird
        let nearest = null;
        let minDist = Infinity;
        for (const pole of poles) {
            const dist = pole.x - this.x; // use leading edge
            if (dist < minDist) {
                minDist = dist;
                nearest = pole;
            }
        }

        if (nearest) {
            const gapTop = nearest.gapY;
            const gapBottom = nearest.gapY + gap;
            const gapCenter = (gapTop + gapBottom) / 2;

            // Flap if below center of the gap
            if (this.y + this.height / 2 > gapCenter + 5) {
                this.velocity = this.lift;
                this.y += this.velocity;
            }
        }
        else {
            if (this.y < this.canvasHeight - this.height) {
                this.velocity = this.lift;
                this.y += this.velocity;
            }
            // console.log(this.y, this.canvasHeight - this.height);
        }

        // Keep bird inside canvas
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
        else if (this.y + this.height > this.canvasHeight - 10) {
            // console.log(this.y + this.height, this.canvasHeight);
            this.velocity = this.lift;
            this.y += this.velocity;
        }
        else if (this.y + this.height > this.canvasHeight) {
            if (this.resetCallback) this.resetCallback();
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }
}
