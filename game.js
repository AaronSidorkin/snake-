const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const grid = 20;
let count = 0;
let score = 0;
let gameSpeed = 6; // Lower frame limit = faster game updates

let snake = {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
};

let apple = {
    x: 320,
    y: 320
};

let particles = [];

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.color = color;
        this.alpha = 1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.03;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x + grid/2, y + grid/2, color));
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetGame() {
    snake.x = 160;
    snake.y = 160;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;
    score = 0;
    gameSpeed = 6;
    scoreEl.innerText = "000";
    apple.x = getRandomInt(0, canvas.width / grid) * grid;
    apple.y = getRandomInt(0, canvas.height / grid) * grid;
}

function loop() {
    requestAnimationFrame(loop);

    // Dynamic frame handling to manage core physics timing
    if (++count < gameSpeed) {
        // Still clear particles every frame for visual fluidity at 60fps
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawGrid();
        drawEntities();
        return;
    }
    count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Advanced movement matrices
    snake.x += snake.dx;
    snake.y += snake.dy;

    // Cross-border wrapping mechanics
    if (snake.x < 0) snake.x = canvas.width - grid;
    else if (snake.x >= canvas.width) snake.x = 0;
    
    if (snake.y < 0) snake.y = canvas.height - grid;
    else if (snake.y >= canvas.height) snake.y = 0;

    snake.cells.unshift({x: snake.x, y: snake.y});

    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    drawGrid();
    drawEntities();
}

function drawGrid() {
    ctx.strokeStyle = "rgba(255, 0, 85, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += grid) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += grid) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
    }
}

function drawEntities() {
    // Render and process background particle explosions
    particles.forEach((p, idx) => {
        p.update();
        p.draw();
        if (p.alpha <= 0) particles.splice(idx, 1);
    });

    // Render Data Core Target Node
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff0055";
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(apple.x + 2, apple.y + 2, grid - 4, grid - 4);

    // Process player array iterations
    snake.cells.forEach(function(cell, index) {
        if (index === 0) {
            ctx.shadowColor = "#00ffcc";
            ctx.fillStyle = "#00ffcc"; // Neon Head Node
        } else {
            ctx.shadowColor = "#00aa99";
            ctx.fillStyle = `rgba(0, 255, 204, ${1 - index / snake.maxCells})`; // Fading Cyber-Tail
        }
        
        ctx.shadowBlur = 10;
        ctx.fillRect(cell.x + 1, cell.y + 1, grid - 2, grid - 2);

        // Core validation engine: evaluate hit state transformations
        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score += 10;
            scoreEl.innerText = score.toString().padStart(3, '0');
            spawnParticles(apple.x, apple.y, "#00ffcc");
            
            // Adjust frame rate thresholds up to high-speed caps
            if (score % 30 === 0 && gameSpeed > 2) gameSpeed--; 

            apple.x = getRandomInt(0, canvas.width / grid) * grid;
            apple.y = getRandomInt(0, canvas.height / grid) * grid;
        }

        // Self-collision execution array matrix
        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                spawnParticles(cell.x, cell.y, "#ff0055");
                resetGame();
            }
        }
    });
    ctx.shadowBlur = 0; // Prevent visual artifacts bleeding across execution stacks
}

// User-bound keyboard configuration array maps
document.addEventListener("keydown", function(e) {
    if ((e.key === "ArrowLeft" || e.key === "a") && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    } else if ((e.key === "ArrowUp" || e.key === "w") && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
    } else if ((e.key === "ArrowRight" || e.key === "d") && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    } else if ((e.key === "ArrowDown" || e.key === "s") && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
    }
});

resetGame();
requestAnimationFrame(loop);
