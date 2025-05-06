// 게임 캔버스 및 컨텍스트 설정
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 오디오 요소
const backgroundMusic = document.getElementById('background-music');
const shootSound = document.getElementById('shoot-sound');
const explosionSound = document.getElementById('explosion-sound');

// 게임 변수 초기화
let gameStarted = false;
let gameOver = false;
let gamePaused = false;  // 게임 일시정지 상태 변수 추가
let score = 0;
let lives = 3;
let animationId;
let lastTime = 0;
let deltaTime = 0;
let shootTimer = 0;
let enemySpawnTimer = 0;
let enemyDirectionChangeTimer = 0;
let formationTimer = 0;
let bossSpawned = false;
let soundEnabled = true; // 소리 활성화 상태
let enemyShootTimer = 0;
let gameTimeLimit = 60000; // 게임 시간 제한 (1분 = 60000ms)
let gameTimer = 0; // 현재 게임 시간
let timeLeft = 60; // 남은 시간 (초 단위)

// 적 웨이브 설정
let currentWave = 1;
let enemiesPerWave = 10;
let enemiesRemaining = enemiesPerWave;
let enemySpeed = 2;
let enemySpawnDelay = 1000; // 1초마다 적 생성

// 이미지 객체 생성
const playerImage = new Image();
const enemyImage = new Image();
const bulletImage = new Image();
const enemyType2Image = new Image();
const enemyType3Image = new Image();
const bossImage = new Image();
const enemyBulletImage = new Image(); // 적 총알 이미지

// 적 타입 상수
const ENEMY_TYPES = {
    NORMAL: 0,
    ZIGZAG: 1,
    CIRCULAR: 2,
    BOSS: 3
};

// 플레이어 설정
const player = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    speed: 5,
    bullets: []
};

// 적 배열
let enemies = [];
let formations = [];
let enemyBullets = []; // 적 총알 배열

// 캔버스 크기 설정
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // 플레이어 초기 위치 설정
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 20;
}

// 이미지 로드
function loadImages() {
    // 사용자가 제공한 이미지 파일 사용 (images 폴더 경로로 수정)
    playerImage.src = 'images/player.png';      // 플레이어 우주선 이미지
    enemyImage.src = 'images/enemy1.png';       // 기본 적 이미지
    enemyType2Image.src = 'images/enemy2.png';  // 지그재그 적 이미지
    enemyType3Image.src = 'images/enemy3.png';  // 원형 움직임 적 이미지
    bossImage.src = 'images/enemy5.png';        // 보스 이미지
    bulletImage.src = 'images/bullet.svg';      // 총알 이미지
    enemyBulletImage.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 20"><rect x="3" y="0" width="4" height="20" fill="red"/></svg>'); // 적 총알 이미지
    
    // 이미지 로드 에러 처리
    playerImage.onerror = function() {
        console.error("Player 이미지를 로드할 수 없습니다. 대체 이미지를 사용합니다.");
        playerImage.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><polygon points="25,0 10,40 25,30 40,40" fill="blue" stroke="white"/></svg>');
    };
    
    enemyImage.onerror = function() {
        console.error("Enemy 이미지를 로드할 수 없습니다. 대체 이미지를 사용합니다.");
        enemyImage.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="red"/><rect x="5" y="15" width="30" height="10" fill="red"/><rect x="15" y="5" width="10" height="30" fill="red"/></svg>');
    };
    
    enemyType2Image.onerror = function() {
        console.error("Enemy Type 2 이미지를 로드할 수 없습니다. 대체 이미지를 사용합니다.");
        enemyType2Image.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><polygon points="20,0 0,30 40,30" fill="orange" stroke="yellow"/></svg>');
    };
    
    enemyType3Image.onerror = function() {
        console.error("Enemy Type 3 이미지를 로드할 수 없습니다. 대체 이미지를 사용합니다.");
        enemyType3Image.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="purple" stroke="white"/><circle cx="15" cy="15" r="3" fill="white"/><circle cx="25" cy="15" r="3" fill="white"/><path d="M10,25 Q20,35 30,25" stroke="white" fill="none" stroke-width="2"/></svg>');
    };
    
    bossImage.onerror = function() {
        console.error("Boss 이미지를 로드할 수 없습니다. 대체 이미지를 사용합니다.");
        bossImage.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect x="10" y="10" width="60" height="60" fill="red" stroke="white" stroke-width="2"/><rect x="20" y="20" width="10" height="10" fill="yellow"/><rect x="50" y="20" width="10" height="10" fill="yellow"/><rect x="30" y="40" width="20" height="20" fill="black"/><rect x="0" y="30" width="10" height="20" fill="gray"/><rect x="70" y="30" width="10" height="20" fill="gray"/></svg>');
    };
    
    bulletImage.onerror = function() {
        console.error("Bullet 이미지를 로드할 수 없습니다. 대체 이미지를 사용합니다.");
        bulletImage.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 20"><rect x="3" y="0" width="4" height="20" fill="yellow"/></svg>');
    };
    
    enemyBulletImage.onerror = function() {
        console.error("Enemy Bullet 이미지를 로드할 수 없습니다. 대체 이미지를 사용합니다.");
        enemyBulletImage.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 20"><rect x="3" y="0" width="4" height="20" fill="red"/></svg>');
    };
}

