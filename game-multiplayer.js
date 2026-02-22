// ===== MULTIPLAYER VARIABLES =====
let socket = null;
let isMultiplayer = false;
let myPlayerNumber = null;
let currentGameId = null;
let isConnected = false;

// ===== GAME BALANCE VARIABLES ===== 
let square_damage = 3000;
let square_super_damage = 5000;
let square_movement_speed = 5;
let triangle_damage = 1000;
let triangle_super_damage = 1000;
let triangle_movement_speed = 5;
let triangle_bullet_speed = 15;
let triangle_super_bullet_speed = 20;
let circle_damage = 3000;
let circle_super_damage = 5000;
let circle_movement_speed = 4;
let circle_bullet_speed = 8;
let circle_super_bullet_speed = 12;
let circle_explosion_spike_damage = 500;
let oval_damage = 300;
let oval_super_damage = 1000;
let oval_movement_speed = 5;
let oval_bullet_speed = 15;
let pentagon_damage = 4500;
let pentagon_super_damage = 7000;
let pentagon_movement_speed = 5;
let pentagon_bullet_speed = 17;
let star_damage = 2500;
let star_movement_speed = 5;
let star_shield_duration = 5000;
let rhombus_damage = 3000;
let rhombus_circular_extra_damage = 1000;
let rhombus_super_damage = 2000;
let rhombus_movement_speed = 5;
let rhombus_bullet_speed = 17;
let rhombus_melee_range = 100;
let octagon_damage = 3000;
let octagon_split_damage = 500;
let octagon_super_damage = 3000;
let octagon_movement_speed = 5;
let octagon_bullet_speed = 12;
let octagon_split_distance = 500;
let octagon_super_pull_strength = 25;
let trapezoid_damage = 3000;
let trapezoid_super_damage = 3000;
let trapezoid_movement_speed = 5;
let trapezoid_dash_distance = 200;
let crescent_damage = 2000;
let crescent_super_damage = 1500;
let crescent_movement_speed = 5;
let crescent_bullet_speed = 10;
let crescent_zone_damage = 800;
let crescent_zone_duration = 4000;
let hexagon_damage = 1500;
let hexagon_super_damage = 1000;
let hexagon_movement_speed = 4;
let hexagon_drone_speed = 7;
let hexagon_drone_duration = 4000;
let hexagon_max_drones = 6;
let arrow_damage = 4000;
let arrow_super_damage = 5000;
let arrow_movement_speed = 5;
let arrow_bullet_speed = 18;
let arrow_max_charge_time = 2000;
let arrow_beam_width = 30;

// ===== PRE-MADE MAPS (10 symmetric, enclosed-center arenas) =====
// Each map is an array of {x, y} grid cell positions for interior walls.
// Grid is 32x18 (1280/40 x 720/40). All maps have full 4-way symmetry
// (left-right and top-bottom mirrored). Center area (x=13-17, y=6-10)
// is always kept clear as a 5x5+ fighting arena.
const PREMADE_MAPS = [
  // 0: Box Arena — Rectangular enclosure with 4 cardinal entrances
  [
    {x:12,y:5},{x:13,y:5},{x:14,y:5},{x:17,y:5},{x:18,y:5},{x:19,y:5},
    {x:12,y:12},{x:13,y:12},{x:14,y:12},{x:17,y:12},{x:18,y:12},{x:19,y:12},
    {x:11,y:6},{x:11,y:7},{x:11,y:10},{x:11,y:11},
    {x:20,y:6},{x:20,y:7},{x:20,y:10},{x:20,y:11},
    {x:5,y:4},{x:5,y:5},{x:26,y:4},{x:26,y:5},
    {x:5,y:12},{x:5,y:13},{x:26,y:12},{x:26,y:13}
  ],
  // 1: Diamond Cage — Diamond-shaped walls enclosing center
  [
    {x:15,y:4},{x:16,y:4},
    {x:13,y:5},{x:14,y:5},{x:17,y:5},{x:18,y:5},
    {x:12,y:6},{x:19,y:6},
    {x:11,y:7},{x:20,y:7},
    {x:11,y:10},{x:20,y:10},
    {x:12,y:11},{x:19,y:11},
    {x:13,y:12},{x:14,y:12},{x:17,y:12},{x:18,y:12},
    {x:15,y:13},{x:16,y:13}
  ],
  // 2: Corridor Clash — Parallel walls create lanes funneling into open center
  [
    {x:4,y:5},{x:5,y:5},{x:6,y:5},{x:7,y:5},{x:8,y:5},{x:9,y:5},{x:10,y:5},{x:11,y:5},
    {x:4,y:12},{x:5,y:12},{x:6,y:12},{x:7,y:12},{x:8,y:12},{x:9,y:12},{x:10,y:12},{x:11,y:12},
    {x:20,y:5},{x:21,y:5},{x:22,y:5},{x:23,y:5},{x:24,y:5},{x:25,y:5},{x:26,y:5},{x:27,y:5},
    {x:20,y:12},{x:21,y:12},{x:22,y:12},{x:23,y:12},{x:24,y:12},{x:25,y:12},{x:26,y:12},{x:27,y:12}
  ],
  // 3: Four Corners — L-shaped walls in corners, pillars frame center arena
  [
    {x:5,y:4},{x:6,y:4},{x:7,y:4},{x:5,y:5},{x:5,y:6},
    {x:24,y:4},{x:25,y:4},{x:26,y:4},{x:26,y:5},{x:26,y:6},
    {x:5,y:11},{x:5,y:12},{x:5,y:13},{x:6,y:13},{x:7,y:13},
    {x:26,y:11},{x:26,y:12},{x:24,y:13},{x:25,y:13},{x:26,y:13},
    {x:12,y:7},{x:19,y:7},{x:12,y:10},{x:19,y:10}
  ],
  // 4: Octagon Arena — Octagonal enclosure with 4 entrances
  [
    {x:14,y:4},{x:17,y:4},
    {x:12,y:5},{x:13,y:5},{x:18,y:5},{x:19,y:5},
    {x:11,y:6},{x:11,y:7},{x:20,y:6},{x:20,y:7},
    {x:11,y:10},{x:11,y:11},{x:20,y:10},{x:20,y:11},
    {x:12,y:12},{x:13,y:12},{x:18,y:12},{x:19,y:12},
    {x:14,y:13},{x:17,y:13}
  ],
  // 5: Pinch Points — Vertical barriers with pillars funnel to center
  [
    {x:10,y:4},{x:10,y:5},{x:10,y:6},{x:10,y:7},
    {x:10,y:10},{x:10,y:11},{x:10,y:12},{x:10,y:13},
    {x:21,y:4},{x:21,y:5},{x:21,y:6},{x:21,y:7},
    {x:21,y:10},{x:21,y:11},{x:21,y:12},{x:21,y:13},
    {x:12,y:5},{x:19,y:5},{x:12,y:12},{x:19,y:12}
  ],
  // 6: Colosseum — Large oval ring enclosure with wide entrances
  [
    {x:13,y:4},{x:14,y:4},{x:17,y:4},{x:18,y:4},
    {x:11,y:5},{x:12,y:5},{x:19,y:5},{x:20,y:5},
    {x:10,y:6},{x:10,y:7},{x:21,y:6},{x:21,y:7},
    {x:10,y:10},{x:10,y:11},{x:21,y:10},{x:21,y:11},
    {x:11,y:12},{x:12,y:12},{x:19,y:12},{x:20,y:12},
    {x:13,y:13},{x:14,y:13},{x:17,y:13},{x:18,y:13}
  ],
  // 7: Double Wall — Inner enclosure with outer cover walls
  [
    {x:9,y:5},{x:9,y:6},{x:22,y:5},{x:22,y:6},
    {x:9,y:11},{x:9,y:12},{x:22,y:11},{x:22,y:12},
    {x:13,y:5},{x:14,y:5},{x:17,y:5},{x:18,y:5},
    {x:12,y:6},{x:12,y:7},{x:19,y:6},{x:19,y:7},
    {x:12,y:10},{x:12,y:11},{x:19,y:10},{x:19,y:11},
    {x:13,y:12},{x:14,y:12},{x:17,y:12},{x:18,y:12}
  ],
  // 8: Cross Paths — Cross-shaped walls force pathing around to open center
  [
    {x:5,y:8},{x:6,y:8},{x:7,y:8},{x:8,y:8},{x:9,y:8},{x:10,y:8},
    {x:5,y:9},{x:6,y:9},{x:7,y:9},{x:8,y:9},{x:9,y:9},{x:10,y:9},
    {x:21,y:8},{x:22,y:8},{x:23,y:8},{x:24,y:8},{x:25,y:8},{x:26,y:8},
    {x:21,y:9},{x:22,y:9},{x:23,y:9},{x:24,y:9},{x:25,y:9},{x:26,y:9},
    {x:15,y:3},{x:16,y:3},{x:15,y:4},{x:16,y:4},
    {x:15,y:13},{x:16,y:13},{x:15,y:14},{x:16,y:14}
  ],
  // 9: Fortress — Fortified spawn areas on each side, open center arena
  [
    {x:4,y:6},{x:5,y:6},{x:6,y:6},{x:7,y:6},
    {x:4,y:11},{x:5,y:11},{x:6,y:11},{x:7,y:11},
    {x:4,y:7},{x:4,y:8},{x:4,y:9},{x:4,y:10},
    {x:24,y:6},{x:25,y:6},{x:26,y:6},{x:27,y:6},
    {x:24,y:11},{x:25,y:11},{x:26,y:11},{x:27,y:11},
    {x:27,y:7},{x:27,y:8},{x:27,y:9},{x:27,y:10},
    {x:12,y:5},{x:19,y:5},{x:12,y:12},{x:19,y:12}
  ]
];

const MAX_PARTICLES = 60;

// ===== CANONICAL MAP DIMENSIONS =====
// The map is always designed for this base resolution.
// On bigger screens everything just scales up visually.
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const BASE_CELL = 40;
let scaleFactor = 1;

let backgroundParticles = [];
let menuAnimationOffset = 0;
let transitionAlpha = 0;
let glowPulse = 0;
let gridLines = [];

let gameMode = null;
let player1Choice = null;
let player2Choice = null;
let selectedBotCharacter = null;
let shapes = ['square', 'triangle', 'circle', 'oval', 'pentagon', 'star', 'rhombus', 'octagon', 'trapezoid', 'crescent', 'hexagon', 'arrow'];
let gameState = 'modeSelection';
let countdownTimer = 3;
let lastCountdownTime = 0;

let gameOverTime = 0;
let winner = null;

let botDecisionTimer = 0;
let botDecisionInterval = 300;
let botTarget = {x: 0, y: 0};
let botAction = 'idle';
let botDodgeTimer = 0;
let botDodgeDirection = {x: 0, y: 0};
let botMovementTimer = 0;
let botAttackTimer = 0;
let botLastPlayerPos = {x: 0, y: 0};
let botPredictedPlayerPos = {x: 0, y: 0};
let botStrafeDirection = 1;

let mapSeed = 0;

// Positions stored in BASE coordinates (unscaled)
let player1 = {
  x: 0, y: 0, size: 30, speed: 5, color: null,
  health: 9000, maxHealth: 9000, lastAttack: 0, attackCooldown: 1000,
  triangleBulletCount: 0, ovalBulletCount: 0, lastBulletTime: 0,
  triangleTargetAngle: 0, ovalTargetAngle: 0, lastHitTime: 0,
  lastMoveTime: 0, lastHealTime: 0, superCharge: 0, maxSuperCharge: 4,
  superActive: false, superBulletCount: 0, lastSuperBulletTime: 0,
  superTriangleTargetAngle: 0, superOvalTargetAngle: 0, lastPoisonDamage: 0,
  shieldActive: false, shieldStartTime: 0, rhombusMode: 1,
  isDashing: false, dashStartX: 0, dashStartY: 0, dashTargetX: 0, dashTargetY: 0,
  dashProgress: 0, rotation: 0, damageFlash: 0, scale: 1, trail: [],
  arrowCharging: false, arrowChargeStart: 0
};

let player2 = {
  x: 0, y: 0, size: 30, speed: 5, color: null,
  health: 9000, maxHealth: 9000, lastAttack: 0, attackCooldown: 1000,
  triangleBulletCount: 0, ovalBulletCount: 0, lastBulletTime: 0,
  triangleTargetAngle: 0, ovalTargetAngle: 0, lastHitTime: 0,
  lastMoveTime: 0, lastHealTime: 0, superCharge: 0, maxSuperCharge: 4,
  superActive: false, superBulletCount: 0, lastSuperBulletTime: 0,
  superTriangleTargetAngle: 0, superOvalTargetAngle: 0, lastPoisonDamage: 0,
  shieldActive: false, shieldStartTime: 0, rhombusMode: 1,
  isDashing: false, dashStartX: 0, dashStartY: 0, dashTargetX: 0, dashTargetY: 0,
  dashProgress: 0, rotation: 0, damageFlash: 0, scale: 1, trail: [],
  arrowCharging: false, arrowChargeStart: 0
};

let poisonGas = {
  active: false, startTime: 0, topBorder: 0, bottomBorder: 0,
  leftBorder: 0, rightBorder: 0, lastAdvance: 0
};

let projectiles = [];
let meleeEffects = [];
let particles = [];
let drones = [];
let damageZones = [];
let selectionScrollY = 0;
let screenShake = 0;
let walls = []; // stored in BASE coordinates
let gameStartTime = 0;
let introProgress = 0;

// Helper: convert base coords to screen coords
function toScreenX(bx) { return bx * scaleFactor; }
function toScreenY(by) { return by * scaleFactor; }
function toScreenSize(bs) { return bs * scaleFactor; }
// Convert screen (mouse) coords to base coords
function toBaseX(sx) { return sx / scaleFactor; }
function toBaseY(sy) { return sy / scaleFactor; }

function calculateScale() {
  let sx = windowWidth / BASE_WIDTH;
  let sy = windowHeight / BASE_HEIGHT;
  scaleFactor = min(sx, sy);
  if (scaleFactor < 0.5) scaleFactor = 0.5;
}

function initializeMultiplayer() {
  socket = io({
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 10000
  });

  socket.on('connect', () => {
    console.log('Connected to server!');
    isConnected = true;
  });

  socket.on('waiting-for-opponent', () => {
    console.log('Waiting for opponent...');
    gameState = 'waiting';
  });

  socket.on('match-found', ({ gameId, playerNumber }) => {
    console.log(`Match found! You are player ${playerNumber}`);
    currentGameId = gameId;
    myPlayerNumber = playerNumber;
    gameState = 'selection';
  });

  socket.on('opponent-selected', ({ character }) => {
    console.log(`Opponent selected: ${character}`);
    if (myPlayerNumber === 1) {
      player2Choice = character;
    } else {
      player1Choice = character;
    }
  });

  socket.on('start-countdown', ({ player1Choice: p1, player2Choice: p2, mapSeed: seed }) => {
    player1Choice = p1;
    player2Choice = p2;
    mapSeed = seed;
    gameState = 'countdown';
    lastCountdownTime = millis();
    countdownTimer = 3;
  });

  socket.on('game-start', () => {
    startGame();
  });

  socket.on('opponent-update', ({ playerNum, data }) => {
    const opponent = playerNum === 1 ? player1 : player2;
    Object.assign(opponent, data);
  });

  socket.on('opponent-attack', ({ playerNum, attackData }) => {
    const attacker = playerNum === 1 ? player1 : player2;
    const choice = playerNum === 1 ? player1Choice : player2Choice;
    attack(attacker, attackData.target, choice, playerNum, attackData.isSuper);
  });

  socket.on('health-update', ({ player1Health, player2Health }) => {
    player1.health = player1Health;
    player2.health = player2Health;
  });

  socket.on('game-over', ({ winner: winnerNum }) => {
    winner = winnerNum;
    gameState = 'gameOver';
    gameOverTime = millis();
  });

  socket.on('opponent-disconnected', () => {
    alert('Opponent disconnected!');
    resetGame();
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    isConnected = false;
  });
}

