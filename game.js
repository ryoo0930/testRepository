const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 브라우저 창 크기에 맞게 캔버스 크기 조정
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 게임 상태 초기화
let player, playerBullets, enemies, enemyBullets, keys;
let isDragging = false; // 드래그 상태를 나타내는 변수
let offsetX, offsetY; // 플레이어를 터치할 때의 오프셋 값

function initGame() {
    player = {
        x: canvas.width / 2 - 15,
        y: canvas.height - 100,
        width: 30,
        height: 30,
        speed: 5,
        color: 'blue',
        canShoot: true,  // 발사 가능 여부
        shootCooldown: 100 // 탄막 재발사 대기 시간 (ms)
    };

    playerBullets = [];
    enemies = [];
    enemyBullets = [];
    keys = {}; // 키보드 입력 상태 저장

    // 플레이어의 자동 발사
    setInterval(shootBullet, player.shootCooldown);
}

// 터치 이벤트 핸들러 추가 (모바일용)
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

// 키보드 이벤트 핸들러 추가 (PC용)
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

function handleKeyDown(e) {
    keys[e.key] = true; // 키보드 키 상태 저장
}

function handleKeyUp(e) {
    keys[e.key] = false; // 키보드 키 상태 해제
}

function handleTouchStart(e) {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // 플레이어를 터치했는지 확인
    if (
        touchX >= player.x &&
        touchX <= player.x + player.width &&
        touchY >= player.y &&
        touchY <= player.y + player.height
    ) {
        isDragging = true;
        // 터치한 지점과 플레이어의 위치 차이를 저장 (오프셋)
        offsetX = touchX - player.x;
        offsetY = touchY - player.y;
    }
}

function handleTouchMove(e) {
    if (isDragging) {
        const touch = e.touches[0];
        // 플레이어 위치를 드래그하는 터치 위치로 설정
        player.x = touch.clientX - offsetX;
        player.y = touch.clientY - offsetY;

        // 플레이어가 화면 밖으로 나가지 않도록 처리
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
    }
}

function handleTouchEnd() {
    isDragging = false;
}

// 플레이어 움직임 처리 (PC용 키보드 입력)
function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

// 플레이어 탄막 자동 발사
function shootBullet() {
    const bullet = {
        x: player.x + player.width / 2 - 5,
        y: player.y,
        width: 10,
        height: 20,
        speed: 7,
        color: 'white'
    };
    playerBullets.push(bullet);
}

function updatePlayerBullets() {
    for (let i = 0; i < playerBullets.length; i++) {
        const bullet = playerBullets[i];
        bullet.y -= bullet.speed;

        // 화면을 넘어가면 탄막 제거
        if (bullet.y < 0) {
            playerBullets.splice(i, 1);
            i--;
        }
    }
}

function drawPlayerBullets() {
    playerBullets.forEach((bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
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

// 적의 총알 발사
function fireBullet(enemy) {
    const bullet = {
        x: enemy.x + enemy.width / 2 - 5,
        y: enemy.y + enemy.height,
        width: 10,
        height: 20,
        speed: 3,
        color: 'yellow'
    };
    enemyBullets.push(bullet);
}

function updateBullets() {
    // 적의 탄막 업데이트
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

// 충돌 감지 (적과 플레이어, 적과 플레이어 탄막, 플레이어 탄막과 적 탄막)
function checkCollisions() {
    // 적과 플레이어 탄막의 충돌 체크
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        for (let j = 0; j < playerBullets.length; j++) {
            const bullet = playerBullets[j];
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // 적이 플레이어 탄막에 맞으면 제거
                enemies.splice(i, 1);
                playerBullets.splice(j, 1);
                i--;
                j--;
                break;
            }
        }
    }

    // 플레이어 탄막과 적 탄막의 충돌 체크
    for (let i = 0; i < playerBullets.length; i++) {
        const playerBullet = playerBullets[i];
        for (let j = 0; j < enemyBullets.length; j++) {
            const enemyBullet = enemyBullets[j];
            if (
                playerBullet.x < enemyBullet.x + enemyBullet.width &&
                playerBullet.x + playerBullet.width > enemyBullet.x &&
                playerBullet.y < enemyBullet.y + enemyBullet.height &&
                playerBullet.y + playerBullet.height > enemyBullet.y
            ) {
                // 두 탄막이 부딪히면 제거
                playerBullets.splice(i, 1);
                enemyBullets.splice(j, 1);
                i--;
                j--;
                break;
            }
        }
    }

    // 플레이어와 적의 충돌 체크 (적과 직접 부딫히면 게임 오버)
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            gameOver(); // 적과 충돌하면 게임 오버
        }
    }

    // 플레이어와 적 탄막의 충돌 체크
    for (let i = 0; i < enemyBullets.length; i++) {
        const bullet = enemyBullets[i];
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            gameOver();
        }
    }
}

// 게임 오버 처리
function gameOver() {
    alert("게임 오버!");
    resetGame();
}

// 게임 초기화
function resetGame() {
    initGame();
}

// 게임 루프
function gameLoop() {
    // 배경을 검은색으로 설정
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    movePlayer(); // 키보드 또는 터치로 플레이어 이동
    drawPlayer();
    updatePlayerBullets();
    drawPlayerBullets();

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
initGame();
gameLoop();
