const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정
canvas.width = 480;
canvas.height = 640;

const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    speed: 5,
    color: 'blue',
    moveLeft: false,
    moveRight: false
};

const bullets = [];
const enemies = [];
const enemyBullets = [];
const keys = {};

// 플레이어 이동 처리
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// 적 생성
function createEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 30,
        height: 30,
        speed: 2,
        color: 'red'
    };
    enemies.push(enemy);
}

// 탄막 발사 (적의 총알)
function fireBullet(enemy) {
    const bullet = {
        x: enemy.x + enemy.width / 2 - 5,
        y: enemy.y + enemy.height,
        width: 5,
        height: 10,
        speed: 3,
        color: 'yellow'
    };
    enemyBullets.push(bullet);
}

function updateBullets() {
    for (let i = 0; i < enemyBullets.length; i++) {
        const bullet = enemyBullets[i];
        bullet.y += bullet.speed;
        if (bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
            i--;
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        enemy.y += enemy.speed;
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        if (Math.random() < 0.02) {
            fireBullet(enemy);
        }

        if (enemy.y > canvas.height) {
            // 화면을 넘어가면 제거
            const index = enemies.indexOf(enemy);
            enemies.splice(index, 1);
        }
    });
}

function drawBullets() {
    enemyBullets.forEach((bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// 충돌 감지
function checkCollisions() {
    for (let i = 0; i < enemyBullets.length; i++) {
        const bullet = enemyBullets[i];
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            alert("게임 오버!");
            document.location.reload();
        }
    }
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    drawPlayer();

    if (Math.random() < 0.02) {
        createEnemy();
    }
    drawEnemies();
    drawBullets();

    updateBullets();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();