function sendPlayerUpdate() {
  if (!isMultiplayer || !socket || !currentGameId) return;
  const myPlayer = myPlayerNumber === 1 ? player1 : player2;
  socket.emit('player-update', {
    gameId: currentGameId,
    data: {
      x: myPlayer.x, y: myPlayer.y,
      rotation: myPlayer.rotation,
      health: myPlayer.health,
      superCharge: myPlayer.superCharge,
      shieldActive: myPlayer.shieldActive,
      isDashing: myPlayer.isDashing
    }
  });
}

function sendAttack(target, isSuper) {
  if (!isMultiplayer || !socket || !currentGameId) return;
  socket.emit('player-attack', {
    gameId: currentGameId,
    attackData: { target: target, isSuper: isSuper }
  });
}

function sendDamage(damage, targetPlayerNum) {
  if (!isMultiplayer || !socket || !currentGameId) return;
  socket.emit('damage-dealt', {
    gameId: currentGameId,
    damage: damage,
    targetPlayer: targetPlayerNum
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  frameRate(60);
  colorMode(RGB);
  calculateScale();
  generateMap();
  initBackgroundParticles();
  initGridLines();
  initializeMultiplayer();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateScale();
  initGridLines();
}

// ==================== MENU SCREENS ====================

function drawModeSelection() {
  background(15, 20, 40);
  if (frameCount % 4 === 0) updateBackgroundParticles();
  drawBackgroundParticles();

  push();
  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = 'rgba(100, 200, 255, 0.8)';
  fill(100, 200, 255);
  textSize(82);
  textStyle(BOLD);
  text("SHAPE BATTLE", width/2, height * 0.25);
  pop();

  fill(200, 220, 255, 200);
  textSize(24);
  textStyle(NORMAL);
  text("ARENA COMBAT", width/2, height * 0.32);

  let singlePlayerX = width/2 - 300;
  let twoPlayerX = width/2;
  let onlinePlayerX = width/2 + 300;
  let buttonY = height/2;
  let buttonW = 240;
  let buttonH = 100;

  let singleHovered = mouseX > singlePlayerX - buttonW/2 && mouseX < singlePlayerX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;
  let twoHovered = mouseX > twoPlayerX - buttonW/2 && mouseX < twoPlayerX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;
  let onlineHovered = mouseX > onlinePlayerX - buttonW/2 && mouseX < onlinePlayerX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;

  push();
  if (singleHovered) { drawingContext.shadowBlur = 30; drawingContext.shadowColor = 'rgba(100, 200, 255, 0.8)'; }
  fill(singleHovered ? color(100, 180, 255, 220) : color(100, 150, 255, 150));
  stroke(100, 200, 255); strokeWeight(3);
  rect(singlePlayerX - buttonW/2, buttonY - buttonH/2, buttonW, buttonH, 15);
  pop();
  fill(255); noStroke(); textSize(28);
  text("1 PLAYER", singlePlayerX, buttonY - 10);
  textSize(14); fill(200, 220, 255);
  text("VS BOT", singlePlayerX, buttonY + 20);

  push();
  if (twoHovered) { drawingContext.shadowBlur = 30; drawingContext.shadowColor = 'rgba(255, 150, 150, 0.8)'; }
  fill(twoHovered ? color(255, 120, 120, 220) : color(255, 100, 100, 150));
  stroke(255, 150, 150); strokeWeight(3);
  rect(twoPlayerX - buttonW/2, buttonY - buttonH/2, buttonW, buttonH, 15);
  pop();
  fill(255); noStroke(); textSize(28);
  text("2 PLAYERS", twoPlayerX, buttonY - 10);
  textSize(14); fill(255, 200, 200);
  text("LOCAL", twoPlayerX, buttonY + 20);

  push();
  if (onlineHovered) { drawingContext.shadowBlur = 30; drawingContext.shadowColor = 'rgba(100, 255, 100, 0.8)'; }
  fill(onlineHovered ? color(100, 255, 120, 220) : color(100, 200, 100, 150));
  stroke(100, 255, 150); strokeWeight(3);
  rect(onlinePlayerX - buttonW/2, buttonY - buttonH/2, buttonW, buttonH, 15);
  pop();
  fill(255); noStroke(); textSize(28);
  text("ONLINE", onlinePlayerX, buttonY - 10);
  textSize(14); fill(200, 255, 200);
  text(isConnected ? "MULTIPLAYER" : "CONNECTING...", onlinePlayerX, buttonY + 20);

  let alpha = map(sin(millis() * 0.006), -1, 1, 180, 255);
  fill(255, 255, 255, alpha); textSize(18);
  text("✨ Choose your game mode ✨", width/2, height * 0.85);
}

function drawWaitingScreen() {
  background(15, 20, 40);
  if (frameCount % 4 === 0) updateBackgroundParticles();
  drawBackgroundParticles();

  push();
  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = 'rgba(100, 255, 100, 0.8)';
  fill(100, 255, 100); textSize(64); textStyle(BOLD);
  text("FINDING OPPONENT", width/2, height/2 - 50);
  pop();

  let dots = '.'.repeat((frameCount / 30) % 4);
  fill(200, 255, 200); textSize(32); textStyle(NORMAL);
  text(`Please wait${dots}`, width/2, height/2 + 30);

  let buttonW = 200, buttonH = 60;
  let buttonX = width/2, buttonY = height * 0.7;
  let cancelHovered = mouseX > buttonX - buttonW/2 && mouseX < buttonX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;

  push();
  if (cancelHovered) { drawingContext.shadowBlur = 20; drawingContext.shadowColor = 'rgba(255, 100, 100, 0.6)'; }
  fill(cancelHovered ? color(255, 100, 100, 200) : color(200, 100, 100, 150));
  stroke(255, 150, 150); strokeWeight(2);
  rect(buttonX - buttonW/2, buttonY - buttonH/2, buttonW, buttonH, 10);
  pop();
  fill(255); noStroke(); textSize(24);
  text("CANCEL", buttonX, buttonY);
}

// ==================== MAIN DRAW ====================

function draw() {
  glowPulse = map(sin(millis() * 0.003), -1, 1, 0.8, 1.2);

  if (gameState === 'modeSelection') {
    drawModeSelection();
  } else if (gameState === 'waiting') {
    drawWaitingScreen();
  } else if (gameState === 'selection') {
    drawSelectionScreen();
    if (gameMode === 'single' && player1Choice && selectedBotCharacter) {
      gameState = 'countdown'; lastCountdownTime = millis(); countdownTimer = 3;
    } else if (gameMode === 'two' && player1Choice && player2Choice && !isMultiplayer) {
      gameState = 'countdown'; lastCountdownTime = millis(); countdownTimer = 3;
    }
  } else if (gameState === 'countdown') {
    drawCountdown();
  } else if (gameState === 'playing') {
    drawGame();
    if (isMultiplayer && frameCount % 5 === 0) sendPlayerUpdate();
  } else if (gameState === 'gameOver') {
    drawGameOver();
  }
}

// ==================== INPUT ====================

function mousePressed() {
  if (gameState === 'modeSelection') {
    let singlePlayerX = width/2 - 300, twoPlayerX = width/2, onlinePlayerX = width/2 + 300;
    let buttonY = height/2, buttonW = 240, buttonH = 100;

    if (mouseX > singlePlayerX - buttonW/2 && mouseX < singlePlayerX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2) {
      gameMode = 'single'; isMultiplayer = false; gameState = 'selection';
    } else if (mouseX > twoPlayerX - buttonW/2 && mouseX < twoPlayerX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2) {
      gameMode = 'two'; isMultiplayer = false; gameState = 'selection';
    } else if (mouseX > onlinePlayerX - buttonW/2 && mouseX < onlinePlayerX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2) {
      if (isConnected) { gameMode = 'online'; isMultiplayer = true; socket.emit('find-match'); }
      else { alert('Not connected to server!'); }
    }
  } else if (gameState === 'waiting') {
    let buttonW = 200, buttonH = 60, buttonX = width/2, buttonY = height * 0.7;
    if (mouseX > buttonX - buttonW/2 && mouseX < buttonX + buttonW/2 && mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2) {
      socket.emit('cancel-matchmaking'); resetGame();
    }
  } else if (gameState === 'selection') {
    let cols = 3, cellHeight = height * 0.18, gridStartY = height * 0.15;

    if (isMultiplayer) {
      if (!myPlayerNumber) return;
      let gridStartX = width/2 - (width * 0.35), gridWidth = width * 0.7, cellWidth = gridWidth / cols;
      for (let i = 0; i < shapes.length; i++) {
        let col = i % cols, row = floor(i / cols);
        let shapeX = gridStartX + col * cellWidth + cellWidth / 2;
        let shapeY = gridStartY + row * cellHeight + cellHeight / 2 - selectionScrollY;
        if (dist(mouseX, mouseY, shapeX, shapeY) < 40) {
          if (myPlayerNumber === 1) player1Choice = shapes[i];
          else player2Choice = shapes[i];
          if (socket && currentGameId) socket.emit('character-selected', { gameId: currentGameId, character: shapes[i] });
          break;
        }
      }
    } else {
      let p1GridStartX = (width/2) * 0.15, p1GridWidth = (width/2) * 0.7, cellWidth = p1GridWidth / cols;
      if (mouseX < width/2) {
        for (let i = 0; i < shapes.length; i++) {
          let col = i % cols, row = floor(i / cols);
          let shapeX = p1GridStartX + col * cellWidth + cellWidth / 2;
          let shapeY = gridStartY + row * cellHeight + cellHeight / 2 - selectionScrollY;
          if (dist(mouseX, mouseY, shapeX, shapeY) < 35) { player1Choice = shapes[i]; break; }
        }
      }
      if (mouseX > width/2) {
        let p2GridStartX = width/2 + (width/2) * 0.15;
        for (let i = 0; i < shapes.length; i++) {
          let col = i % cols, row = floor(i / cols);
          let shapeX = p2GridStartX + col * cellWidth + cellWidth / 2;
          let shapeY = gridStartY + row * cellHeight + cellHeight / 2 - selectionScrollY;
          if (dist(mouseX, mouseY, shapeX, shapeY) < 35) {
            if (gameMode === 'single') { selectedBotCharacter = shapes[i]; player2Choice = shapes[i]; }
            else { player2Choice = shapes[i]; }
            break;
          }
        }
      }
    }
  } else if (gameState === 'playing') {
    // Convert mouse to base coords for attack target
    let baseMouseX = toBaseX(mouseX);
    let baseMouseY = toBaseY(mouseY);

    if (isMultiplayer) {
      if (myPlayerNumber === 1 || myPlayerNumber === 2) {
        let myPlayer = myPlayerNumber === 1 ? player1 : player2;
        let myChoice = myPlayerNumber === 1 ? player1Choice : player2Choice;
        if (myChoice === 'arrow' && !myPlayer.arrowCharging) {
          myPlayer.arrowCharging = true; myPlayer.arrowChargeStart = millis(); return;
        }
        let cooldown = (myChoice === 'triangle' || myChoice === 'oval') ? 2000 : 1000;
        if (millis() - myPlayer.lastAttack > cooldown && !myPlayer.isDashing) {
          let mouseTarget = { x: baseMouseX, y: baseMouseY };
          attack(myPlayer, mouseTarget, myChoice, myPlayerNumber, false);
          sendAttack(mouseTarget, false);
          myPlayer.lastAttack = millis();
          myPlayer.lastMoveTime = millis();
        }
      }
    } else if (gameMode === 'single') {
      if (player1Choice === 'arrow' && !player1.arrowCharging) {
        player1.arrowCharging = true; player1.arrowChargeStart = millis(); return;
      }
      let p1Cooldown = (player1Choice === 'triangle' || player1Choice === 'oval') ? 2000 : 1000;
      if (millis() - player1.lastAttack > p1Cooldown && !player1.isDashing) {
        let mouseTarget = { x: baseMouseX, y: baseMouseY };
        attack(player1, mouseTarget, player1Choice, 1, false);
        player1.lastAttack = millis();
        player1.lastMoveTime = millis();
      }
    }
  }
}

// ==================== PLAYER UPDATE ====================

function updatePlayers() {
  let localPlayer = null;
  let localPlayerNum = 0;

  if (isMultiplayer) {
    localPlayer = myPlayerNumber === 1 ? player1 : player2;
    localPlayerNum = myPlayerNumber;
  } else {
    localPlayer = player1;
    localPlayerNum = 1;
  }

  if (localPlayer && !localPlayer.isDashing) {
    let moveX = 0, moveY = 0;
    let wasdPressed = false;

    if (keyIsDown(87)) { moveY -= 1; wasdPressed = true; }
    if (keyIsDown(83)) { moveY += 1; wasdPressed = true; }
    if (keyIsDown(65)) { moveX -= 1; wasdPressed = true; }
    if (keyIsDown(68)) { moveX += 1; wasdPressed = true; }

    if (isMultiplayer || gameMode === 'single') {
      if (!wasdPressed) {
        if (keyIsDown(UP_ARROW)) { moveY -= 1; }
        if (keyIsDown(DOWN_ARROW)) { moveY += 1; }
        if (keyIsDown(LEFT_ARROW)) { moveX -= 1; }
        if (keyIsDown(RIGHT_ARROW)) { moveX += 1; }
      }
    }

    // Normalize diagonal
    if (moveX !== 0 && moveY !== 0) {
      let len = sqrt(moveX * moveX + moveY * moveY);
      moveX /= len; moveY /= len;
    }

    if (moveX !== 0 || moveY !== 0) {
      let pNewX = localPlayer.x + moveX * localPlayer.speed;
      let pNewY = localPlayer.y + moveY * localPlayer.speed;

      if (!checkCollision(pNewX, pNewY, localPlayer.size)) {
        localPlayer.x = pNewX; localPlayer.y = pNewY;
      } else if (!checkCollision(pNewX, localPlayer.y, localPlayer.size)) {
        localPlayer.x = pNewX;
      } else if (!checkCollision(localPlayer.x, pNewY, localPlayer.size)) {
        localPlayer.y = pNewY;
      }
      localPlayer.lastMoveTime = millis();
      localPlayer.rotation += 0.08;
    }
  }

  if (isMultiplayer && localPlayer) {
    let myChoice = localPlayerNum === 1 ? player1Choice : player2Choice;
    let maxCharge = (myChoice === 'triangle' || myChoice === 'oval') ? 10 : 4;
    if (keyIsDown(32) && localPlayer.superCharge >= maxCharge && !localPlayer.superActive && !localPlayer.isDashing) {
      let opponent = localPlayerNum === 1 ? player2 : player1;
      let mouseTarget = { x: opponent.x, y: opponent.y };
      attack(localPlayer, mouseTarget, myChoice, localPlayerNum, true);
      sendAttack(mouseTarget, true);
      localPlayer.superCharge = 0;
      localPlayer.lastMoveTime = millis();
      if (myChoice === 'triangle' || myChoice === 'oval') localPlayer.superActive = true;
    }
  } else if (gameMode === 'single') {
    let p1MaxCharge = (player1Choice === 'triangle' || player1Choice === 'oval') ? 10 : 4;
    if (keyIsDown(32) && player1.superCharge >= p1MaxCharge && !player1.superActive && !player1.isDashing) {
      let baseMouseX = toBaseX(mouseX), baseMouseY = toBaseY(mouseY);
      let mouseTarget = { x: baseMouseX, y: baseMouseY };
      attack(player1, mouseTarget, player1Choice, 1, true);
      player1.superCharge = 0;
      player1.lastMoveTime = millis();
      if (player1Choice === 'triangle' || player1Choice === 'oval') player1.superActive = true;
    }
    updateBotAI();
  } else if (gameMode === 'two') {
    let p1MaxCharge = (player1Choice === 'triangle' || player1Choice === 'oval') ? 10 : 4;
    if (keyIsDown(86) && player1.superCharge >= p1MaxCharge && !player1.superActive && !player1.isDashing) {
      attack(player1, {x: player2.x, y: player2.y}, player1Choice, 1, true);
      player1.superCharge = 0; player1.lastMoveTime = millis();
      if (player1Choice === 'triangle' || player1Choice === 'oval') player1.superActive = true;
    }

    if (!player2.isDashing) {
      let p2MoveX = 0, p2MoveY = 0;
      if (keyIsDown(UP_ARROW)) p2MoveY -= 1;
      if (keyIsDown(DOWN_ARROW)) p2MoveY += 1;
      if (keyIsDown(LEFT_ARROW)) p2MoveX -= 1;
      if (keyIsDown(RIGHT_ARROW)) p2MoveX += 1;

      if (p2MoveX !== 0 && p2MoveY !== 0) {
        let len = sqrt(p2MoveX * p2MoveX + p2MoveY * p2MoveY);
        p2MoveX /= len; p2MoveY /= len;
      }

      if (p2MoveX !== 0 || p2MoveY !== 0) {
        let p2NewX = player2.x + p2MoveX * player2.speed;
        let p2NewY = player2.y + p2MoveY * player2.speed;
        if (!checkCollision(p2NewX, p2NewY, player2.size)) {
          player2.x = p2NewX; player2.y = p2NewY;
        } else if (!checkCollision(p2NewX, player2.y, player2.size)) {
          player2.x = p2NewX;
        } else if (!checkCollision(player2.x, p2NewY, player2.size)) {
          player2.y = p2NewY;
        }
        player2.lastMoveTime = millis();
        player2.rotation += 0.08;
      }
    }

    let p2MaxCharge = (player2Choice === 'triangle' || player2Choice === 'oval') ? 10 : 4;
    if (keyIsDown(190) && player2.superCharge >= p2MaxCharge && !player2.superActive && !player2.isDashing) {
      attack(player2, {x: player1.x, y: player1.y}, player2Choice, 2, true);
      player2.superCharge = 0; player2.lastMoveTime = millis();
      if (player2Choice === 'triangle' || player2Choice === 'oval') player2.superActive = true;
    }
  }
}

function dealDamage(player, damage, attacker) {
  player.health -= damage;
  player.lastHitTime = millis();
  player.damageFlash = 255;
  player.scale = 1.3;

  addParticleBurst(player.x, player.y, 15, player === player1 ? color(100, 150, 255) : color(255, 50, 50));

  if (attacker) {
    let attackerChoice = (attacker === player1) ? player1Choice : player2Choice;
    let maxCharge = (attackerChoice === 'triangle' || attackerChoice === 'oval') ? 10 : 4;
    if (attacker.superCharge < maxCharge) attacker.superCharge++;
  }

  screenShake = 6;

  if (isMultiplayer) {
    let attackerNum = attacker === player1 ? 1 : attacker === player2 ? 2 : null;
    if (attackerNum === myPlayerNumber) {
      let targetNum = player === player1 ? 1 : 2;
      sendDamage(damage, targetNum);
    }
  }
}

function resetGame() {
  screenShake = 0; gameState = 'modeSelection'; gameMode = null;
  player1Choice = null; player2Choice = null; selectedBotCharacter = null;
  particles = []; projectiles = []; meleeEffects = [];
  drones = []; damageZones = []; selectionScrollY = 0;
  introProgress = 0; transitionAlpha = 0;
  botDecisionTimer = 0; botAction = 'idle'; botDodgeTimer = 0;
  botMovementTimer = 0; botAttackTimer = 0;
  player1.trail = []; player2.trail = [];
  winner = null; gameOverTime = 0;
  isMultiplayer = false; myPlayerNumber = null; currentGameId = null; mapSeed = 0;
  calculateScale();
  generateMap();
  initBackgroundParticles();
  initGridLines();
}

// ==================== VISUAL HELPERS ====================

function initGridLines() {
  gridLines = [];
  for (let i = 0; i < 15; i++) {
    gridLines.push({ x1: random(width), y1: random(height), x2: random(width), y2: random(height), alpha: random(30, 80), speed: random(0.2, 0.5) });
  }
}
function updateGridLines() {
  for (let l of gridLines) { l.x1 += l.speed; l.y1 += l.speed * 0.5; if (l.x1 > width) l.x1 = 0; if (l.y1 > height) l.y1 = 0; }
}
function drawGridLines() {
  for (let g of gridLines) { stroke(100, 200, 255, g.alpha); strokeWeight(1); line(g.x1, g.y1, g.x1 + 100, g.y1 + 50); }
}

function addParticleBurst(bx, by, count, col, glow = true) {
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) break;
    let angle = random(TWO_PI);
    particles.push({ x: bx, y: by, vx: cos(angle) * random(3, 10), vy: sin(angle) * random(3, 10), life: 30, maxLife: 30, size: random(4, 10), color: col, glow: glow });
  }
  while (particles.length > MAX_PARTICLES) particles.shift();
}

