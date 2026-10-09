
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const jumpButton = document.getElementById("jumpButton");
const statusText = document.getElementById("status");

const W = canvas.width;
const H = canvas.height;
const groundHeight = 45;

let bird;
let pipes;
let score;
let frame;
let running = false;
let gameOver = false;
let animationId = null;

const gravity = 0.38;
const flapPower = -6.5;
const pipeWidth = 65;
const pipeGap = 165;
const pipeSpeed = 2.5;

function resetGame() {
    bird = {
        x: 95,
        y: 270,
        radius: 15,
        velocity: 0
    };

    pipes = [];
    score = 0;
    frame = 0;
    running = false;
    gameOver = false;

    statusText.textContent = "Press SPACE or click to fly!";
    startButton.textContent = "Restart Game";

    draw();
}

function startGame() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    resetGame();
    running = true;
    flap();
    loop();
}

function flap() {
    if (!running) {
        if (gameOver) {
            startGame();
        }
        return;
    }

    bird.velocity = flapPower;
}

function createPipe() {
    const margin = 65;
    const gapY = margin +
        Math.random() * (H - groundHeight - pipeGap - margin * 2);

    pipes.push({
        x: W,
        gapY: gapY,
        scored: false
    });
}

function update() {
    frame++;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (frame % 95 === 0) {
        createPipe();
    }

    for (const pipe of pipes) {
        pipe.x -= pipeSpeed;

        const insidePipe =
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipeWidth;

        const hitsTop = bird.y - bird.radius < pipe.gapY;
        const hitsBottom =
            bird.y + bird.radius > pipe.gapY + pipeGap;

        if (insidePipe && (hitsTop || hitsBottom)) {
            endGame();
            return;
        }

        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            pipe.scored = true;
            score++;
        }
    }

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    if (
        bird.y - bird.radius < 0 ||
        bird.y + bird.radius > H - groundHeight
    ) {
        endGame();
    }
}

function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#70d7f5");
    sky.addColorStop(1, "#d5f7ff");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.85)";

    for (const cloud of [
        { x: 65, y: 90 },
        { x: 285, y: 165 },
        { x: 180, y: 310 }
    ]) {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 19, 0, Math.PI * 2);
        ctx.arc(cloud.x + 22, cloud.y - 9, 24, 0, Math.PI * 2);
        ctx.arc(cloud.x + 44, cloud.y, 18, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPipes() {
    for (const pipe of pipes) {
        const bottomY = pipe.gapY + pipeGap;
        const groundY = H - groundHeight;

        ctx.fillStyle = "#22ad50";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
        ctx.fillRect(pipe.x, bottomY, pipeWidth, groundY - bottomY);

        ctx.fillStyle = "#13843a";
        ctx.fillRect(pipe.x + 8, 0, 9, pipe.gapY);
        ctx.fillRect(pipe.x + 8, bottomY, 9, groundY - bottomY);

        ctx.fillStyle = "#28c75b";
        ctx.fillRect(pipe.x - 5, pipe.gapY - 22, pipeWidth + 10, 22);
        ctx.fillRect(pipe.x - 5, bottomY, pipeWidth + 10, 22);

        ctx.strokeStyle = "#126b34";
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.gapY);
        ctx.strokeRect(pipe.x, bottomY, pipeWidth, groundY - bottomY);
    }
}

function drawGround() {
    ctx.fillStyle = "#75d34c";
    ctx.fillRect(0, H - groundHeight, W, 12);

    ctx.fillStyle = "#d7a85c";
    ctx.fillRect(0, H - groundHeight + 12, W, groundHeight - 12);

    ctx.fillStyle = "#4cae35";
    for (let x = 0; x < W; x += 24) {
        ctx.fillRect(x, H - groundHeight, 12, 5);
    }
}

function drawBird() {
    ctx.save();

    ctx.translate(bird.x, bird.y);
    ctx.rotate(Math.min(Math.PI / 4, bird.velocity * 0.06));

    // Wing
    ctx.fillStyle = "#f4a62a";
    ctx.beginPath();
    ctx.ellipse(-5, 5, 10, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = "#ffdf45";
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ce8c1d";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(7, -5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#17233e";
    ctx.beginPath();
    ctx.arc(9, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#ff8a32";
    ctx.beginPath();
    ctx.moveTo(12, 1);
    ctx.lineTo(25, 5);
    ctx.lineTo(12, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawScore() {
    ctx.textAlign = "center";
    ctx.font = "bold 42px Arial";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#276b80";
    ctx.strokeText(score, W / 2, 58);
    ctx.fillStyle = "white";
    ctx.fillText(score, W / 2, 58);
}

function drawOverlay(title, subtitle) {
    ctx.fillStyle = "rgba(20, 35, 55, 0.68)";
    ctx.fillRect(25, 220, W - 50, 120);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe66d";
    ctx.font = "bold 29px Arial";
    ctx.fillText(title, W / 2, 267);

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(subtitle, W / 2, 302);
}

function draw() {
    drawBackground();
    drawPipes();
    drawGround();

    if (bird) {
        drawBird();
        drawScore();
    }

    if (!running && !gameOver) {
        drawOverlay("FLAPPY SKY", "Press Start Game to begin");
    }

    if (gameOver) {
        drawOverlay("GAME OVER", "Score: " + score + " - Press Restart");
    }
}

function endGame() {
    running = false;
    gameOver = true;
    statusText.textContent = "Game over! Your score: " + score;
    startButton.textContent = "Play Again";
    draw();
}

function loop() {
    if (!running) return;

    update();
    draw();

    if (running) {
        animationId = requestAnimationFrame(loop);
    }
}

startButton.addEventListener("click", startGame);

jumpButton.addEventListener("click", flap);

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && !event.repeat) {
        event.preventDefault();

        if (!running && !gameOver) {
            startGame();
        } else {
            flap();
        }
    }
});

canvas.addEventListener("pointerdown", function() {
    if (!running && !gameOver) {
        startGame();
    } else {
        flap();
    }
});

resetGame();