// 오디오 재생 함수
function playSound(sound) {
    if (soundEnabled) {
        // 소리를 처음부터 재생하기 위해 현재 시간을 0으로 설정
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log("오디오 재생 에러:", error);
        });
    }
}

// 배경 음악 재생 함수
function playBackgroundMusic() {
    if (soundEnabled) {
        backgroundMusic.volume = 0.5; // 볼륨 설정 (0.0 ~ 1.0)
        backgroundMusic.play().catch(error => {
            console.log("배경 음악 재생 에러:", error);
        });
    }
}

// 배경 음악 정지 함수
function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

// 플레이어 그리기
function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// 총알 그리기
function drawBullets() {
    // 플레이어 총알 그리기
    player.bullets.forEach(bullet => {
        ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // 적 총알 그리기
    enemyBullets.forEach(bullet => {
        ctx.drawImage(enemyBulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// 적 그리기
function drawEnemies() {
    enemies.forEach(enemy => {
        let img;
        switch(enemy.type) {
            case ENEMY_TYPES.ZIGZAG:
                img = enemyType2Image;
                break;
            case ENEMY_TYPES.CIRCULAR:
                img = enemyType3Image;
                break;
            case ENEMY_TYPES.BOSS:
                img = bossImage;
                break;
            default:
                img = enemyImage;
        }
        ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// 총알 발사
function shootBullet() {
    const bullet = {
        x: player.x + player.width / 2 - 5,
        y: player.y - 20,
        width: 10,
        height: 20,
        speed: 10
    };
    player.bullets.push(bullet);
    
    // 총알 발사 소리 재생
    playSound(shootSound);
}

// 적 총알 발사
function enemyShoot() {
    // 화면에 있는 적 중에서 몇 명만 발사하도록 랜덤 선택
    const shootingEnemies = enemies.filter(enemy => 
        // 보스는 항상 발사, 다른 적은 10% 확률로 발사
        enemy.type === ENEMY_TYPES.BOSS || Math.random() < 0.1
    );
    
    shootingEnemies.forEach(enemy => {
        // 적의 종류에 따라 다른 총알 패턴
        switch(enemy.type) {
            case ENEMY_TYPES.BOSS:
                // 보스는 3발 발사 (좌, 중앙, 우)
                for(let i = -1; i <= 1; i++) {
                    const bullet = {
                        x: enemy.x + enemy.width / 2 - 5 + (i * 15),
                        y: enemy.y + enemy.height,
                        width: 10,
                        height: 20,
                        speed: 4 + Math.random() * 2,
                        angle: Math.PI / 2 + (i * Math.PI / 12) // 약간 퍼지게 발사
                    };
                    enemyBullets.push(bullet);
                }
                break;
            case ENEMY_TYPES.ZIGZAG:
                // 지그재그 적은 좌우로 발사
                for(let i = -1; i <= 1; i+=2) {
                    const bullet = {
                        x: enemy.x + enemy.width / 2 - 5,
                        y: enemy.y + enemy.height,
                        width: 10,
                        height: 20,
                        speed: 3 + Math.random() * 2,
                        angle: Math.PI / 2 + (i * Math.PI / 8)
                    };
                    enemyBullets.push(bullet);
                }
                break;
            default:
                // 일반 적은 한 발만 발사
                const bullet = {
                    x: enemy.x + enemy.width / 2 - 5,
                    y: enemy.y + enemy.height,
                    width: 10,
                    height: 20,
                    speed: 3 + Math.random() * 2,
                    angle: Math.PI / 2 // 아래쪽으로
                };
                enemyBullets.push(bullet);
                break;
        }
    });
}

// 적 생성
function spawnEnemy() {
    if (enemiesRemaining > 0) {
        // 웨이브에 따라 적 타입 결정
        let enemyType = ENEMY_TYPES.NORMAL;
        let enemyWidth = 40;
        let enemyHeight = 40;
        let enemyHp = 1;
        
        // 웨이브에 따라 적 타입 확률 조정
        const random = Math.random();
        
        // 웨이브 5 이상부터 더 다양한 적
        if (currentWave >= 5) {
            if (random < 0.4) {
                enemyType = ENEMY_TYPES.ZIGZAG;
            } else if (random < 0.7) {
                enemyType = ENEMY_TYPES.CIRCULAR;
            }
        } else if (currentWave >= 3) {
            if (random < 0.3) {
                enemyType = ENEMY_TYPES.ZIGZAG;
            } else if (random < 0.5) {
                enemyType = ENEMY_TYPES.CIRCULAR;
            }
        } else {
            if (random < 0.2) {
                enemyType = ENEMY_TYPES.ZIGZAG;
            }
        }
        
        // 보스 생성 로직
        if (currentWave % 3 === 0 && !bossSpawned && enemiesRemaining === 1) {
            enemyType = ENEMY_TYPES.BOSS;
            enemyWidth = 80;
            enemyHeight = 80;
            enemyHp = currentWave * 3; // 웨이브에 따라 체력 증가
        }
        
        const enemy = {
            x: Math.random() * (canvas.width - enemyWidth),
            y: -50,
            width: enemyWidth,
            height: enemyHeight,
            speed: enemyType === ENEMY_TYPES.BOSS ? enemySpeed * 0.7 : enemySpeed,
            direction: Math.random() < 0.5 ? -1 : 1,
            moveDown: false,
            type: enemyType,
            time: 0,
            amplitude: Math.random() * 50 + 30, // 진폭
            frequency: Math.random() * 0.02 + 0.01, // 주파수
            hp: enemyType === ENEMY_TYPES.BOSS ? enemyHp : 1,
            angle: 0, // 원형 이동을 위한 각도
        };
        
        if (enemyType === ENEMY_TYPES.BOSS) {
            bossSpawned = true;
        }
        
        enemies.push(enemy);
        enemiesRemaining--;
    }
}

// 복잡한 패턴의 적 그룹 생성
function spawnFormation() {
    const formationType = Math.floor(Math.random() * 3);
    let formation = [];
    
    switch(formationType) {
        case 0: // V 형태
            for (let i = 0; i < 5; i++) {
                formation.push({
                    x: canvas.width / 2 + (i - 2) * 50,
                    y: -50 - Math.abs(i - 2) * 30,
                    type: ENEMY_TYPES.NORMAL
                });
            }
            break;
            
        case 1: // 일직선 형태
            for (let i = 0; i < 5; i++) {
                formation.push({
                    x: canvas.width * 0.2 + i * (canvas.width * 0.6 / 4),
                    y: -50,
                    type: i % 2 === 0 ? ENEMY_TYPES.NORMAL : ENEMY_TYPES.ZIGZAG
                });
            }
            break;
            
        case 2: // 원형 배열
            const centerX = canvas.width / 2;
            const radius = 80;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                formation.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: -50 - Math.sin(angle) * radius,
                    type: i % 3 === 0 ? ENEMY_TYPES.CIRCULAR : ENEMY_TYPES.NORMAL
                });
            }
            break;
    }
    
    // 실제 적 생성
    formation.forEach(data => {
        if (enemiesRemaining > 0) {
            const enemy = {
                x: data.x,
                y: data.y,
                width: 40,
                height: 40,
                speed: enemySpeed,
                direction: Math.random() < 0.5 ? -1 : 1,
                moveDown: false,
                type: data.type,
                time: 0,
                amplitude: Math.random() * 50 + 30,
                frequency: Math.random() * 0.02 + 0.01,
                hp: 1,
                angle: 0,
            };
            enemies.push(enemy);
            enemiesRemaining--;
        }
    });
}

// 충돌 검사
function checkCollisions() {
    // 플레이어 총알과 적의 충돌 검사
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // 충돌 발생, 총알 제거
                player.bullets.splice(i, 1);
                
                // 적의 체력 감소
                enemy.hp--;
                
                // 체력이 0이면 적 제거
                if (enemy.hp <= 0) {
                    // 보스 처치 시 추가 점수
                    const pointsEarned = enemy.type === ENEMY_TYPES.BOSS ? 1000 : 100;
                    score += pointsEarned;
                    
                    // 보스 파괴 시 보스 스폰 플래그 리셋
                    if (enemy.type === ENEMY_TYPES.BOSS) {
                        bossSpawned = false;
                    }
                    
                    enemies.splice(j, 1);
                    document.getElementById('score').textContent = score;
                    
                    // 폭발 소리 재생
                    playSound(explosionSound);
                }
                break;
            }
        }
    }

    // 적 총알과 플레이어의 충돌 검사
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            // 충돌 발생, 총알 제거 및 생명력 감소
            enemyBullets.splice(i, 1);
            lives--;
            document.getElementById('lives').textContent = lives;
            
            // 폭발 소리 재생
            playSound(explosionSound);
            
            if (lives <= 0) {
                endGame();
            }
            break;
        }
    }

    // 플레이어와 적의 충돌 검사
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            // 충돌 발생, 적 제거 및 생명력 감소
            enemies.splice(i, 1);
            lives--;
            document.getElementById('lives').textContent = lives;
            
            if (lives <= 0) {
                endGame();
            }
        }
    }
}