function initBackgroundParticles() {
  backgroundParticles = [];
  for (let i = 0; i < 20; i++) {
    backgroundParticles.push({ x: random(width), y: random(height), size: random(2, 6), speedX: random(-0.5, 0.5), speedY: random(-0.5, 0.5), alpha: random(50, 120), hue: random(180, 240), pulseOffset: random(TWO_PI) });
  }
}
function updateBackgroundParticles() {
  for (let p of backgroundParticles) { p.x += p.speedX; p.y += p.speedY; if (p.x < 0) p.x = width; if (p.x > width) p.x = 0; if (p.y < 0) p.y = height; if (p.y > height) p.y = 0; }
}
function drawBackgroundParticles() {
  for (let p of backgroundParticles) {
    let pulse = map(sin(millis() * 0.002 + p.pulseOffset), -1, 1, 0.5, 1);
    fill(p.hue, 150, 255, p.alpha * pulse); noStroke();
    circle(p.x, p.y, p.size * pulse);
  }
}

// ==================== COUNTDOWN / GAME OVER ====================

function drawCountdown() {
  background(15, 20, 40);
  if (millis() - lastCountdownTime >= 1000) {
    countdownTimer--; lastCountdownTime = millis();
    addParticleBurst(BASE_WIDTH/2, BASE_HEIGHT/2, 20, color(random([255,100]), random([255,100]), random([100,255])));
    if (countdownTimer <= 0) startGame();
  }
  updateAndDrawParticles();

  push();
  drawingContext.shadowBlur = 50; drawingContext.shadowColor = 'rgba(255, 255, 100, 0.8)';
  fill(255, 255, 100); textSize(140); textStyle(BOLD);
  text(countdownTimer, width/2, height/2);
  pop();
  textStyle(NORMAL);
  fill(255); textSize(28);
  text("GET READY!", width/2, height/2 - 120);
  textSize(20);
  if (gameMode === 'single') {
    text(`PLAYER: ${player1Choice.toUpperCase()}`, width/2 - 150, height * 0.72);
    text(`BOT: ${player2Choice.toUpperCase()}`, width/2 + 150, height * 0.72);
  } else {
    text(`PLAYER 1: ${player1Choice.toUpperCase()}`, width/2 - 150, height * 0.72);
    text(`PLAYER 2: ${player2Choice.toUpperCase()}`, width/2 + 150, height * 0.72);
  }
}

function drawGameOver() {
  background(15, 20, 40);
  if (frameCount % 4 === 0) updateBackgroundParticles();
  drawBackgroundParticles();
  updateAndDrawParticles();

  let winnerColor = winner === 1 ? color(100, 200, 255) : color(255, 100, 100);
  let winnerName = "";
  if (gameMode === 'single') winnerName = winner === 1 ? "YOU WIN!" : "BOT WINS!";
  else if (isMultiplayer) winnerName = winner === myPlayerNumber ? "YOU WIN!" : "YOU LOSE!";
  else winnerName = winner === 1 ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";

  push();
  drawingContext.shadowBlur = 60;
  drawingContext.shadowColor = winner === 1 ? 'rgba(100, 200, 255, 0.8)' : 'rgba(255, 100, 100, 0.8)';
  fill(winnerColor); textSize(80); textStyle(BOLD);
  text(winnerName, width/2, height/2);
  pop();

  let timeLeft = 3 - floor((millis() - gameOverTime) / 1000);
  fill(255, 255, 255, 200); textSize(24); textStyle(NORMAL);
  text(`Returning to menu in ${timeLeft}...`, width/2, height/2 + 80);
  if (millis() - gameOverTime >= 3000) resetGame();
}

// ==================== PARTICLES ====================

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.vx *= 0.98; p.life--;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    let alpha = map(p.life, 0, p.maxLife, 0, 255);
    let sz = p.size * (p.life / p.maxLife);
    let sx = toScreenX(p.x), sy = toScreenY(p.y), ss = toScreenSize(sz);
    if (p.glow && frameCount % 3 === 0) {
      fill(red(p.color), green(p.color), blue(p.color), alpha * 0.3); noStroke();
      circle(sx, sy, ss + 6);
    }
    fill(red(p.color), green(p.color), blue(p.color), alpha); noStroke();
    circle(sx, sy, ss);
  }
}

function updateDamageFlash() {
  if (player1.damageFlash > 0) { player1.damageFlash -= 10; player1.scale = lerp(player1.scale, 1, 0.2); }
  if (player2.damageFlash > 0) { player2.damageFlash -= 10; player2.scale = lerp(player2.scale, 1, 0.2); }
}

function updateTrails() {
  if (frameCount % 4 === 0) player1.trail.push({x: player1.x, y: player1.y, life: 15});
  for (let i = player1.trail.length - 1; i >= 0; i--) { player1.trail[i].life--; if (player1.trail[i].life <= 0) player1.trail.splice(i, 1); }
  if (frameCount % 4 === 0) player2.trail.push({x: player2.x, y: player2.y, life: 15});
  for (let i = player2.trail.length - 1; i >= 0; i--) { player2.trail[i].life--; if (player2.trail[i].life <= 0) player2.trail.splice(i, 1); }
}

function drawTrail(player, playerNum) {
  let trailColor = playerNum === 1 ? color(100, 150, 255) : color(255, 50, 50);
  for (let t of player.trail) {
    let alpha = map(t.life, 0, 15, 0, 80);
    fill(red(trailColor), green(trailColor), blue(trailColor), alpha); noStroke();
    circle(toScreenX(t.x), toScreenY(t.y), toScreenSize(player.size * 0.4));
  }
}

// ==================== PLAYER DRAWING ====================

function drawPlayer(player, playerNum) {
  let choice = playerNum === 1 ? player1Choice : player2Choice;
  let playerColor = playerNum === 1 ? color(100, 180, 255) : color(255, 80, 80);
  if (player.damageFlash > 0) playerColor = lerpColor(playerColor, color(255, 255, 255), player.damageFlash / 255);

  push();
  translate(toScreenX(player.x), toScreenY(player.y));
  scale(player.scale * scaleFactor);
  rotate(player.rotation);
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = playerNum === 1 ? 'rgba(100, 180, 255, 0.6)' : 'rgba(255, 80, 80, 0.6)';
  fill(playerColor); stroke(255, 255, 255, 200); strokeWeight(3);
  drawPlayerShape(choice, player.size);
  pop();

  drawHealthBar(toScreenX(player.x), toScreenY(player.y) - toScreenSize(player.size) - 15, player.health, player.maxHealth, playerNum);
}

function drawPlayerShape(choice, size) {
  if (choice === 'square') { rect(-size/2, -size/2, size, size, 5); }
  else if (choice === 'triangle') { triangle(0, -size/1.5, -size/1.2, size/2, size/1.2, size/2); }
  else if (choice === 'circle') { circle(0, 0, size); }
  else if (choice === 'oval') { ellipse(0, 0, size * 1.5, size); }
  else if (choice === 'pentagon') { beginShape(); for (let i = 0; i < 5; i++) { let a = (TWO_PI/5)*i - PI/2; vertex(cos(a)*size/2, sin(a)*size/2); } endShape(CLOSE); }
  else if (choice === 'star') { beginShape(); for (let i = 0; i < 10; i++) { let a = (TWO_PI/10)*i - PI/2; let r = (i%2===0)?size/2:size/4; vertex(cos(a)*r, sin(a)*r); } endShape(CLOSE); }
  else if (choice === 'rhombus') { push(); rotate(PI/4); rect(-size/2, -size/2, size, size); pop(); }
  else if (choice === 'octagon') { beginShape(); for (let i = 0; i < 8; i++) { let a = (TWO_PI/8)*i; vertex(cos(a)*size/2, sin(a)*size/2); } endShape(CLOSE); }
  else if (choice === 'trapezoid') { beginShape(); vertex(-size/2, size/3); vertex(-size/3, -size/3); vertex(size/3, -size/3); vertex(size/2, size/3); endShape(CLOSE); }
  else if (choice === 'crescent') { arc(0, 0, size, size, PI * 0.25, PI * 1.75); arc(size * 0.2, 0, size * 0.7, size * 0.7, PI * 0.25, PI * 1.75); }
  else if (choice === 'hexagon') { beginShape(); for (let i = 0; i < 6; i++) { let a = (TWO_PI/6)*i - PI/2; vertex(cos(a)*size/2, sin(a)*size/2); } endShape(CLOSE); }
  else if (choice === 'arrow') { beginShape(); vertex(0, -size/2); vertex(size/2, size/4); vertex(size/4, size/4); vertex(size/4, size/2); vertex(-size/4, size/2); vertex(-size/4, size/4); vertex(-size/2, size/4); endShape(CLOSE); }
}

