import { AIBird } from './ai.js';

if (!localStorage.getItem('flappyAIRecord')) {
    localStorage.setItem('flappyAIRecord', 0);
}

if (!localStorage.getItem('flappyAIRecordAI')) {
    localStorage.setItem('flappyAIRecordAI', 0);
}

const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

// --- Images ---
const playerImg = new Image();
playerImg.src = './sprites/flappy.png';

const aiImg = new Image();
aiImg.src = './sprites/flappyAI.png';

const bgImg = new Image();
bgImg.src = './sprites/background.jpg';

const poleImg = new Image();
poleImg.src = './sprites/pole.png';

// --- Game variables ---
let x = 0;
const speed = 0.5;

let y = 50;
let velocity = 0;
const gravity = 0.1;
const lift = -2;
let playing = false;
let aiPlaying = false;

const gap = 40;
let score = 0;
let highscore = 0;
let AIhighscore = 0;

document.getElementsByClassName('score')[0].classList.add('hide');
const stopBtn = document.getElementsByClassName('stop')[0];

const highscoreElement = document.getElementById('highscore');
highscore = parseInt(localStorage.getItem('flappyAIRecord'), 10) || 0;
highscoreElement.textContent = `Highscore: ${highscore}`;

const AIhighscoreElement = document.getElementById('AIhighscore');
AIhighscore = parseInt(localStorage.getItem('flappyAIRecordAI'), 10) || 0;
AIhighscoreElement.textContent = `AI highscore: ${AIhighscore}`;

// Single pole
const pole = {
    img: poleImg,
    x: canvas.width,
    width: 40,
    gapY: randomGapY(),
    passed: false
};

// AI bird
let ai = null;

function randomGapY() {
    const margin = 30;
    const min = margin;
    const max = canvas.height - gap - margin;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ensure all images are loaded
let imagesLoaded = 0;
const totalImages = 4;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        initAI();
    }
}

playerImg.onload = () => {
    imageLoaded();
    ctx.drawImage(playerImg, 20, y, 20, 15);
};
aiImg.onload = () => {
    imageLoaded();
};
bgImg.onload = () => {
    imageLoaded();
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
};
poleImg.onload = imageLoaded;

// Initialize AI
function initAI() {
    ai = new AIBird(aiImg, canvas.heigh);
}

// === Main game loop ===
function draw() {
    if (!playing) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Player physics ---
    if (!aiPlaying) {
        velocity += gravity;
        y += velocity;

        if (y > canvas.height - 15) {
            y = canvas.height - 15;
            velocity = 0;
            resetGame();
            return;
        }
        if (y < 0) {
            y = 0;
            velocity = 0;
        }
    }

    // --- Background ---
    ctx.drawImage(bgImg, x, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, x + canvas.width, 0, canvas.width, canvas.height);
    x -= speed;
    if (x <= -canvas.width) x = 0;

    // --- Poles ---
    const poleSpeed = 1.5;
    pole.x -= poleSpeed;
    if (pole.x + pole.width < 0) {
        pole.x = canvas.width;
        pole.gapY = randomGapY();
        pole.passed = false;
    }

    const tall = canvas.height;

    // Top pole
    ctx.save();
    ctx.translate(pole.x, pole.gapY);
    ctx.scale(1, -1);
    ctx.drawImage(pole.img, 0, 0, pole.width, tall);
    ctx.restore();

    // Bottom pole
    ctx.drawImage(pole.img, pole.x, pole.gapY + gap, pole.width, tall);

    // --- AI update & draw ---
    if (aiPlaying && ai) {
        ai.update([pole], gap);
        ctx.drawImage(ai.img, ai.x, ai.y, ai.width, ai.height);
    }

    // --- Player draw ---
    if (!aiPlaying) {
        ctx.drawImage(playerImg, 20, y, 20, 15);
    }

    // --- Player collision ---
    if (!aiPlaying) {
        const birdX = 20, birdW = 20, birdH = 15;
        const withinX = birdX + birdW > pole.x + 10 && birdX < pole.x + pole.width;
        const hitTop = y < pole.gapY;
        const hitBottom = y + birdH > pole.gapY + gap;
        if (withinX && (hitTop || hitBottom)) {
            resetGame();
            return;
        }
    }

    // --- Score ---
    if (!pole.passed) {
        const birdX = aiPlaying ? ai.x : 20;
        const birdW = aiPlaying ? ai.width : 20;
        if (pole.x + pole.width < birdX) {
            pole.passed = true;
            score += 1;
            console.log(`Score: ${score}`);
            const scoreElement = document.getElementsByClassName('score')[0];
            scoreElement.innerText = `Score: ${score}`;
            if (!aiPlaying) {
                if (score > highscore) {
                    highscore = score;
                    highscoreElement.textContent = `Highscore: ${highscore}`;
                    localStorage.setItem('flappyAIRecord', highscore);
                }
            }
            else {
                if (score > AIhighscore) {
                    AIhighscore = score;
                    AIhighscoreElement.textContent = `AI highscore: ${AIhighscore}`;
                    localStorage.setItem('flappyAIRecordAI', AIhighscore);
                }
            }

        }
    }

    requestAnimationFrame(draw);
}

// --- Start player game ---
document.getElementById('start').addEventListener('click', () => {
    if (!playing) {
        if (imagesLoaded < totalImages) {
            alert('Please wait, images are still loading!');
            return;
        }

        aiPlaying = false;
        document.getElementsByClassName('menu')[0].classList.add('hide');
        document.getElementsByClassName('score')[0].classList.remove('hide');
        stopBtn.classList.remove('hide');

        playing = true;
        requestAnimationFrame(draw);
    }
});

// --- Start AI-only game ---
document.getElementById('AI').addEventListener('click', () => {
    if (!playing) {
        if (imagesLoaded < totalImages) {
            alert('Please wait, images are still loading!');
            return;
        }

        aiPlaying = true;
        document.getElementsByClassName('menu')[0].classList.add('hide');
        document.getElementsByClassName('score')[0].classList.remove('hide');
        stopBtn.classList.remove('hide');


        // Reset AI bird position
        ai.x = 20;
        ai.y = 50;
        ai.velocity = 0;

        playing = true;
        requestAnimationFrame(draw);
    }
});

// --- Player flap ---
document.addEventListener('keydown', (e) => {
    if (!aiPlaying && (e.key === ' ' || e.code === 'Space')) velocity = lift;
});
document.addEventListener('touchstart', (e) => {
    if (!aiPlaying) {
        velocity = lift;
    }
});
document.addEventListener('mousedown', (e) => {
    if (!aiPlaying) {
        velocity = lift;
    }
});
stopBtn.addEventListener('click', () => {
    if (playing) {
        resetGame();
        stopBtn.classList.add('hide');
    }
});

// --- Reset ---
function resetGame() {
    playing = false;
    score = 0;
    y = 50;
    velocity = 0;
    pole.x = canvas.width;
    pole.gapY = randomGapY();
    pole.passed = false;
    document.getElementsByClassName('menu')[0].classList.remove('hide');
    document.getElementsByClassName('score')[0].classList.add('hide');
    stopBtn.classList.add('hide');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerImg, 20, y, 20, 15);

}