// 게임 업데이트
function updateGame(timestamp) {
    // 게임이 일시정지 상태라면 업데이트 중지
    if (gamePaused) return;
    
    // 델타 타임 계산
    if (!lastTime) lastTime = timestamp;
    deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // 게임 타이머 업데이트
    gameTimer += deltaTime;
    const newTimeLeft = Math.ceil((gameTimeLimit - gameTimer) / 1000);
    
    // 남은 시간이 변경되었을 때만 DOM 업데이트
    if (newTimeLeft !== timeLeft) {
        timeLeft = newTimeLeft;
        document.getElementById('time-left').textContent = timeLeft;
    }
    
    // 게임 시간 제한 체크 (1분)
    if (gameTimer >= gameTimeLimit) {
        endGameByTimeout();
        return;
    }

    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 그리기
    drawPlayer();

    // 총알 업데이트 및 그리기
    player.bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        
        // 화면 밖으로 나간 총알 제거
        if (bullet.y + bullet.height < 0) {
            player.bullets.splice(index, 1);
        }
    });
    
    // 적 총알 업데이트
    enemyBullets.forEach((bullet, index) => {
        // 총알 이동 (각도에 따라 이동)
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        
        // 화면 밖으로 나간 총알 제거
        if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
            enemyBullets.splice(index, 1);
        }
    });
    
    drawBullets();

    // 자동 발사 타이머
    shootTimer += deltaTime;
    if (shootTimer > 500) { // 0.5초마다 발사
        shootBullet();
        shootTimer = 0;
    }

    // 적 총알 발사 타이머
    enemyShootTimer += deltaTime;
    if (enemyShootTimer > 1000 + 1000 / currentWave) { // 웨이브가 높아질수록 발사 간격 짧아짐
        enemyShoot();
        enemyShootTimer = 0;
    }

    // 적 스폰 타이머
    enemySpawnTimer += deltaTime;
    if (enemySpawnTimer > enemySpawnDelay && enemiesRemaining > 0) {
        if (Math.random() < 0.3 && currentWave > 1) { // 30% 확률로 포메이션 스폰
            spawnFormation();
        } else {
            spawnEnemy();
        }
        enemySpawnTimer = 0;
    }

    // 포메이션 생성 타이머
    formationTimer += deltaTime;
    if (formationTimer > 8000 && currentWave >= 2) { // 8초마다 포메이션 생성 가능성
        formationTimer = 0;
        if (Math.random() < 0.7) { // 70% 확률로 포메이션 생성
            spawnFormation();
        }
    }

    // 적 업데이트 및 그리기
    enemies.forEach((enemy, index) => {
        enemy.time += deltaTime / 1000; // 초 단위로 시간 증가
        
        // 적 이동 패턴
        switch(enemy.type) {
            case ENEMY_TYPES.NORMAL:
                // 기본 좌우 이동
                enemy.x += enemy.speed * enemy.direction;
                
                // 화면 경계에 닿으면 방향 전환
                if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                    enemy.direction *= -1;
                    enemy.moveDown = true;
                }
                
                // 아래로 이동
                if (enemy.moveDown) {
                    enemy.y += enemy.speed * 2;
                    enemy.moveDown = false;
                } else {
                    enemy.y += enemy.speed * 0.2; // 천천히 아래로 이동
                }
                break;
                
            case ENEMY_TYPES.ZIGZAG:
                // 지그재그 패턴 (사인파)
                enemy.y += enemy.speed * 0.5;
                enemy.x = enemy.x + Math.sin(enemy.time * 5) * 3;
                
                // 화면 경계 검사
                if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                    enemy.direction *= -1;
                }
                break;
                
            case ENEMY_TYPES.CIRCULAR:
                // 원형 패턴
                enemy.angle += 0.02;
                enemy.x = enemy.x + Math.sin(enemy.angle) * 2;
                enemy.y += enemy.speed * 0.3;
                break;
                
            case ENEMY_TYPES.BOSS:
                // 보스 패턴 - 느리게 좌우로 이동하며 주기적으로 빠르게 아래로 이동
                enemy.x += enemy.speed * enemy.direction * 0.7;
                
                if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                    enemy.direction *= -1;
                }
                
                // 일정 시간마다 아래로 빠르게 이동
                if (Math.sin(enemy.time) > 0.95) {
                    enemy.y += enemy.speed * 3;
                } else {
                    enemy.y += enemy.speed * 0.1;
                }
                break;
        }
        
        // 화면 아래로 나간 적 제거
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            
            if (enemy.type !== ENEMY_TYPES.BOSS) { // 보스가 아닌 적만 생명력 감소
                lives--;
                document.getElementById('lives').textContent = lives;
                
                if (lives <= 0) {
                    endGame();
                }
            } else {
                bossSpawned = false; // 보스가 화면을 벗어났으면 다시 생성할 수 있도록 플래그 리셋
            }
        }
    });
    drawEnemies();

    // 충돌 검사
    checkCollisions();

    // 웨이브 완료 확인
    if (enemies.length === 0 && enemiesRemaining === 0) {
        startNewWave();
    }

    // 게임 계속 실행
    if (!gameOver) {
        animationId = requestAnimationFrame(updateGame);
    }
}