function drawHealthBar(sx, sy, health, maxHealth, playerNum) {
  let barWidth = 80, barHeight = 12;
  push();
  drawingContext.shadowBlur = 10; drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  fill(20, 25, 35); stroke(60, 70, 90); strokeWeight(2);
  rect(sx - barWidth/2, sy - barHeight/2, barWidth, barHeight, 6);
  pop();
  let healthPercent = health / maxHealth;
  let healthWidth = (barWidth - 6) * healthPercent;
  let healthColor;
  if (healthPercent > 0.6) healthColor = color(0, 255, 150);
  else if (healthPercent > 0.3) healthColor = color(255, 200, 0);
  else healthColor = color(255, 50, 50);
  push();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = `rgba(${red(healthColor)}, ${green(healthColor)}, ${blue(healthColor)}, 0.6)`;
  fill(healthColor); noStroke();
  rect(sx - barWidth/2 + 3, sy - barHeight/2 + 3, healthWidth, barHeight - 6, 4);
  pop();
  push();
  drawingContext.shadowBlur = 5; drawingContext.shadowColor = 'rgba(0, 0, 0, 0.8)';
  fill(255); textSize(12); textStyle(BOLD);
  text(floor(health), sx, sy - barHeight/2 - 15);
  pop();
}

function drawSuperBar(player, playerNum, x, y) {
  let barWidth = 240, barHeight = 40;
  let choice = playerNum === 1 ? player1Choice : player2Choice;
  let maxCharge = (choice === 'triangle' || choice === 'oval') ? 10 : 4;

  push();
  drawingContext.shadowBlur = 15; drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  fill(20, 25, 40); stroke(60, 70, 100); strokeWeight(3);
  rect(x, y, barWidth, barHeight, 10);
  pop();

  let segmentWidth = (barWidth - 12) / maxCharge;
  for (let i = 0; i < maxCharge; i++) {
    let segX = x + 6 + i * segmentWidth, segY = y + 6, segW = segmentWidth - 4, segH = barHeight - 12;
    if (i < player.superCharge) {
      push();
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = playerNum === 1 ? 'rgba(100, 200, 255, 0.6)' : 'rgba(255, 100, 100, 0.6)';
      fill(playerNum === 1 ? color(100, 200, 255) : color(255, 100, 100)); noStroke();
      rect(segX, segY, segW, segH, 5);
      pop();
    } else {
      fill(40, 45, 60); noStroke();
      rect(segX, segY, segW, segH, 5);
    }
  }

  push();
  drawingContext.shadowBlur = 5; drawingContext.shadowColor = 'rgba(0, 0, 0, 0.8)';
  fill(255); textSize(14); textStyle(BOLD);
  if (player.superCharge >= maxCharge) text("⚡ SUPER READY! ⚡", x + barWidth/2, y + barHeight/2);
  else text(`SUPER ${player.superCharge}/${maxCharge}`, x + barWidth/2, y + barHeight/2);
  pop();
}

// ==================== MAIN GAME DRAW ====================

function drawGame() {
  push();
  translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
  background(20, 25, 45);

  if (frameCount % 4 === 0) updateBackgroundParticles();
  drawBackgroundParticles();

  if (frameCount % 2 === 0) {
    stroke(100, 150, 200, 30); strokeWeight(1);
    let gridStep = toScreenSize(40);
    for (let x = (frameCount % floor(gridStep)); x < width; x += gridStep) line(x, 0, x, height);
    for (let y = (frameCount % floor(gridStep)); y < height; y += gridStep) line(0, y, width, y);
  }

  if (introProgress < 1) introProgress += 0.02;

  updatePoisonGas(); updateShields(); updatePlayers(); updateHealing();
  checkPoisonDamage(); updateTriangleBullets(); updateOvalBullets();
  updateSuperTriangleBullets(); updateSuperOvalBullets();
  updateDashes(); updateProjectiles(); updateMeleeEffects();
  updateDrones(); updateDamageZones();
  updateAndDrawParticles(); updateDamageFlash(); updateTrails();

  if (screenShake > 0) { screenShake *= 0.9; if (screenShake < 0.1) screenShake = 0; }

  if (player1.health <= 0) {
    winner = 2; gameState = 'gameOver'; gameOverTime = millis();
    addParticleBurst(BASE_WIDTH/2, BASE_HEIGHT/2, 40, color(255, 100, 100)); screenShake = 15;
  } else if (player2.health <= 0) {
    winner = 1; gameState = 'gameOver'; gameOverTime = millis();
    addParticleBurst(BASE_WIDTH/2, BASE_HEIGHT/2, 40, color(100, 200, 255)); screenShake = 15;
  }

  drawMap(); drawPoisonGas(); drawDamageZones(); drawMeleeEffects(); drawProjectiles(); drawDrones();
  drawTrail(player1, 1); drawTrail(player2, 2);
  drawPlayer(player1, 1); drawPlayer(player2, 2);
  drawShields();

  drawSuperBar(player1, 1, 20, height - 80);
  drawSuperBar(player2, 2, width - 260, height - 80);

  // Arrow charge indicator
  if (player1.arrowCharging && player1Choice === 'arrow') {
    let chargeRatio = constrain((millis() - player1.arrowChargeStart) / arrow_max_charge_time, 0, 1);
    let cx = toScreenX(player1.x), cy = toScreenY(player1.y) + toScreenSize(player1.size) + 15;
    fill(40, 40, 60); stroke(100, 120, 160); strokeWeight(2);
    rect(cx - 30, cy, 60, 8, 4);
    fill(lerp(100, 255, chargeRatio), lerp(200, 255, chargeRatio), lerp(255, 100, chargeRatio)); noStroke();
    rect(cx - 28, cy + 2, 56 * chargeRatio, 4, 3);
  }
  if (player2.arrowCharging && player2Choice === 'arrow') {
    let chargeRatio = constrain((millis() - player2.arrowChargeStart) / arrow_max_charge_time, 0, 1);
    let cx = toScreenX(player2.x), cy = toScreenY(player2.y) + toScreenSize(player2.size) + 15;
    fill(40, 40, 60); stroke(100, 120, 160); strokeWeight(2);
    rect(cx - 30, cy, 60, 8, 4);
    fill(lerp(255, 255, chargeRatio), lerp(100, 255, chargeRatio), lerp(100, 100, chargeRatio)); noStroke();
    rect(cx - 28, cy + 2, 56 * chargeRatio, 4, 3);
  }

  push();
  fill(0, 0, 0, 100); noStroke();
  rect(0, height - 40, width, 40);
  drawingContext.shadowBlur = 5; drawingContext.shadowColor = 'rgba(0, 0, 0, 0.8)';
  fill(200, 220, 255); textSize(14);
  if (gameMode === 'single' || isMultiplayer) text("WASD/Arrows Move • Left Click Attack • Spacebar Super", width/2, height - 20);
  else text("P1: WASD • C Attack • V Super | P2: Arrows • , Attack • . Super", width/2, height - 20);
  pop();

  pop();
}

// ==================== SHIELDS ====================

function updateShields() {
  if (player1.shieldActive && millis() - player1.shieldStartTime > star_shield_duration) player1.shieldActive = false;
  if (player2.shieldActive && millis() - player2.shieldStartTime > star_shield_duration) player2.shieldActive = false;
}

function drawShields() {
  if (player1.shieldActive) {
    let pulse = map(sin(millis() * 0.015), -1, 1, 0.88, 1.12);
    push(); translate(toScreenX(player1.x), toScreenY(player1.y));
    drawingContext.shadowBlur = 30; drawingContext.shadowColor = 'rgba(100, 200, 255, 0.6)';
    stroke(100, 200, 255, 200); strokeWeight(4); noFill();
    circle(0, 0, toScreenSize((player1.size + 25) * pulse));
    stroke(150, 220, 255, 150); strokeWeight(2);
    circle(0, 0, toScreenSize((player1.size + 15) * pulse));
    pop();
  }
  if (player2.shieldActive) {
    let pulse = map(sin(millis() * 0.015), -1, 1, 0.88, 1.12);
    push(); translate(toScreenX(player2.x), toScreenY(player2.y));
    drawingContext.shadowBlur = 30; drawingContext.shadowColor = 'rgba(255, 100, 100, 0.6)';
    stroke(255, 100, 100, 200); strokeWeight(4); noFill();
    circle(0, 0, toScreenSize((player2.size + 25) * pulse));
    stroke(255, 150, 150, 150); strokeWeight(2);
    circle(0, 0, toScreenSize((player2.size + 15) * pulse));
    pop();
  }
}

// ==================== POISON GAS ====================

function updatePoisonGas() {
  let elapsed = millis() - gameStartTime;
  if (elapsed >= 30000 && !poisonGas.active) {
    poisonGas.active = true; poisonGas.startTime = millis(); poisonGas.lastAdvance = millis();
    poisonGas.topBorder = BASE_CELL; poisonGas.bottomBorder = BASE_CELL;
    poisonGas.leftBorder = BASE_CELL; poisonGas.rightBorder = BASE_CELL;
    screenShake = 10;
  }
  if (poisonGas.active && millis() - poisonGas.lastAdvance >= 5000) {
    poisonGas.topBorder += BASE_CELL; poisonGas.bottomBorder += BASE_CELL;
    poisonGas.leftBorder += BASE_CELL; poisonGas.rightBorder += BASE_CELL;
    poisonGas.lastAdvance = millis(); screenShake = 8;
  }
}

function drawPoisonGas() {
  if (!poisonGas.active) return;
  let pulseAlpha = map(sin(millis() * 0.005), -1, 1, 50, 90);
  let st = toScreenY(poisonGas.topBorder), sb = toScreenY(poisonGas.bottomBorder);
  let sl = toScreenX(poisonGas.leftBorder), sr = toScreenX(poisonGas.rightBorder);
  let sw = toScreenX(BASE_WIDTH), sh = toScreenY(BASE_HEIGHT);

  push();
  drawingContext.shadowBlur = 20; drawingContext.shadowColor = 'rgba(0, 255, 0, 0.3)';
  fill(0, 255, 100, pulseAlpha); noStroke();
  rect(0, 0, sw, st);
  rect(0, sh - sb, sw, sb);
  rect(0, st, sl, sh - st - sb);
  rect(sw - sr, st, sr, sh - st - sb);
  stroke(0, 255, 100, 180); strokeWeight(2); noFill();
  line(0, st, sw, st);
  line(0, sh - sb, sw, sh - sb);
  line(sl, 0, sl, sh);
  line(sw - sr, 0, sw - sr, sh);
  pop();
}

function isInPoison(bx, by) {
  if (!poisonGas.active) return false;
  return by < poisonGas.topBorder || by > BASE_HEIGHT - poisonGas.bottomBorder || bx < poisonGas.leftBorder || bx > BASE_WIDTH - poisonGas.rightBorder;
}

function isNearPoison(bx, by, buffer) {
  if (!poisonGas.active) return false;
  return by < poisonGas.topBorder + buffer || by > BASE_HEIGHT - poisonGas.bottomBorder - buffer || bx < poisonGas.leftBorder + buffer || bx > BASE_WIDTH - poisonGas.rightBorder - buffer;
}

function checkPoisonDamage() {
  if (!poisonGas.active) return;
  let currentTime = millis();
  if (isInPoison(player1.x, player1.y)) {
    if (currentTime - player1.lastPoisonDamage >= 1000) {
      player1.health -= 1500; player1.lastPoisonDamage = currentTime; player1.lastHitTime = currentTime; player1.damageFlash = 255;
    }
  }
  if (isInPoison(player2.x, player2.y)) {
    if (currentTime - player2.lastPoisonDamage >= 1000) {
      player2.health -= 1500; player2.lastPoisonDamage = currentTime; player2.lastHitTime = currentTime; player2.damageFlash = 255;
    }
  }
}

// ==================== HEALING ====================

function updateHealing() {
  let currentTime = millis();
  if (currentTime - player1.lastHitTime > 3000 && currentTime - player1.lastHealTime > 1000 && currentTime - player1.lastAttack > 2000) {
    if (player1.health < player1.maxHealth) { player1.health = min(player1.health + 1000, player1.maxHealth); player1.lastHealTime = currentTime; }
  }
  if (currentTime - player2.lastHitTime > 3000 && currentTime - player2.lastHealTime > 1000 && currentTime - player2.lastAttack > 2000) {
    if (player2.health < player2.maxHealth) { player2.health = min(player2.health + 1000, player2.maxHealth); player2.lastHealTime = currentTime; }
  }
}

// ==================== MAP GENERATION ====================
// Everything in BASE coordinates

