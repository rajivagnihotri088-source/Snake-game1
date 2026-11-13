
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071b0d);

const camera = new THREE.PerspectiveCamera(
    45, 1, 0.1, 100
);

camera.position.set(0, 13, 15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("game-wrapper").appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 10, 5);
scene.add(light);

// Game board
const board = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.4, 10),
    new THREE.MeshStandardMaterial({
        color: 0x174b27,
        roughness: 0.7
    })
);

board.position.y = -0.3;
scene.add(board);

// Board lines
const grid = new THREE.GridHelper(10, 20, 0x00ff55, 0x267b3b);
grid.position.y = -0.08;
scene.add(grid);

// Snake
let snake = [];
let direction = { x: 1, z: 0 };
let nextDirection = { x: 1, z: 0 };
let food;
let score = 0;
let gameOver = false;
let timer = 0;

const snakeGeometry = new THREE.SphereGeometry(0.32, 24, 24);

const snakeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff22,
    roughness: 0.2,
    metalness: 0.1
});

function createSnake() {
    snake.forEach(part => scene.remove(part));
    snake = [];

    for (let i = 0; i < 4; i++) {
        const part = new THREE.Mesh(
            snakeGeometry,
            snakeMaterial
        );

        part.position.set(-i * 0.5, 0.25, 0);
        scene.add(part);
        snake.push(part);
    }
}

function createFood() {
    if (food) scene.remove(food);

    food = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 24, 24),
        new THREE.MeshStandardMaterial({
            color: 0xff2020,
            emissive: 0x660000,
            roughness: 0.2
        })
    );

    food.position.set(
        Math.floor(Math.random() * 9 - 4) + 0.5,
        0.3,
        Math.floor(Math.random() * 9 - 4) + 0.5
    );

    scene.add(food);
}

function changeDirection(dir) {
    if (dir === "UP" && direction.z !== 1)
        nextDirection = { x: 0, z: -1 };

    if (dir === "DOWN" && direction.z !== -1)
        nextDirection = { x: 0, z: 1 };

    if (dir === "LEFT" && direction.x !== 1)
        nextDirection = { x: -1, z: 0 };

    if (dir === "RIGHT" && direction.x !== -1)
        nextDirection = { x: 1, z: 0 };
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") changeDirection("UP");
    if (e.key === "ArrowDown") changeDirection("DOWN");
    if (e.key === "ArrowLeft") changeDirection("LEFT");
    if (e.key === "ArrowRight") changeDirection("RIGHT");
});

function moveSnake() {
    if (gameOver) return;

    direction = { ...nextDirection };

    const head = snake[0].position;
    const newX = head.x + direction.x * 0.5;
    const newZ = head.z + direction.z * 0.5;

    if (Math.abs(newX) > 4.5 || Math.abs(newZ) > 4.5) {
        endGame();
        return;
    }

    const eating =
        Math.abs(newX - food.position.x) < 0.3 &&
        Math.abs(newZ - food.position.z) < 0.3;

    if (!eating) {
        const tail = snake.pop();
        scene.remove(tail);
    } else {
        score++;
        document.getElementById("score").textContent = score;
        createFood();
    }

    if (snake.some(part =>
        Math.abs(part.position.x - newX) < 0.2 &&
        Math.abs(part.position.z - newZ) < 0.2
    )) {
        endGame();
        return;
    }

    const newHead = new THREE.Mesh(
        snakeGeometry,
        snakeMaterial
    );

    newHead.position.set(newX, 0.25, newZ);
    scene.add(newHead);
    snake.unshift(newHead);
}

function endGame() {
    gameOver = true;
    setTimeout(() => {
        alert("GAME OVER! Your Score: " + score);
    }, 100);
}

function restartGame() {
    score = 0;
    gameOver = false;
    document.getElementById("score").textContent = 0;

    direction = { x: 1, z: 0 };
    nextDirection = { x: 1, z: 0 };

    createSnake();
    createFood();
    timer = 0;
}

function resize() {
    const wrapper = document.getElementById("game-wrapper");
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);

    timer++;

    if (timer % 12 === 0) {
        moveSnake();
    }

    if (food) {
        food.rotation.y += 0.04;
        food.position.y = 0.3 + Math.sin(Date.now() * 0.004) * 0.08;
    }

    renderer.render(scene, camera);
}

createSnake();
createFood();
resize();

window.addEventListener("resize", resize);

animate();