// 시간 초과로 인한 게임 종료
function endGameByTimeout() {
    gameOver = true;
    gameStarted = false;
    gamePaused = false;
    cancelAnimationFrame(animationId);
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-message').textContent = '시간 종료!';
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    
    // 배경 음악 정지
    stopBackgroundMusic();
}

// 새로운 웨이브 시작
function startNewWave() {
    currentWave++;
    enemiesPerWave += 5;
    enemiesRemaining = enemiesPerWave;
    enemySpeed += 0.5;
    bossSpawned = false;
    
    if (enemySpawnDelay > 300) { // 최소 딜레이는 300ms
        enemySpawnDelay -= 100;
    }
}

// 게임 시작
function startGame() {
    console.log("시작 버튼 클릭됨!");
    
    if (gameStarted && !gameOver && !gamePaused) {
        console.log("이미 게임이 실행 중입니다.");
        return;
    }
    
    if (gamePaused) {
        console.log("일시정지 상태에서 재개합니다.");
        gamePaused = false;
        lastTime = 0;
        animationId = requestAnimationFrame(updateGame);
        playBackgroundMusic();
        return;
    }
    
    console.log("새 게임을 시작합니다.");
    gameStarted = true;
    gameOver = false;
    gamePaused = false;
    score = 0;
    lives = 3;
    currentWave = 1;
    enemiesPerWave = 10;
    enemiesRemaining = enemiesPerWave;
    enemySpeed = 2;
    enemySpawnDelay = 1000;
    bossSpawned = false;
    gameTimer = 0; // 게임 타이머 초기화
    timeLeft = 60; // 남은 시간 초기화
    
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('time-left').textContent = timeLeft;
    document.getElementById('game-over-message').textContent = '게임 오버';
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('mobile-controls').classList.remove('hidden');
    
    player.bullets = [];
    enemies = [];
    enemyBullets = []; // 적 총알 배열 초기화
    
    lastTime = 0;
    animationId = requestAnimationFrame(updateGame);
    
    // 배경 음악 재생
    playBackgroundMusic();
}