function generateMap() {
  walls = [];

  if (isMultiplayer && mapSeed > 0) randomSeed(mapSeed);

  let cols = floor(BASE_WIDTH / BASE_CELL);
  let rows = floor(BASE_HEIGHT / BASE_CELL);

  // Full border - no gaps
  for (let i = 0; i < cols; i++) {
    walls.push({x: i * BASE_CELL, y: 0, w: BASE_CELL, h: BASE_CELL, isBorder: true});
    walls.push({x: i * BASE_CELL, y: (rows - 1) * BASE_CELL, w: BASE_CELL, h: BASE_CELL, isBorder: true});
  }
  for (let i = 1; i < rows - 1; i++) {
    walls.push({x: 0, y: i * BASE_CELL, w: BASE_CELL, h: BASE_CELL, isBorder: true});
    walls.push({x: (cols - 1) * BASE_CELL, y: i * BASE_CELL, w: BASE_CELL, h: BASE_CELL, isBorder: true});
  }

  // Fill right/bottom pixel gaps
  let rightEdge = cols * BASE_CELL;
  if (rightEdge < BASE_WIDTH) {
    for (let i = 0; i < rows; i++) walls.push({x: rightEdge, y: i * BASE_CELL, w: BASE_WIDTH - rightEdge + 5, h: BASE_CELL, isBorder: true});
  }
  let bottomEdge = rows * BASE_CELL;
  if (bottomEdge < BASE_HEIGHT) {
    for (let i = 0; i <= cols; i++) walls.push({x: i * BASE_CELL, y: bottomEdge, w: BASE_CELL, h: BASE_HEIGHT - bottomEdge + 5, isBorder: true});
  }

  // Interior walls — pick from pre-made maps
  let mapIndex;
  if (isMultiplayer && mapSeed > 0) {
    mapIndex = mapSeed % PREMADE_MAPS.length;
  } else {
    mapIndex = floor(random(PREMADE_MAPS.length));
  }
  let selectedMap = PREMADE_MAPS[mapIndex];
  for (let cell of selectedMap) {
    walls.push({x: cell.x * BASE_CELL, y: cell.y * BASE_CELL, w: BASE_CELL, h: BASE_CELL, isBorder: false});
  }

  player1.size = 30;
  player2.size = 30;
  player1.x = BASE_CELL * 2 + BASE_CELL / 2;
  player1.y = BASE_CELL * 2 + BASE_CELL / 2;
  player2.x = BASE_WIDTH - BASE_CELL * 3 + BASE_CELL / 2;
  player2.y = BASE_HEIGHT - BASE_CELL * 3 + BASE_CELL / 2;

  // Speeds in base units
  let speedMap = { square: square_movement_speed, triangle: triangle_movement_speed, circle: circle_movement_speed, oval: oval_movement_speed, pentagon: pentagon_movement_speed, star: star_movement_speed, rhombus: rhombus_movement_speed, octagon: octagon_movement_speed, trapezoid: trapezoid_movement_speed, crescent: crescent_movement_speed, hexagon: hexagon_movement_speed, arrow: arrow_movement_speed };
  if (player1Choice) player1.speed = speedMap[player1Choice] || 5;
  if (player2Choice) player2.speed = speedMap[player2Choice] || 5;

  player1.health = player1.maxHealth; player2.health = player2.maxHealth;
  player1.lastHitTime = millis(); player2.lastHitTime = millis();
  player1.lastHealTime = millis(); player2.lastHealTime = millis();
  player1.lastMoveTime = millis(); player2.lastMoveTime = millis();
  player1.lastPoisonDamage = 0; player2.lastPoisonDamage = 0;
  player1.superCharge = 0; player2.superCharge = 0;
  player1.superActive = false; player2.superActive = false;
  player1.shieldActive = false; player2.shieldActive = false;
  player1.rhombusMode = 1; player2.rhombusMode = 1;
  player1.isDashing = false; player2.isDashing = false;
  player1.rotation = 0; player2.rotation = 0;
  player1.damageFlash = 0; player2.damageFlash = 0;
  player1.scale = 1; player2.scale = 1;
  player1.trail = []; player2.trail = [];

  poisonGas.active = false; poisonGas.startTime = 0;
  poisonGas.topBorder = 0; poisonGas.bottomBorder = 0;
  poisonGas.leftBorder = 0; poisonGas.rightBorder = 0;

  gameStartTime = millis();
  projectiles = []; meleeEffects = []; particles = [];
  drones = []; damageZones = [];
  player1.arrowCharging = false; player1.arrowChargeStart = 0;
  player2.arrowCharging = false; player2.arrowChargeStart = 0;
  screenShake = 0; introProgress = 0;
}

function drawMap() {
  for (let wall of walls) {
    push();
    if (wall.isBorder) { fill(60, 70, 110); stroke(100, 120, 180); }
    else { fill(50, 60, 95); stroke(80, 100, 150); }
    strokeWeight(2);
    rect(toScreenX(wall.x), toScreenY(wall.y), toScreenSize(wall.w), toScreenSize(wall.h), 6);
    pop();
  }
}

function startGame() {
  gameState = 'playing';
  calculateScale();
  generateMap();
  introProgress = 0;
}

// ==================== SELECTION SCREENS ====================

function drawSelectionScreen() {
  background(15, 20, 40);
  if (frameCount % 4 === 0) updateBackgroundParticles();
  drawBackgroundParticles();
  if (frameCount % 3 === 0) updateGridLines();
  drawGridLines();

  if (gameMode === 'single') {
    push(); drawingContext.shadowBlur = 20; drawingContext.shadowColor = 'rgba(100, 200, 255, 0.5)';
    stroke(100, 150, 255, 150); strokeWeight(3); line(width/2, 0, width/2, height); pop();
    drawPlayerSide(1, 0, width/2);
    drawBotSelectionSide(width/2, width);
  } else if (isMultiplayer) {
    drawMultiplayerSelection();
  } else {
    push(); drawingContext.shadowBlur = 20; drawingContext.shadowColor = 'rgba(100, 200, 255, 0.5)';
    stroke(100, 150, 255, 150); strokeWeight(3); line(width/2, 0, width/2, height); pop();
    drawPlayerSide(1, 0, width/2);
    drawPlayerSide(2, width/2, width);
  }

  let alpha = map(sin(millis() * 0.006), -1, 1, 180, 255);
  fill(255, 255, 255, alpha); textSize(14);
  if (gameMode === 'single') text("✨ Choose your character and the bot's character • Click to select ✨", width/2, height * 0.97);
  else if (isMultiplayer) text("✨ Choose your character ✨", width/2, height * 0.97);
  else text("✨ Player 1 and Player 2: Choose your characters • Click to select ✨", width/2, height * 0.97);
  menuAnimationOffset = (menuAnimationOffset + 0.5) % height;
}

function drawMultiplayerSelection() {
  push(); drawingContext.shadowBlur = 30; drawingContext.shadowColor = 'rgba(100, 200, 255, 0.6)';
  fill(100, 200, 255); textSize(48); textStyle(BOLD);
  text("CHOOSE YOUR CHARACTER", width/2, height * 0.08); pop(); textStyle(NORMAL);

  let cols = 3, gridStartX = width/2 - (width * 0.35), gridWidth = width * 0.7;
  let cellWidth = gridWidth / cols, cellHeight = height * 0.18, gridStartY = height * 0.15;
  let gridVisibleHeight = height * 0.68;
  let myChoice = myPlayerNumber === 1 ? player1Choice : player2Choice;
  let totalRows = ceil(shapes.length / cols);
  let totalGridHeight = totalRows * cellHeight;
  let maxScroll = max(0, totalGridHeight - gridVisibleHeight);
  selectionScrollY = constrain(selectionScrollY, 0, maxScroll);

  // Clip region
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(gridStartX - 50, gridStartY - 50, gridWidth + 100, gridVisibleHeight + 50);
  drawingContext.clip();

  for (let i = 0; i < shapes.length; i++) {
    let col = i % cols, row = floor(i / cols);
    let shapeX = gridStartX + col * cellWidth + cellWidth / 2;
    let shapeY = gridStartY + row * cellHeight + cellHeight / 2 - selectionScrollY;
    if (shapeY < gridStartY - 60 || shapeY > gridStartY + gridVisibleHeight + 60) continue;
    let isSelected = myChoice === shapes[i];
    let isHovered = dist(mouseX, mouseY, shapeX, shapeY) < 40;

    push();
    if (isSelected) { drawingContext.shadowBlur = 25; drawingContext.shadowColor = 'rgba(100, 200, 255, 0.8)'; fill(100, 200, 255, 180); stroke(100, 200, 255); strokeWeight(5); }
    else if (isHovered) { drawingContext.shadowBlur = 18; drawingContext.shadowColor = 'rgba(255, 255, 255, 0.6)'; fill(255, 255, 255, 200); stroke(200, 220, 255); strokeWeight(4); }
    else { fill(60, 70, 100, 200); stroke(100, 120, 160); strokeWeight(2); }
    rect(shapeX - 40, shapeY - 40, 80, 80, 15); pop();

    fill(240, 245, 255); stroke(60, 70, 90); strokeWeight(2);
    push(); translate(shapeX, shapeY); drawPlayerShape(shapes[i], 32); pop();
    fill(200, 220, 255); noStroke(); textSize(13); textStyle(BOLD);
    text(shapes[i].toUpperCase(), shapeX, shapeY + 55);
  }
  drawingContext.restore();

  // Scroll indicators
  if (selectionScrollY > 0) { fill(255, 255, 255, 150); noStroke(); textSize(20); text("▲ Scroll Up", width/2, gridStartY - 10); }
  if (selectionScrollY < maxScroll) { fill(255, 255, 255, 150); noStroke(); textSize(20); text("▼ Scroll Down", width/2, gridStartY + gridVisibleHeight + 20); }

  fill(150, 200, 255); textSize(18); textStyle(NORMAL);
  if (myChoice) text(`✓ You selected: ${myChoice.toUpperCase()}`, width/2, height * 0.92);
  else { let a = map(sin(millis() * 0.008), -1, 1, 150, 255); fill(255, 255, 255, a); text("Click a character to select", width/2, height * 0.92); }
}

function drawPlayerSide(playerNum, startX, endX) {
  let midX = (startX + endX) / 2;
  let playerColor = playerNum === 1 ? color(100, 180, 255) : color(255, 80, 80);
  push(); drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = playerNum === 1 ? 'rgba(100, 180, 255, 0.5)' : 'rgba(255, 80, 80, 0.5)';
  fill(playerColor); textSize(36); textStyle(BOLD);
  text(gameMode === 'single' && playerNum === 1 ? "Player" : `Player ${playerNum}`, midX, height * 0.08);
  pop(); textStyle(NORMAL);

  let cols = 3, gridStartX = startX + (endX - startX) * 0.15, gridWidth = (endX - startX) * 0.7;
  let cellWidth = gridWidth / cols, cellHeight = height * 0.18, gridStartY = height * 0.15;
  let gridVisibleHeight = height * 0.68;
  let totalRows = ceil(shapes.length / cols);
  let totalGridHeight = totalRows * cellHeight;
  let maxScroll = max(0, totalGridHeight - gridVisibleHeight);
  let scrollY = constrain(selectionScrollY, 0, maxScroll);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(startX, gridStartY - 40, endX - startX, gridVisibleHeight + 40);
  drawingContext.clip();

  for (let i = 0; i < shapes.length; i++) {
    let col = i % cols, row = floor(i / cols);
    let shapeX = gridStartX + col * cellWidth + cellWidth / 2;
    let shapeY = gridStartY + row * cellHeight + cellHeight / 2 - scrollY;
    if (shapeY < gridStartY - 50 || shapeY > gridStartY + gridVisibleHeight + 50) continue;
    let isSelected = (playerNum === 1 && player1Choice === shapes[i]) || (playerNum === 2 && player2Choice === shapes[i]);
    let isHovered = dist(mouseX, mouseY, shapeX, shapeY) < 35 && ((playerNum === 1 && mouseX < width/2) || (playerNum === 2 && mouseX > width/2));

    push();
    if (isSelected) { drawingContext.shadowBlur = 20; drawingContext.shadowColor = playerNum === 1 ? 'rgba(100, 180, 255, 0.6)' : 'rgba(255, 80, 80, 0.6)'; fill(playerNum === 1 ? color(100, 180, 255, 150) : color(255, 80, 80, 150)); stroke(playerNum === 1 ? color(100, 180, 255) : color(255, 80, 80)); strokeWeight(4); }
    else if (isHovered) { drawingContext.shadowBlur = 15; drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)'; fill(255, 255, 255, 180); stroke(200, 220, 255); strokeWeight(3); }
    else { fill(60, 70, 100, 200); stroke(100, 120, 160); strokeWeight(2); }
    rect(shapeX - 35, shapeY - 35, 70, 70, 12); pop();

    fill(240, 245, 255); stroke(60, 70, 90); strokeWeight(2);
    push(); translate(shapeX, shapeY); drawPlayerShape(shapes[i], 28); pop();
    fill(200, 220, 255); noStroke(); textSize(11); textStyle(BOLD);
    text(shapes[i].toUpperCase(), shapeX, shapeY + 45);
  }
  drawingContext.restore();

  if (scrollY > 0) { fill(255, 255, 255, 120); noStroke(); textSize(16); text("▲", midX, gridStartY - 15); }
  if (scrollY < maxScroll) { fill(255, 255, 255, 120); noStroke(); textSize(16); text("▼", midX, gridStartY + gridVisibleHeight + 15); }
}

function drawBotSelectionSide(startX, endX) {
  let midX = (startX + endX) / 2;
  push(); drawingContext.shadowBlur = 20; drawingContext.shadowColor = 'rgba(255, 80, 80, 0.5)';
  fill(255, 80, 80); textSize(36); textStyle(BOLD);
  text("Bot Opponent", midX, height * 0.08); pop(); textStyle(NORMAL);

  let cols = 3, gridStartX = startX + (endX - startX) * 0.15, gridWidth = (endX - startX) * 0.7;
  let cellWidth = gridWidth / cols, cellHeight = height * 0.18, gridStartY = height * 0.15;
  let gridVisibleHeight = height * 0.68;
  let totalRows = ceil(shapes.length / cols);
  let totalGridHeight = totalRows * cellHeight;
  let maxScroll = max(0, totalGridHeight - gridVisibleHeight);
  let scrollY = constrain(selectionScrollY, 0, maxScroll);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(startX, gridStartY - 40, endX - startX, gridVisibleHeight + 40);
  drawingContext.clip();

  for (let i = 0; i < shapes.length; i++) {
    let col = i % cols, row = floor(i / cols);
    let shapeX = gridStartX + col * cellWidth + cellWidth / 2;
    let shapeY = gridStartY + row * cellHeight + cellHeight / 2 - scrollY;
    if (shapeY < gridStartY - 50 || shapeY > gridStartY + gridVisibleHeight + 50) continue;
    let isSelected = selectedBotCharacter === shapes[i];
    let isHovered = dist(mouseX, mouseY, shapeX, shapeY) < 35 && mouseX > width/2;

    push();
    if (isSelected) { drawingContext.shadowBlur = 20; drawingContext.shadowColor = 'rgba(255, 80, 80, 0.6)'; fill(255, 80, 80, 150); stroke(255, 80, 80); strokeWeight(4); }
    else if (isHovered) { drawingContext.shadowBlur = 15; drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)'; fill(255, 255, 255, 180); stroke(255, 200, 200); strokeWeight(3); }
    else { fill(60, 70, 100, 200); stroke(100, 120, 160); strokeWeight(2); }
    rect(shapeX - 35, shapeY - 35, 70, 70, 12); pop();

    fill(240, 245, 255); stroke(60, 70, 90); strokeWeight(2);
    push(); translate(shapeX, shapeY); drawPlayerShape(shapes[i], 28); pop();
    fill(255, 200, 200); noStroke(); textSize(11); textStyle(BOLD);
    text(shapes[i].toUpperCase(), shapeX, shapeY + 45);
  }
  drawingContext.restore();

  if (scrollY > 0) { fill(255, 255, 255, 120); noStroke(); textSize(16); text("▲", midX, gridStartY - 15); }
  if (scrollY < maxScroll) { fill(255, 255, 255, 120); noStroke(); textSize(16); text("▼", midX, gridStartY + gridVisibleHeight + 15); }
}

// ==================== BOT AI ====================

function updateBotAI() {
  let currentTime = millis();
  if (currentTime - botDecisionTimer > botDecisionInterval) { makeBotDecision(); botDecisionTimer = currentTime; }
  if (currentTime - botMovementTimer > 50) { executeBotAction(); botMovementTimer = currentTime; }
  if (currentTime - botAttackTimer > 50) { botSmartAttack(); botAttackTimer = currentTime; }
}

