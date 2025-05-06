// 게임 캔버스 및 컨텍스트 설정
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 오디오 요소
const backgroundMusic = document.getElementById('background-music');
const shootSound = document.getElementById('shoot-sound');
const explosionSound = document.getElementById('explosion-sound');

// 이미지 로드
const playerImage = new Image();
playerImage.src = 'images/player.png';

const enemyImage = new Image();
enemyImage.src = 'images/enemy1.png';

const enemyType2Image = new Image();
enemyType2Image.src = 'images/enemy2.png';

const enemyType3Image = new Image();
enemyType3Image.src = 'images/enemy3.png';

const bossImage = new Image();
bossImage.src = 'images/enemy5.png';

const bulletImage = new Image();
bulletImage.src = 'images/bullet.svg';

// 게임 변수 초기화
let gameStarted = false;
let gameOver = false;
let gamePaused = false;  // 게임 일시정지 상태 변수 추가
let score = 0;
let lives = 3;
let animationId;
let lastTime = 0;
let deltaTime = 16.67; // 고정된 델타타임

// 게임 시간 제한 (1분 = 60000ms)
const gameTimeLimit = 60000;
let gameTimer = 0;
let timeLeft = Math.ceil(gameTimeLimit / 1000);

// 소리 활성화 상태
let soundEnabled = true;

// 플레이어 설정
const player = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    speed: 5,
    bullets: []
};

// 적 관련 변수
let enemies = [];
let enemyBullets = [];
let currentWave = 1;
let enemiesPerWave = 10;
let enemiesRemaining = enemiesPerWave;
let enemySpeed = 2;
let enemySpawnTimer = 0;
let enemySpawnDelay = 1000; // 1초마다 적 생성
let enemyShootTimer = 0;
let enemyDirectionChangeTimer = 0;
let formationTimer = 0;
let bossSpawned = false;

// 적 타입 정의
const ENEMY_TYPES = {
    NORMAL: 'normal',
    ZIGZAG: 'zigzag',
    CIRCULAR: 'circular',
    BOSS: 'boss'
};

function startGame() {
    // ...게임 시작 로직...
}
window.startGame = startGame;