// 게임 일시정지
function pauseGame() {
    if (!gameStarted || gameOver) return;
    
    if (gamePaused) {
        // 이미 일시정지 상태면 다시 시작
        gamePaused = false;
        lastTime = 0;
        animationId = requestAnimationFrame(updateGame);
        playBackgroundMusic();
    } else {
        // 일시정지
        gamePaused = true;
        cancelAnimationFrame(animationId);
        backgroundMusic.pause();
    }
}

// 게임 종료
function endGame() {
    gameOver = true;
    gameStarted = false;
    gamePaused = false;
    cancelAnimationFrame(animationId);
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-message').textContent = '게임 오버';
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    
    // 배경 음악 정지
    stopBackgroundMusic();
}

// 게임 강제 중지 (STOP 버튼)
function stopGame() {
    if (!gameStarted && !gameOver) return;
    
    cancelAnimationFrame(animationId);
    gameStarted = false;
    gameOver = false;
    gamePaused = false;
    
    // 시작 화면 표시
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    
    // 배경 음악 정지
    stopBackgroundMusic();
}

// 터치 이벤트 처리
let touchX = 0;
let touchY = 0;
let touchStartX = 0;
let touchStartY = 0;
let isTouch = false;

function handleTouchStart(e) {
    if (!gameStarted || gameOver) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchX = touchStartX;
    touchY = touchStartY;
    isTouch = true;
}

