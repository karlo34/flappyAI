import { AIBird } from './ai.js';

// --- Local Storage for high scores ---
if (!localStorage.getItem('flappyAIRecord')) localStorage.setItem('flappyAIRecord', 0);
if (!localStorage.getItem('flappyAIRecordAI')) localStorage.setItem('flappyAIRecordAI', 0);

// --- Canvas setup ---
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
const speed = 1;

let y = 50;
let velocity = 0;
const gravity = 0.1;
const lift = -1.5;
let playing = false;
let aiPlaying = false;

let score = 0;
let highscore = parseInt(localStorage.getItem('flappyAIRecord'), 10) || 0;
let AIhighscore = parseInt(localStorage.getItem('flappyAIRecordAI'), 10) || 0;

const highscoreElement = document.getElementById('highscore');
highscoreElement.textContent = `Highscore: ${highscore}`;
const AIhighscoreElement = document.getElementById('AIhighscore');
AIhighscoreElement.textContent = `AI highscore: ${AIhighscore}`;

document.getElementsByClassName('score')[0].classList.add('hide');
const stopBtn = document.getElementsByClassName('stop')[0];

// --- Responsive sizes ---
let birdWidth, birdHeight, birdX;
let gap;
const maxPoleWidth = 50;
function updateSizes() {
    // Bird
    birdWidth = canvas.width * 0.075;
    birdHeight = canvas.height * 0.075;
    birdX = canvas.width * 0.05;

    // Pole
    pole.width = Math.min(canvas.width * 0.28, maxPoleWidth);
    gap = canvas.height * 0.2;

    // Update AI bird size if it exists
    if (ai) {
        ai.setSize(birdWidth, birdHeight);
    }
}


// --- Pole setup ---
function randomGapY() {
    const margin = canvas.height * 0.05;
    const min = margin;
    const max = canvas.height - gap - margin;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const pole = {
    img: poleImg,
    x: canvas.width,
    width: 10,
    gapY: randomGapY(),
    passed: false
};

// --- AI bird ---
let ai = null;

// --- Image loading ---
let imagesLoaded = 0;
const totalImages = 4;
function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) initAI();
}
playerImg.onload = () => { imageLoaded(); };
aiImg.onload = () => { imageLoaded(); };
bgImg.onload = () => { imageLoaded(); };
poleImg.onload = () => { imageLoaded(); };

// --- Initialize AI ---
function initAI() {
    ai = new AIBird(aiImg, resetGame, canvas.height);
    ai.setSize(birdWidth, birdHeight);
}

// --- Main game loop ---
function draw() {
    if (!playing) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Player physics ---
    if (!aiPlaying) {
        velocity += gravity;
        y += velocity;

        if (y > canvas.height - birdHeight) {
            y = canvas.height - birdHeight;
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
        ctx.drawImage(playerImg, birdX, y, birdWidth, birdHeight);
    }

    // --- Collision detection ---
    const birdHitX = birdX + birdWidth * 0.8; // shrink hitbox slightly to match image
    const birdHitW = birdWidth * 0.6;
    const withinX = birdHitX > pole.x && birdX < pole.x + pole.width;
    const hitTop = y < pole.gapY;
    const hitBottom = y + birdHeight > pole.gapY + gap;

    if (!aiPlaying && withinX && (hitTop || hitBottom)) {
        resetGame();
        return;
    }

    // --- Score update ---
    if (!pole.passed) {
        const birdRefX = aiPlaying ? ai.x : birdX;
        const birdRefW = aiPlaying ? ai.width : birdWidth;
        if (pole.x + pole.width < birdRefX) {
            pole.passed = true;
            score += 1;
            const scoreElement = document.getElementsByClassName('score')[0];
            scoreElement.innerText = `Score: ${score}`;

            if (!aiPlaying) {
                if (score > highscore) {
                    highscore = score;
                    highscoreElement.textContent = `Highscore: ${highscore}`;
                    localStorage.setItem('flappyAIRecord', highscore);
                }
            } else {
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

// --- Start AI game ---
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

        ai.x = birdX;
        ai.y = 50;
        ai.velocity = 0;

        playing = true;
        requestAnimationFrame(draw);
    }
});

// --- Player input ---
function flap() { if (!aiPlaying) velocity = lift; }
document.addEventListener('keydown', e => { if (e.key === ' ' || e.code === 'Space') flap(); });
document.addEventListener('touchstart', flap);
document.addEventListener('mousedown', flap);

// --- Stop button ---
stopBtn.addEventListener('click', () => {
    if (playing) {
        resetGame();
        stopBtn.classList.add('hide');
    }
});
updateSizes();
// --- Reset ---
function resetGame() {
    playing = false;
    score = 0;
    y = 50;
    velocity = 0;
    pole.x = canvas.width;
    pole.gapY = randomGapY();
    pole.passed = false;
    if (ai) {
        ai.x = birdX;
        ai.y = 50;
        ai.velocity = 0;
    }
    document.getElementsByClassName('menu')[0].classList.remove('hide');
    document.getElementsByClassName('score')[0].classList.add('hide');
    stopBtn.classList.add('hide');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerImg, birdX, y, birdWidth, birdHeight);
}

// --- Resize handling ---
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    updateSizes();
});