function makeBotDecision() {
  let distToPlayer = dist(player2.x, player2.y, player1.x, player1.y);
  let healthPercent = player2.health / player2.maxHealth;
  let playerHealthPercent = player1.health / player1.maxHealth;

  let playerVelX = player1.x - botLastPlayerPos.x;
  let playerVelY = player1.y - botLastPlayerPos.y;
  botPredictedPlayerPos.x = player1.x + playerVelX * 3;
  botPredictedPlayerPos.y = player1.y + playerVelY * 3;
  botLastPlayerPos.x = player1.x; botLastPlayerPos.y = player1.y;

  let dangerousProjectile = null, minDist = Infinity;
  for (let proj of projectiles) {
    if (proj.owner === 1) {
      let projDist = dist(proj.x, proj.y, player2.x, player2.y);
      let futureX = proj.x + proj.vx * 5, futureY = proj.y + proj.vy * 5;
      let futureDist = dist(futureX, futureY, player2.x, player2.y);
      if ((projDist < 250 || futureDist < 200) && projDist < minDist) { dangerousProjectile = proj; minDist = projDist; }
    }
  }

  if (dangerousProjectile) {
    botAction = 'dodge';
    let projAngle = atan2(dangerousProjectile.vy, dangerousProjectile.vx);
    let dodgeAngle = projAngle + PI/2;
    if (random() > 0.5) dodgeAngle -= PI;
    botDodgeDirection.x = cos(dodgeAngle); botDodgeDirection.y = sin(dodgeAngle);
    botDodgeTimer = millis(); return;
  }

  if (isInPoison(player2.x, player2.y) || isNearPoison(player2.x, player2.y, 80)) { botAction = 'escape-poison'; return; }
  if (playerHealthPercent < 0.3 && healthPercent > 0.3) { botAction = 'chase'; return; }
  if (healthPercent < 0.3) { botAction = 'retreat'; return; }

  let optimalDistance = getOptimalDistance(player2Choice);
  if (distToPlayer < optimalDistance - 100) botAction = 'maintain-distance';
  else if (distToPlayer > optimalDistance + 150) botAction = 'chase';
  else botAction = 'strafe-attack';
}

function getOptimalDistance(choice) {
  if (choice === 'square' || choice === 'star') return 130;
  if (choice === 'rhombus') return player2.rhombusMode === 1 ? 280 : 120;
  if (choice === 'trapezoid') return 160;
  if (choice === 'circle') return 300;
  if (choice === 'crescent') return 250;
  if (choice === 'hexagon') return 300;
  if (choice === 'arrow') return 400;
  return 260;
}

function executeBotAction() {
  if (player2.isDashing) return;
  let currentTime = millis(), speedMult = 1.4;

  if (botAction === 'dodge' && currentTime - botDodgeTimer < 600) { moveBotInDirection(botDodgeDirection.x, botDodgeDirection.y, 2.5); return; }

  if (botAction === 'escape-poison') {
    let safeCenterX = BASE_WIDTH / 2, safeCenterY = BASE_HEIGHT / 2;
    if (poisonGas.active) {
      safeCenterX = poisonGas.leftBorder + (BASE_WIDTH - poisonGas.leftBorder - poisonGas.rightBorder) / 2;
      safeCenterY = poisonGas.topBorder + (BASE_HEIGHT - poisonGas.topBorder - poisonGas.bottomBorder) / 2;
    }
    let angle = atan2(safeCenterY - player2.y, safeCenterX - player2.x);
    moveBotInDirection(cos(angle), sin(angle), 2.5);
  } else if (botAction === 'chase') { moveBotTowards(botPredictedPlayerPos.x, botPredictedPlayerPos.y, 2.0); }
  else if (botAction === 'retreat') { let a = atan2(player2.y - player1.y, player2.x - player1.x); moveBotInDirection(cos(a), sin(a), 1.8); }
  else if (botAction === 'maintain-distance') { let a = atan2(player2.y - player1.y, player2.x - player1.x); moveBotInDirection(cos(a), sin(a), speedMult); }
  else if (botAction === 'strafe-attack') {
    let a = atan2(player1.y - player2.y, player1.x - player2.x);
    let sa = a + (PI/2 * botStrafeDirection);
    if (frameCount % 120 === 0) botStrafeDirection *= -1;
    moveBotInDirection(cos(sa), sin(sa), speedMult);
  }
}

function botSmartAttack() {
  let currentTime = millis();
  let distToPlayer = dist(player2.x, player2.y, player1.x, player1.y);
  let p2Cooldown = (player2Choice === 'triangle' || player2Choice === 'oval') ? 2000 : 1000;

  if (currentTime - player2.lastAttack > p2Cooldown && !player2.isDashing) {
    let shouldAttack = false;
    if (player2Choice === 'square' || player2Choice === 'star') shouldAttack = distToPlayer < 140 && random() < 0.7;
    else if (player2Choice === 'rhombus' && player2.rhombusMode === 2) shouldAttack = distToPlayer < 110 && random() < 0.7;
    else if (player2Choice === 'hexagon') shouldAttack = distToPlayer < 500 && random() < 0.6;
    else if (player2Choice === 'arrow') { player2.arrowChargeStart = millis() - random(500, 1500); shouldAttack = distToPlayer < 600 && random() < 0.6; }
    else shouldAttack = distToPlayer < 450 && random() < 0.7;

    if (shouldAttack) {
      attack(player2, botPredictedPlayerPos, player2Choice, 2, false);
      player2.lastAttack = currentTime; player2.lastMoveTime = currentTime;
    }
  }

  let p2MaxCharge = (player2Choice === 'triangle' || player2Choice === 'oval') ? 10 : 4;
  if (player2.superCharge >= p2MaxCharge && !player2.superActive) {
    let shouldSuper = (distToPlayer < 300) || (player2.health / player2.maxHealth < 0.4);
    if (shouldSuper && random() < 0.8) {
      attack(player2, botPredictedPlayerPos, player2Choice, 2, true);
      player2.superCharge = 0; player2.lastMoveTime = currentTime;
      if (player2Choice === 'triangle' || player2Choice === 'oval') player2.superActive = true;
    }
  }
}

function moveBotTowards(targetX, targetY, speedMultiplier) {
  let angle = atan2(targetY - player2.y, targetX - player2.x);
  moveBotInDirection(cos(angle), sin(angle), speedMultiplier);
}

function moveBotInDirection(dirX, dirY, speedMultiplier) {
  let p2NewX = player2.x + dirX * player2.speed * speedMultiplier;
  let p2NewY = player2.y + dirY * player2.speed * speedMultiplier;

  if (isInPoison(p2NewX, p2NewY) || isNearPoison(p2NewX, p2NewY, 40)) return;

  if (!checkCollision(p2NewX, p2NewY, player2.size)) {
    player2.x = p2NewX; player2.y = p2NewY;
    player2.lastMoveTime = millis(); player2.rotation += 0.08;
  } else {
    // Try alternatives
    let baseAngle = atan2(dirY, dirX);
    let alternatives = [PI/4, -PI/4, PI/3, -PI/3];
    for (let alt of alternatives) {
      let altAngle = baseAngle + alt;
      let ax = player2.x + cos(altAngle) * player2.speed * speedMultiplier;
      let ay = player2.y + sin(altAngle) * player2.speed * speedMultiplier;
      if (!checkCollision(ax, ay, player2.size) && !isInPoison(ax, ay)) {
        player2.x = ax; player2.y = ay;
        player2.lastMoveTime = millis(); player2.rotation += 0.08;
        break;
      }
    }
  }
}

// ==================== BULLET UPDATES ====================

function updateTriangleBullets() {
  if (player1Choice === 'triangle' && player1.triangleBulletCount > 0 && millis() - player1.lastBulletTime > 100) {
    projectiles.push({ x: player1.x, y: player1.y, startX: player1.x, startY: player1.y, vx: cos(player1.triangleTargetAngle) * triangle_bullet_speed, vy: sin(player1.triangleTargetAngle) * triangle_bullet_speed, damage: triangle_damage, owner: 1, color: color(100, 150, 255), size: 12, maxDistance: Infinity, type: 'triangle', destroysWalls: false, rotation: 0, hitId: 0 });
    player1.triangleBulletCount--; player1.lastBulletTime = millis();
  }
  if (player2Choice === 'triangle' && player2.triangleBulletCount > 0 && millis() - player2.lastBulletTime > 100) {
    projectiles.push({ x: player2.x, y: player2.y, startX: player2.x, startY: player2.y, vx: cos(player2.triangleTargetAngle) * triangle_bullet_speed, vy: sin(player2.triangleTargetAngle) * triangle_bullet_speed, damage: triangle_damage, owner: 2, color: color(255, 50, 50), size: 12, maxDistance: Infinity, type: 'triangle', destroysWalls: false, rotation: 0, hitId: 0 });
    player2.triangleBulletCount--; player2.lastBulletTime = millis();
  }
}

function updateOvalBullets() {
  if (player1Choice === 'oval' && player1.ovalBulletCount > 0 && millis() - player1.lastBulletTime > 100) {
    projectiles.push({ x: player1.x, y: player1.y, startX: player1.x, startY: player1.y, vx: cos(player1.ovalTargetAngle) * oval_bullet_speed, vy: sin(player1.ovalTargetAngle) * oval_bullet_speed, damage: oval_damage, owner: 1, color: color(100, 150, 255), size: 10, maxDistance: Infinity, type: 'oval', destroysWalls: false, bounces: 0, maxBounces: 1, rotation: 0, hitId: 0 });
    player1.ovalBulletCount--; player1.lastBulletTime = millis();
  }
  if (player2Choice === 'oval' && player2.ovalBulletCount > 0 && millis() - player2.lastBulletTime > 100) {
    projectiles.push({ x: player2.x, y: player2.y, startX: player2.x, startY: player2.y, vx: cos(player2.ovalTargetAngle) * oval_bullet_speed, vy: sin(player2.ovalTargetAngle) * oval_bullet_speed, damage: oval_damage, owner: 2, color: color(255, 50, 50), size: 10, maxDistance: Infinity, type: 'oval', destroysWalls: false, bounces: 0, maxBounces: 1, rotation: 0, hitId: 0 });
    player2.ovalBulletCount--; player2.lastBulletTime = millis();
  }
}

function updateSuperTriangleBullets() {
  if (player1Choice === 'triangle' && player1.superBulletCount > 0 && millis() - player1.lastSuperBulletTime > 50) {
    projectiles.push({ x: player1.x, y: player1.y, startX: player1.x, startY: player1.y, vx: cos(player1.superTriangleTargetAngle) * triangle_super_bullet_speed, vy: sin(player1.superTriangleTargetAngle) * triangle_super_bullet_speed, damage: triangle_super_damage, owner: 1, color: color(255, 255, 100), size: 30, maxDistance: Infinity, type: 'super-triangle', destroysWalls: true, rotation: 0, hitId: 0 });
    player1.superBulletCount--; player1.lastSuperBulletTime = millis();
    if (player1.superBulletCount <= 0) player1.superActive = false;
  }
  if (player2Choice === 'triangle' && player2.superBulletCount > 0 && millis() - player2.lastSuperBulletTime > 50) {
    projectiles.push({ x: player2.x, y: player2.y, startX: player2.x, startY: player2.y, vx: cos(player2.superTriangleTargetAngle) * triangle_super_bullet_speed, vy: sin(player2.superTriangleTargetAngle) * triangle_super_bullet_speed, damage: triangle_super_damage, owner: 2, color: color(255, 255, 100), size: 30, maxDistance: Infinity, type: 'super-triangle', destroysWalls: true, rotation: 0, hitId: 0 });
    player2.superBulletCount--; player2.lastSuperBulletTime = millis();
    if (player2.superBulletCount <= 0) player2.superActive = false;
  }
}