function handleTouchMove(e) {
    if (!isTouch || !gameStarted || gameOver) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
    
    // 플레이어 이동
    const deltaX = touchX - touchStartX;
    player.x += deltaX * 0.5; // 감도 조절
    
    // 화면 경계 제한
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // 터치 시작점 업데이트
    touchStartX = touchX;
}

function handleTouchEnd(e) {
    e.preventDefault();
    isTouch = false;
}

// 이벤트 리스너 등록
window.addEventListener('load', () => {
    resizeCanvas();
    loadImages();
    
    // 시작 버튼 이벤트
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', startGame);
    
    // 상단 메뉴 버튼 이벤트 추가
    document.getElementById('start-menu').addEventListener('click', startGame);
    document.getElementById('pause-menu').addEventListener('click', pauseGame);
    document.getElementById('stop-menu').addEventListener('click', stopGame);
    
    // 터치 이벤트
    document.getElementById('touch-area').addEventListener('touchstart', handleTouchStart, {passive: false});
    document.getElementById('touch-area').addEventListener('touchmove', handleTouchMove, {passive: false});
    document.getElementById('touch-area').addEventListener('touchend', handleTouchEnd, {passive: false});
    
    // 화면 크기 변경 시 캔버스 크기 조정
    window.addEventListener('resize', resizeCanvas);
    
    // 오디오 준비
    backgroundMusic.volume = 0.5;
    shootSound.volume = 0.3;
    explosionSound.volume = 0.4;
    
    // 모바일 기기에서 자동 재생 문제 해결
    document.addEventListener('touchstart', function() {
        if (!gameStarted) {
            // 오디오 컨텍스트 초기화 (사용자 제스처 필요)
            backgroundMusic.load();
            shootSound.load();
            explosionSound.load();
        }
    }, { once: true });
});