function updateSuperOvalBullets() {
  if (player1Choice === 'oval' && player1.superBulletCount > 0 && millis() - player1.lastSuperBulletTime > 50) {
    projectiles.push({ x: player1.x, y: player1.y, startX: player1.x, startY: player1.y, vx: cos(player1.superOvalTargetAngle) * oval_bullet_speed, vy: sin(player1.superOvalTargetAngle) * oval_bullet_speed, damage: oval_super_damage, owner: 1, color: color(255, 255, 100), size: 15, maxDistance: Infinity, type: 'super-oval', destroysWalls: false, bounces: 0, maxBounces: 5, rotation: 0, hitId: 0 });
player1.superBulletCount--; player1.lastSuperBulletTime = millis();
if (player1.superBulletCount <= 0) player1.superActive = false;
}
if (player2Choice === 'oval' && player2.superBulletCount > 0 && millis() - player2.lastSuperBulletTime > 50) {
projectiles.push({ x: player2.x, y: player2.y, startX: player2.x, startY: player2.y, vx: cos(player2.superOvalTargetAngle) * oval_bullet_speed, vy: sin(player2.superOvalTargetAngle) * oval_bullet_speed, damage: oval_super_damage, owner: 2, color: color(255, 255, 100), size: 15, maxDistance: Infinity, type: 'super-oval', destroysWalls: false, bounces: 0, maxBounces: 5, rotation: 0, hitId: 0 });
player2.superBulletCount--; player2.lastSuperBulletTime = millis();
if (player2.superBulletCount <= 0) player2.superActive = false;
}
}
// ==================== DASHES ====================
function updateDashes() {
if (player1.isDashing) {
player1.dashProgress += 0.15;
if (player1.dashProgress >= 1) { player1.isDashing = false; player1.dashProgress = 0; }
else {
let newX = lerp(player1.dashStartX, player1.dashTargetX, player1.dashProgress);
let newY = lerp(player1.dashStartY, player1.dashTargetY, player1.dashProgress);
if (!checkCollision(newX, newY, player1.size)) {
player1.x = newX; player1.y = newY;
if (dist(player1.x, player1.y, player2.x, player2.y) < (player1.size + player2.size) / 2) {
dealDamage(player2, trapezoid_damage, player1); player1.isDashing = false; screenShake = 10;
}
} else player1.isDashing = false;
}
}
if (player2.isDashing) {
player2.dashProgress += 0.15;
if (player2.dashProgress >= 1) { player2.isDashing = false; player2.dashProgress = 0; }
else {
let newX = lerp(player2.dashStartX, player2.dashTargetX, player2.dashProgress);
let newY = lerp(player2.dashStartY, player2.dashTargetY, player2.dashProgress);
if (!checkCollision(newX, newY, player2.size)) {
player2.x = newX; player2.y = newY;
if (dist(player2.x, player2.y, player1.x, player1.y) < (player2.size + player1.size) / 2) {
dealDamage(player1, trapezoid_damage, player2); player2.isDashing = false; screenShake = 10;
}
} else player2.isDashing = false;
}
}
}
// ==================== ATTACK ====================
function attack(attacker, target, shape, playerNum, isSuper) {
let attackColor = playerNum === 1 ? color(100, 150, 255) : color(255, 50, 50);
let opponent = playerNum === 1 ? player2 : player1;
if (isSuper) {
attackColor = color(255, 255, 100); screenShake = 8;
addParticleBurst(attacker.x, attacker.y, 12, attackColor);
}
if (shape === 'square') {
let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
if (isSuper) {
let superRange = attacker.size * 10;
meleeEffects.push({x: attacker.x, y: attacker.y, angle: angle, color: attackColor, life: 30, maxLife: 30, size: superRange});
if (distance < superRange) { dealDamage(opponent, square_super_damage, attacker); screenShake = 12; }
// Break all walls in path
for (let d = 0; d < superRange; d += BASE_CELL) {
let cx = attacker.x + cos(angle) * d, cy = attacker.y + sin(angle) * d;
for (let spread = -superRange * 0.3; spread <= superRange * 0.3; spread += BASE_CELL / 2) {
let pa = angle + PI / 2;
let wx = cx + cos(pa) * spread, wy = cy + sin(pa) * spread;
for (let w = walls.length - 1; w >= 0; w--) {
let wall = walls[w];
if (!wall.isBorder && wx > wall.x && wx < wall.x + wall.w && wy > wall.y && wy < wall.y + wall.h) walls.splice(w, 1);
}
}
}
} else {
meleeEffects.push({x: attacker.x, y: attacker.y, angle: angle, color: attackColor, life: 20, maxLife: 20, size: 150});
if (distance < 150) { dealDamage(opponent, square_damage, attacker); screenShake = 6; }
}
} else if (shape === 'triangle') {
if (isSuper) { attacker.superTriangleTargetAngle = atan2(target.y - attacker.y, target.x - attacker.x); attacker.superBulletCount = 20; attacker.lastSuperBulletTime = millis(); }
else { attacker.triangleTargetAngle = atan2(target.y - attacker.y, target.x - attacker.x); attacker.triangleBulletCount = 10; attacker.lastBulletTime = millis(); }
} else if (shape === 'circle') {
let angle = atan2(target.y - attacker.y, target.x - attacker.x);
if (isSuper) {
projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * circle_super_bullet_speed, vy: sin(angle) * circle_super_bullet_speed, damage: circle_super_damage, owner: playerNum, color: attackColor, size: attacker.size * 3, maxDistance: 700, type: 'super-circle', destroysWalls: true, rotation: 0, hitId: 0 });
} else {
projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * circle_bullet_speed, vy: sin(angle) * circle_bullet_speed, damage: circle_damage, owner: playerNum, color: attackColor, size: 20, maxDistance: 600, type: 'circle', destroysWalls: false, rotation: 0, hitId: 0 });
}
} else if (shape === 'oval') {
if (isSuper) { attacker.superOvalTargetAngle = atan2(target.y - attacker.y, target.x - attacker.x); attacker.superBulletCount = 10; attacker.lastSuperBulletTime = millis(); }
else { attacker.ovalTargetAngle = atan2(target.y - attacker.y, target.x - attacker.x); attacker.ovalBulletCount = 10; attacker.lastBulletTime = millis(); }
} else if (shape === 'pentagon') {
let angle = atan2(target.y - attacker.y, target.x - attacker.x);
if (isSuper) {
projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * pentagon_bullet_speed, vy: sin(angle) * pentagon_bullet_speed, damage: pentagon_super_damage, owner: playerNum, color: attackColor, size: attacker.size * 3, maxDistance: Infinity, type: 'super-pentagon', destroysWalls: false, goesThrough: true, rotation: 0, hitId: 0 });
} else {
projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * pentagon_bullet_speed, vy: sin(angle) * pentagon_bullet_speed, damage: pentagon_damage, owner: playerNum, color: attackColor, size: 20, maxDistance: Infinity, type: 'pentagon', destroysWalls: false, rotation: 0, hitId: 0 });
}
} else if (shape === 'star') {
if (isSuper) { attacker.shieldActive = true; attacker.shieldStartTime = millis(); }
else {
let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
meleeEffects.push({x: attacker.x, y: attacker.y, angle: angle, color: attackColor, life: 20, maxLife: 20, size: 150});
if (distance < 150) { dealDamage(opponent, star_damage, attacker); screenShake = 6; }
}
} else if (shape === 'rhombus') {
if (isSuper) {
attacker.rhombusMode = attacker.rhombusMode === 1 ? 2 : 1;
let circularRange = 250;
meleeEffects.push({ x: attacker.x, y: attacker.y, angle: 0, color: attackColor, life: 40, maxLife: 40, size: circularRange * 2, isCircular: true });
let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
if (distance < circularRange) { dealDamage(opponent, rhombus_super_damage, attacker); screenShake = 12; }
for (let w = walls.length - 1; w >= 0; w--) {
let wall = walls[w];
if (!wall.isBorder && dist(attacker.x, attacker.y, wall.x + wall.w/2, wall.y + wall.h/2) < circularRange) walls.splice(w, 1);
}
} else {
if (attacker.rhombusMode === 1) {
let angle = atan2(target.y - attacker.y, target.x - attacker.x);
projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * rhombus_bullet_speed, vy: sin(angle) * rhombus_bullet_speed, damage: rhombus_damage, owner: playerNum, color: attackColor, size: 15, maxDistance: Infinity, type: 'rhombus-long', destroysWalls: false, rotation: 0, hitId: 0 });
} else {
meleeEffects.push({ x: attacker.x, y: attacker.y, angle: 0, color: attackColor, life: 20, maxLife: 20, size: rhombus_melee_range * 2, isCircular: true });
let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
if (distance < rhombus_melee_range) { dealDamage(opponent, rhombus_damage + rhombus_circular_extra_damage, attacker); screenShake = 8; }
}
}
} else if (shape === 'octagon') {
if (isSuper) {
let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
meleeEffects.push({x: attacker.x, y: attacker.y, angle: angle, color: attackColor, life: 30, maxLife: 30, size: 300, width: 80});
projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * 15, vy: sin(angle) * 15, damage: octagon_super_damage, owner: playerNum, color: attackColor, size: 40, maxDistance: Infinity, type: 'octagon-super-pull', destroysWalls: true, pullTarget: opponent, pullStrength: octagon_super_pull_strength, rotation: 0, hitId: 0 });
} else {
let angle = atan2(target.y - attacker.y, target.x - attacker.x);
projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * octagon_bullet_speed, vy: sin(angle) * octagon_bullet_speed, damage: octagon_damage, owner: playerNum, color: attackColor, size: 20, maxDistance: Infinity, type: 'octagon-split', destroysWalls: false, hasSplit: false, rotation: 0, hitId: 0 });
}
} else if (shape === 'trapezoid') {
if (isSuper) {
let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
meleeEffects.push({x: attacker.x, y: attacker.y, angle: angle, color: attackColor, life: 30, maxLife: 30, size: attacker.size * 10, width: 80});
let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
if (distance < attacker.size * 10) { dealDamage(opponent, trapezoid_super_damage, attacker); screenShake = 10; }
} else {
let angle = atan2(target.y - attacker.y, target.x - attacker.x);
attacker.isDashing = true;
attacker.dashStartX = attacker.x; attacker.dashStartY = attacker.y;
attacker.dashTargetX = attacker.x + cos(angle) * trapezoid_dash_distance;
attacker.dashTargetY = attacker.y + sin(angle) * trapezoid_dash_distance;
attacker.dashProgress = 0;
meleeEffects.push({x: attacker.x, y: attacker.y, angle: angle, color: attackColor, life: 15, maxLife: 15, size: 80, isDash: true});
}
} else if (shape === 'crescent') {
if (isSuper) {
  let angle = atan2(target.y - attacker.y, target.x - attacker.x);
  let baseDist = min(dist(attacker.x, attacker.y, target.x, target.y), 300);
  for (let z = 0; z < 3; z++) {
    let offsetAngle = angle + (z - 1) * 0.5;
    let zx = attacker.x + cos(offsetAngle) * baseDist;
    let zy = attacker.y + sin(offsetAngle) * baseDist;
    damageZones.push({ x: zx, y: zy, radius: 80, damage: crescent_zone_damage, owner: playerNum, color: attackColor, spawnTime: millis(), duration: crescent_zone_duration, lastTick: 0 });
  }
  screenShake = 8;
} else {
  let angle = atan2(target.y - attacker.y, target.x - attacker.x);
  projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * crescent_bullet_speed, vy: sin(angle) * crescent_bullet_speed, damage: crescent_damage, owner: playerNum, color: attackColor, size: 18, maxDistance: 500, type: 'crescent', destroysWalls: false, rotation: 0, hitId: 0, crescentTime: 0, crescentAngle: angle });
}
} else if (shape === 'hexagon') {
if (isSuper) {
  for (let d = 0; d < 6; d++) {
    let angle = (TWO_PI / 6) * d;
    let spawnX = attacker.x + cos(angle) * 40;
    let spawnY = attacker.y + sin(angle) * 40;
    drones.push({ x: spawnX, y: spawnY, owner: playerNum, speed: hexagon_drone_speed, spawnTime: millis(), duration: hexagon_drone_duration, damage: hexagon_super_damage, color: attackColor, size: 12, rotation: 0 });
  }
  screenShake = 6;
} else {
  if (drones.filter(d => d.owner === playerNum).length < hexagon_max_drones) {
    drones.push({ x: attacker.x, y: attacker.y, owner: playerNum, speed: hexagon_drone_speed, spawnTime: millis(), duration: hexagon_drone_duration, damage: hexagon_damage, color: attackColor, size: 12, rotation: 0 });
  }
}
} else if (shape === 'arrow') {
if (isSuper) {
  let angle = atan2(target.y - attacker.y, target.x - attacker.x);
  let beamRange = 800;
  meleeEffects.push({ x: attacker.x, y: attacker.y, angle: angle, color: attackColor, life: 30, maxLife: 30, size: beamRange, width: arrow_beam_width, isBeam: true });
  let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
  if (distance < beamRange) {
    let perpDist = abs(sin(angle - atan2(opponent.y - attacker.y, opponent.x - attacker.x)) * distance);
    if (perpDist < arrow_beam_width) { dealDamage(opponent, arrow_super_damage, attacker); screenShake = 12; }
  }
  // Destroy walls in beam path
  for (let d = 0; d < beamRange; d += BASE_CELL) {
    let cx = attacker.x + cos(angle) * d, cy = attacker.y + sin(angle) * d;
    for (let w = walls.length - 1; w >= 0; w--) {
      let wall = walls[w];
      if (!wall.isBorder && cx > wall.x && cx < wall.x + wall.w && cy > wall.y && cy < wall.y + wall.h) walls.splice(w, 1);
    }
  }
} else {
  // Charge-based: instant fire with damage scaled by how long mouse was held
  let chargeTime = constrain(millis() - attacker.arrowChargeStart, 0, arrow_max_charge_time);
  let chargeMult = map(chargeTime, 0, arrow_max_charge_time, 0.3, 1.0);
  let angle = atan2(target.y - attacker.y, target.x - attacker.x);
  let speed = arrow_bullet_speed * map(chargeMult, 0.3, 1.0, 0.7, 1.0);
  projectiles.push({ x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y, vx: cos(angle) * speed, vy: sin(angle) * speed, damage: floor(arrow_damage * chargeMult), owner: playerNum, color: attackColor, size: 14 + chargeMult * 10, maxDistance: Infinity, type: 'arrow', destroysWalls: false, rotation: 0, hitId: 0 });
  attacker.arrowCharging = false; attacker.arrowChargeStart = 0;
}
}
}
// ==================== DRONES & DAMAGE ZONES ====================
function updateDrones() {
  for (let i = drones.length - 1; i >= 0; i--) {
    let drone = drones[i];
    if (millis() - drone.spawnTime > drone.duration) { drones.splice(i, 1); continue; }
    let target = drone.owner === 1 ? player2 : player1;
    let angle = atan2(target.y - drone.y, target.x - drone.x);
    let newX = drone.x + cos(angle) * drone.speed;
    let newY = drone.y + sin(angle) * drone.speed;
    if (!checkCollision(newX, newY, drone.size)) { drone.x = newX; drone.y = newY; }
    else { addParticleBurst(drone.x, drone.y, 6, drone.color); drones.splice(i, 1); continue; }
    drone.rotation += 0.1;
    if (dist(drone.x, drone.y, target.x, target.y) < (drone.size + target.size) / 2 + 10) {
      let attacker = drone.owner === 1 ? player1 : player2;
      if (!isMultiplayer) dealDamage(target, drone.damage, attacker);
      else {
        target.health -= drone.damage; target.damageFlash = 255; target.lastHitTime = millis();
        if (myPlayerNumber === drone.owner) sendDamage(drone.damage, drone.owner === 1 ? 2 : 1);
      }
      addParticleBurst(drone.x, drone.y, 8, drone.color);
      drones.splice(i, 1); screenShake = 4;
    }
  }
}
function drawDrones() {
  for (let drone of drones) {
    push();
    translate(toScreenX(drone.x), toScreenY(drone.y));
    rotate(drone.rotation);
    fill(drone.color); stroke(255, 255, 255, 180); strokeWeight(2);
    beginShape();
    for (let j = 0; j < 6; j++) { let a = (TWO_PI/6)*j; vertex(cos(a)*toScreenSize(drone.size/2), sin(a)*toScreenSize(drone.size/2)); }
    endShape(CLOSE);
    pop();
  }
}
function updateDamageZones() {
  let currentTime = millis();
  for (let i = damageZones.length - 1; i >= 0; i--) {
    let zone = damageZones[i];
    if (currentTime - zone.spawnTime > zone.duration) { damageZones.splice(i, 1); continue; }
    if (currentTime - zone.lastTick >= 500) {
      zone.lastTick = currentTime;
      let target1 = zone.owner === 1 ? player2 : player1;
      let target2 = zone.owner === 1 ? player1 : player2;
      let attacker = zone.owner === 1 ? player1 : player2;
      if (dist(zone.x, zone.y, target1.x, target1.y) < zone.radius + target1.size / 2) {
        if (!isMultiplayer) dealDamage(target1, zone.damage, attacker);
        else {
          target1.health -= zone.damage; target1.damageFlash = 255; target1.lastHitTime = millis();
          if (myPlayerNumber === zone.owner) sendDamage(zone.damage, zone.owner === 1 ? 2 : 1);
        }
      }
    }
  }
}
function drawDamageZones() {
  for (let zone of damageZones) {
    let lifeRatio = 1 - (millis() - zone.spawnTime) / zone.duration;
    let pulse = map(sin(millis() * 0.01), -1, 1, 0.7, 1.0);
    push();
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = zone.owner === 1 ? 'rgba(100, 200, 255, 0.4)' : 'rgba(255, 100, 100, 0.4)';
    fill(red(zone.color), green(zone.color), blue(zone.color), 60 * lifeRatio * pulse);
    stroke(red(zone.color), green(zone.color), blue(zone.color), 150 * lifeRatio);
    strokeWeight(3);
    circle(toScreenX(zone.x), toScreenY(zone.y), toScreenSize(zone.radius * 2 * pulse));
    pop();
  }
}
// ==================== MELEE EFFECTS ====================
function updateMeleeEffects() {
for (let i = meleeEffects.length - 1; i >= 0; i--) { meleeEffects[i].life--; if (meleeEffects[i].life <= 0) meleeEffects.splice(i, 1); }
}
function drawMeleeEffects() {
for (let effect of meleeEffects) {
let alpha = map(effect.life, 0, effect.maxLife, 0, 200);
let size = toScreenSize(effect.size || 150);
push();
translate(toScreenX(effect.x), toScreenY(effect.y));

if (effect.isCircular) {
  noFill(); stroke(red(effect.color), green(effect.color), blue(effect.color), alpha); strokeWeight(8);
  circle(0, 0, size);
  stroke(red(effect.color), green(effect.color), blue(effect.color), alpha * 0.5); strokeWeight(4);
  circle(0, 0, size * 0.6);
} else if (effect.isBeam) {
  rotate(effect.angle);
  stroke(red(effect.color), green(effect.color), blue(effect.color), alpha); strokeWeight(toScreenSize(effect.width)); noFill();
  line(0, 0, size, 0);
  stroke(255, 255, 255, alpha * 0.5); strokeWeight(toScreenSize(effect.width * 0.4));
  line(0, 0, size, 0);
} else if (effect.width) {
  rotate(effect.angle); noFill();
  stroke(red(effect.color), green(effect.color), blue(effect.color), alpha); strokeWeight(toScreenSize(effect.width));
  line(0, 0, size, 0);
} else if (effect.isDash) {
  rotate(effect.angle); noFill();
  stroke(red(effect.color), green(effect.color), blue(effect.color), alpha); strokeWeight(10);
  line(0, 0, size, 0);
} else {
  rotate(effect.angle); noFill();
  stroke(red(effect.color), green(effect.color), blue(effect.color), alpha); strokeWeight(8);
  arc(0, 0, size, size, -PI/4, PI/4);
}
pop();
}
}
// ==================== PROJECTILES ====================
function updateProjectiles() {
for (let i = projectiles.length - 1; i >= 0; i--) {
let proj = projectiles[i];
// Store previous position for sweep collision
let prevX = proj.x;
let prevY = proj.y;
proj.x += proj.vx;
proj.y += proj.vy;
proj.rotation += 0.12;

// Crescent boomerang arc
if (proj.type === 'crescent') {
  proj.crescentTime += 0.08;
  let perpAngle = proj.crescentAngle + PI/2;
  proj.x += cos(perpAngle) * sin(proj.crescentTime) * 3;
  proj.y += sin(perpAngle) * sin(proj.crescentTime) * 3;
  if (proj.crescentTime > PI) {
    proj.vx *= -1; proj.vy *= -1; proj.crescentTime = 0;
  }
}

// Octagon split
if (proj.type === 'octagon-split' && !proj.hasSplit) {
  let distTraveled = dist(proj.x, proj.y, proj.startX, proj.startY);
  if (distTraveled >= octagon_split_distance) {
    proj.hasSplit = true;
    for (let j = 0; j < 10; j++) {
      let angle = (TWO_PI / 10) * j;
      projectiles.push({ x: proj.x, y: proj.y, startX: proj.x, startY: proj.y, vx: cos(angle) * 10, vy: sin(angle) * 10, damage: octagon_split_damage, owner: proj.owner, color: proj.color, size: 8, maxDistance: 300, type: 'octagon-small', destroysWalls: false, rotation: angle, hitId: 0 });
    }
    projectiles.splice(i, 1); screenShake = 5; continue;
  }
}

// Octagon super pull
if (proj.type === 'octagon-super-pull' && proj.pullTarget) {
  let attackerX = proj.startX, attackerY = proj.startY;
  let pullAngle = atan2(attackerY - proj.pullTarget.y, attackerX - proj.pullTarget.x);
  let distToAttacker = dist(proj.pullTarget.x, proj.pullTarget.y, attackerX, attackerY);

  if (distToAttacker > proj.pullTarget.size * 2) {
    let newX = proj.pullTarget.x + cos(pullAngle) * proj.pullStrength;
    let newY = proj.pullTarget.y + sin(pullAngle) * proj.pullStrength;
    for (let w = walls.length - 1; w >= 0; w--) {
      let wall = walls[w];
      if (!wall.isBorder && dist(proj.pullTarget.x, proj.pullTarget.y, wall.x + wall.w/2, wall.y + wall.h/2) < 80) walls.splice(w, 1);
    }
    if (!checkCollision(newX, newY, proj.pullTarget.size)) { proj.pullTarget.x = newX; proj.pullTarget.y = newY; }
  } else {
    if (proj.hitId === 0) {
      dealDamage(proj.pullTarget, proj.damage, proj.owner === 1 ? player1 : player2);
      proj.hitId = 1;
    }
    projectiles.splice(i, 1); screenShake = 15; continue;
  }

  if (dist(proj.x, proj.y, proj.pullTarget.x, proj.pullTarget.y) < proj.size + proj.pullTarget.size + 10) {
    if (proj.hitId === 0) {
      dealDamage(proj.pullTarget, proj.damage, proj.owner === 1 ? player1 : player2);
      proj.hitId = 1;
    }
    projectiles.splice(i, 1); screenShake = 12; continue;
  }
}

// Max distance check
if (proj.maxDistance && proj.maxDistance !== Infinity) {
  let distTraveled = dist(proj.x, proj.y, proj.startX, proj.startY);
  if (distTraveled > proj.maxDistance) {
    if (proj.type === 'circle' || proj.type === 'super-circle') createExplosion(proj.x, proj.y, proj.owner, proj.color);
    projectiles.splice(i, 1); continue;
  }
}

// Wall collision with sweep check
let wallHit = sweepCheckWall(prevX, prevY, proj.x, proj.y, proj.size);
if (wallHit && !proj.goesThrough) {
  if ((proj.type === 'oval' || proj.type === 'super-oval') && proj.bounces < proj.maxBounces) {
    bounceProjectile(proj, wallHit); proj.bounces++; screenShake = 3; continue;
  }
  if (proj.destroysWalls && !wallHit.isBorder) destroyWall(wallHit);
  if (proj.type === 'circle' || proj.type === 'super-circle') createExplosion(proj.x, proj.y, proj.owner, proj.color);
  if (!proj.destroysWalls || wallHit.isBorder) { projectiles.splice(i, 1); continue; }
}

// Shield collision
let shieldHit = checkShieldCollision(proj);
if (shieldHit) {
  proj.vx *= -1; proj.vy *= -1; proj.damage *= 2;
  proj.owner = shieldHit.owner; proj.color = shieldHit.color;
  proj.hitId = 0; // reset so reflected can hit
  screenShake = 5; continue;
}

// Player collision - using hitId to prevent double damage
// hitId: 0 = hasn't hit anyone, 1 = hit player1, 2 = hit player2
if (proj.owner === 1) {
  if (proj.hitId !== 2 && dist(proj.x, proj.y, player2.x, player2.y) < (proj.size + player2.size) / 2) {
    proj.hitId = 2;
    if (!isMultiplayer) dealDamage(player2, proj.damage, player1);
    else {
      player2.health -= proj.damage; player2.damageFlash = 255; player2.lastHitTime = millis();
      if (myPlayerNumber === 1) {
        let maxCharge = (player1Choice === 'triangle' || player1Choice === 'oval') ? 10 : 4;
        if (player1.superCharge < maxCharge) player1.superCharge++;
        sendDamage(proj.damage, 2);
      }
    }
    if (proj.type === 'circle' || proj.type === 'super-circle') createExplosion(proj.x, proj.y, proj.owner, proj.color);
    if (!proj.goesThrough) { projectiles.splice(i, 1); screenShake = 6; continue; }
    screenShake = 6;
  }
} else {
  if (proj.hitId !== 1 && dist(proj.x, proj.y, player1.x, player1.y) < (proj.size + player1.size) / 2) {
    proj.hitId = 1;
    if (!isMultiplayer) dealDamage(player1, proj.damage, player2);
    else {
      player1.health -= proj.damage; player1.damageFlash = 255; player1.lastHitTime = millis();
      if (myPlayerNumber === 2) {
        let maxCharge = (player2Choice === 'triangle' || player2Choice === 'oval') ? 10 : 4;
        if (player2.superCharge < maxCharge) player2.superCharge++;
        sendDamage(proj.damage, 1);
      }
    }
    if (proj.type === 'circle' || proj.type === 'super-circle') createExplosion(proj.x, proj.y, proj.owner, proj.color);
    if (!proj.goesThrough) { projectiles.splice(i, 1); screenShake = 6; continue; }
    screenShake = 6;
  }
}

// Out of bounds
if (proj.x < -50 || proj.x > BASE_WIDTH + 50 || proj.y < -50 || proj.y > BASE_HEIGHT + 50) {
  if (proj.type === 'circle' || proj.type === 'super-circle') createExplosion(proj.x, proj.y, proj.owner, proj.color);
  projectiles.splice(i, 1);
}
}
}
// Sweep check: test multiple points along the projectile's path
function sweepCheckWall(x1, y1, x2, y2, size) {
// Check destination first
let hit = checkWallCollision(x2, y2, size);
if (hit) return hit;
// Check intermediate steps for fast projectiles
let dx = x2 - x1, dy = y2 - y1;
let speed = sqrt(dx * dx + dy * dy);
if (speed > BASE_CELL * 0.4) {
let steps = ceil(speed / (BASE_CELL * 0.3));
for (let s = 1; s < steps; s++) {
let t = s / steps;
let cx = x1 + dx * t, cy = y1 + dy * t;
hit = checkWallCollision(cx, cy, size);
if (hit) return hit;
}
}
return null;
}
function drawProjectiles() {
for (let proj of projectiles) {
push();
fill(proj.color); stroke(255, 255, 255, 180); strokeWeight(2);
push();
translate(toScreenX(proj.x), toScreenY(proj.y));
if (proj.type === 'oval' || proj.type === 'super-oval') {
let angle = atan2(proj.vy, proj.vx); rotate(angle);
ellipse(0, 0, toScreenSize(proj.size * 1.5), toScreenSize(proj.size));
} else if (proj.type === 'pentagon' || proj.type === 'super-pentagon') {
rotate(proj.rotation);
beginShape();
for (let j = 0; j < 5; j++) { let a = (TWO_PI/5)*j - PI/2; vertex(cos(a)*toScreenSize(proj.size/2), sin(a)*toScreenSize(proj.size/2)); }
endShape(CLOSE);
} else if (proj.type === 'crescent') {
let angle = atan2(proj.vy, proj.vx); rotate(angle);
let s = toScreenSize(proj.size);
arc(0, 0, s, s, -PI*0.75, PI*0.75);
} else if (proj.type === 'arrow') {
let angle = atan2(proj.vy, proj.vx); rotate(angle);
let s = toScreenSize(proj.size/2);
beginShape(); vertex(s, 0); vertex(-s, -s*0.6); vertex(-s*0.3, 0); vertex(-s, s*0.6); endShape(CLOSE);
} else {
circle(0, 0, toScreenSize(proj.size));
}
pop(); pop();
}
}
function createExplosion(x, y, owner, col) {
addParticleBurst(x, y, 15, col);
for (let i = 0; i < 6; i++) {
let angle = (TWO_PI / 6) * i;
projectiles.push({ x: x, y: y, startX: x, startY: y, vx: cos(angle) * 12, vy: sin(angle) * 12, damage: circle_explosion_spike_damage, owner: owner, color: col, size: 10, maxDistance: 200, type: 'spike', destroysWalls: false, rotation: angle, hitId: 0 });
}
screenShake = 10;
}
function destroyWall(wall) {
if (wall.isBorder) return;
let index = walls.indexOf(wall);
if (index > -1) walls.splice(index, 1);
}
function bounceProjectile(proj, wall) {
let wallCenterX = wall.x + wall.w / 2, wallCenterY = wall.y + wall.h / 2;
let dx = proj.x - wallCenterX, dy = proj.y - wallCenterY;
if (abs(dx) > abs(dy)) proj.vx *= -1; else proj.vy *= -1;
proj.x += proj.vx * 3; proj.y += proj.vy * 3;
}
function checkWallCollision(x, y, size) {
let halfSize = size / 2;
for (let wall of walls) {
if (x + halfSize > wall.x && x - halfSize < wall.x + wall.w && y + halfSize > wall.y && y - halfSize < wall.y + wall.h) return wall;
}
return null;
}
function checkCollision(x, y, size) {
return checkWallCollision(x, y, size) !== null;
}
function checkShieldCollision(proj) {
if (player1.shieldActive && proj.owner !== 1 && dist(proj.x, proj.y, player1.x, player1.y) < player1.size + 20) return {owner: 1, color: color(100, 150, 255)};
if (player2.shieldActive && proj.owner !== 2 && dist(proj.x, proj.y, player2.x, player2.y) < player2.size + 20) return {owner: 2, color: color(255, 50, 50)};
return null;
}
// ==================== KEY PRESSED ====================
function keyPressed() {
if (gameState === 'playing' && gameMode === 'two') {
if (keyCode === 67) {
let p1Cooldown = (player1Choice === 'triangle' || player1Choice === 'oval') ? 2000 : 1000;
if (millis() - player1.lastAttack > p1Cooldown && !player1.isDashing) {
attack(player1, {x: player2.x, y: player2.y}, player1Choice, 1, false);
player1.lastAttack = millis(); player1.lastMoveTime = millis();
}
} else if (keyCode === 188) {
let p2Cooldown = (player2Choice === 'triangle' || player2Choice === 'oval') ? 2000 : 1000;
if (millis() - player2.lastAttack > p2Cooldown && !player2.isDashing) {
attack(player2, {x: player1.x, y: player1.y}, player2Choice, 2, false);
player2.lastAttack = millis(); player2.lastMoveTime = millis();
}
}
}
}
function mouseReleased() {
  if (gameState !== 'playing') return;
  let baseMouseX = toBaseX(mouseX), baseMouseY = toBaseY(mouseY);
  if (isMultiplayer) {
    let myPlayer = myPlayerNumber === 1 ? player1 : player2;
    let myChoice = myPlayerNumber === 1 ? player1Choice : player2Choice;
    if (myChoice === 'arrow' && myPlayer.arrowCharging) {
      let cooldown = 1000;
      if (millis() - myPlayer.lastAttack > cooldown && !myPlayer.isDashing) {
        let mouseTarget = { x: baseMouseX, y: baseMouseY };
        attack(myPlayer, mouseTarget, 'arrow', myPlayerNumber, false);
        sendAttack(mouseTarget, false);
        myPlayer.lastAttack = millis(); myPlayer.lastMoveTime = millis();
      }
      myPlayer.arrowCharging = false;
    }
  } else if (gameMode === 'single') {
    if (player1Choice === 'arrow' && player1.arrowCharging) {
      let cooldown = 1000;
      if (millis() - player1.lastAttack > cooldown && !player1.isDashing) {
        let mouseTarget = { x: baseMouseX, y: baseMouseY };
        attack(player1, mouseTarget, 'arrow', 1, false);
        player1.lastAttack = millis(); player1.lastMoveTime = millis();
      }
      player1.arrowCharging = false;
    }
  }
}
function mouseWheel(event) {
  if (gameState === 'selection') {
    selectionScrollY += event.delta;
    let cols = 3, cellHeight = height * 0.18, gridVisibleHeight = height * 0.68;
    let totalRows = ceil(shapes.length / cols);
    let totalGridHeight = totalRows * cellHeight;
    let maxScroll = max(0, totalGridHeight - gridVisibleHeight);
    selectionScrollY = constrain(selectionScrollY, 0, maxScroll);
    return false;
  }
}