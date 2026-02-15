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
let triangle_damage = 1000; // INCREASED from 750
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
let pentagon_damage = 4500; // INCREASED from 3500
let pentagon_super_damage = 7000;
let pentagon_movement_speed = 5;
let pentagon_bullet_speed = 17;
let star_damage = 2500;
let star_movement_speed = 5;
let star_shield_duration = 5000;
let rhombus_damage = 3000;
let rhombus_circular_extra_damage = 1000; // NEW
let rhombus_super_damage = 2000; // NEW - beam damage
let rhombus_movement_speed = 5;
let rhombus_bullet_speed = 17;
let rhombus_melee_range = 100;
let octagon_damage = 3000;
let octagon_split_damage = 500;
let octagon_super_damage = 3000;
let octagon_movement_speed = 5;
let octagon_bullet_speed = 12;
let octagon_split_distance = 500;
let octagon_super_pull_strength = 25; // INCREASED for full pull
let trapezoid_damage = 3000; // CHANGED from 3000
let trapezoid_super_damage = 3000;
let trapezoid_movement_speed = 5; // REDUCED from 7
let trapezoid_dash_distance = 200;

const MAX_PARTICLES = 60;

let backgroundParticles = [];
let menuAnimationOffset = 0;
let transitionAlpha = 0;
let glowPulse = 0;
let gridLines = [];

let gameMode = null;
let player1Choice = null;
let player2Choice = null;
let selectedBotCharacter = null;
let shapes = ['square', 'triangle', 'circle', 'oval', 'pentagon', 'star', 'rhombus', 'octagon', 'trapezoid'];
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

// NEW: For synced map generation
let mapSeed = 0;

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
  dashProgress: 0, rotation: 0, damageFlash: 0, scale: 1, trail: []
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
  dashProgress: 0, rotation: 0, damageFlash: 0, scale: 1, trail: []
};

let poisonGas = {
  active: false, startTime: 0, topBorder: 0, bottomBorder: 0,
  leftBorder: 0, rightBorder: 0, lastAdvance: 0
};

let projectiles = [];
let meleeEffects = [];
let particles = [];
let screenShake = 0;
let walls = [];
let cellSize = 40;
let gameStartTime = 0;
let introProgress = 0;

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
    mapSeed = seed; // NEW: Receive map seed
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
    const target = playerNum === 1 ? player2 : player1;
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
      x: myPlayer.x,
      y: myPlayer.y,
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
    attackData: {
      target: target,
      isSuper: isSuper
    }
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
  generateMap();
  initBackgroundParticles();
  initGridLines();
  
  initializeMultiplayer();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (gameState === 'playing') {
    generateMap();
  }
  initGridLines();
}

function drawModeSelection() {
  background(15, 20, 40);
  
  if (frameCount % 4 === 0) {
    updateBackgroundParticles();
  }
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
  
  let singleHovered = mouseX > singlePlayerX - buttonW/2 && mouseX < singlePlayerX + buttonW/2 &&
                       mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;
  let twoHovered = mouseX > twoPlayerX - buttonW/2 && mouseX < twoPlayerX + buttonW/2 &&
                   mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;
  let onlineHovered = mouseX > onlinePlayerX - buttonW/2 && mouseX < onlinePlayerX + buttonW/2 &&
                      mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;
  
  push();
  if (singleHovered) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(100, 200, 255, 0.8)';
  }
  fill(singleHovered ? color(100, 180, 255, 220) : color(100, 150, 255, 150));
  stroke(100, 200, 255);
  strokeWeight(3);
  rect(singlePlayerX - buttonW/2, buttonY - buttonH/2, buttonW, buttonH, 15);
  pop();
  
  fill(255);
  noStroke();
  textSize(28);
  text("1 PLAYER", singlePlayerX, buttonY - 10);
  textSize(14);
  fill(200, 220, 255);
  text("VS BOT", singlePlayerX, buttonY + 20);
  
  push();
  if (twoHovered) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(255, 150, 150, 0.8)';
  }
  fill(twoHovered ? color(255, 120, 120, 220) : color(255, 100, 100, 150));
  stroke(255, 150, 150);
  strokeWeight(3);
  rect(twoPlayerX - buttonW/2, buttonY - buttonH/2, buttonW, buttonH, 15);
  pop();
  
  fill(255);
  noStroke();
  textSize(28);
  text("2 PLAYERS", twoPlayerX, buttonY - 10);
  textSize(14);
  fill(255, 200, 200);
  text("LOCAL", twoPlayerX, buttonY + 20);
  
  push();
  if (onlineHovered) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(100, 255, 100, 0.8)';
  }
  fill(onlineHovered ? color(100, 255, 120, 220) : color(100, 200, 100, 150));
  stroke(100, 255, 150);
  strokeWeight(3);
  rect(onlinePlayerX - buttonW/2, buttonY - buttonH/2, buttonW, buttonH, 15);
  pop();
  
  fill(255);
  noStroke();
  textSize(28);
  text("ONLINE", onlinePlayerX, buttonY - 10);
  textSize(14);
  fill(200, 255, 200);
  text(isConnected ? "MULTIPLAYER" : "CONNECTING...", onlinePlayerX, buttonY + 20);
  
  let alpha = map(sin(millis() * 0.006), -1, 1, 180, 255);
  fill(255, 255, 255, alpha);
  textSize(18);
  text("✨ Choose your game mode ✨", width/2, height * 0.85);
}

function drawWaitingScreen() {
  background(15, 20, 40);
  
  if (frameCount % 4 === 0) {
    updateBackgroundParticles();
  }
  drawBackgroundParticles();
  
  push();
  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = 'rgba(100, 255, 100, 0.8)';
  fill(100, 255, 100);
  textSize(64);
  textStyle(BOLD);
  text("FINDING OPPONENT", width/2, height/2 - 50);
  pop();
  
  let dots = '.'.repeat((frameCount / 30) % 4);
  fill(200, 255, 200);
  textSize(32);
  textStyle(NORMAL);
  text(`Please wait${dots}`, width/2, height/2 + 30);
  
  let buttonW = 200;
  let buttonH = 60;
  let buttonX = width/2;
  let buttonY = height * 0.7;
  
  let cancelHovered = mouseX > buttonX - buttonW/2 && mouseX < buttonX + buttonW/2 &&
                      mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2;
  
  push();
  if (cancelHovered) {
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(255, 100, 100, 0.6)';
  }
  fill(cancelHovered ? color(255, 100, 100, 200) : color(200, 100, 100, 150));
  stroke(255, 150, 150);
  strokeWeight(2);
  rect(buttonX - buttonW/2, buttonY - buttonH/2, buttonW, buttonH, 10);
  pop();
  
  fill(255);
  noStroke();
  textSize(24);
  text("CANCEL", buttonX, buttonY);
}

function draw() {
  glowPulse = map(sin(millis() * 0.003), -1, 1, 0.8, 1.2);
  
  if (gameState === 'modeSelection') {
    drawModeSelection();
  } else if (gameState === 'waiting') {
    drawWaitingScreen();
  } else if (gameState === 'selection') {
    drawSelectionScreen();
    
    if (gameMode === 'single' && player1Choice && selectedBotCharacter) {
      gameState = 'countdown';
      lastCountdownTime = millis();
      countdownTimer = 3;
    } else if (gameMode === 'two' && player1Choice && player2Choice && !isMultiplayer) {
      gameState = 'countdown';
      lastCountdownTime = millis();
      countdownTimer = 3;
    }
  } else if (gameState === 'countdown') {
    drawCountdown();
  } else if (gameState === 'playing') {
    drawGame();
    
    if (isMultiplayer && frameCount % 5 === 0) {
      sendPlayerUpdate();
    }
  } else if (gameState === 'gameOver') {
    drawGameOver();
  }
}

function mousePressed() {
  if (gameState === 'modeSelection') {
    let singlePlayerX = width/2 - 300;
    let twoPlayerX = width/2;
    let onlinePlayerX = width/2 + 300;
    let buttonY = height/2;
    let buttonW = 240;
    let buttonH = 100;
    
    if (mouseX > singlePlayerX - buttonW/2 && mouseX < singlePlayerX + buttonW/2 &&
        mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2) {
      gameMode = 'single';
      isMultiplayer = false;
      gameState = 'selection';
    } else if (mouseX > twoPlayerX - buttonW/2 && mouseX < twoPlayerX + buttonW/2 &&
               mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2) {
      gameMode = 'two';
      isMultiplayer = false;
      gameState = 'selection';
    } else if (mouseX > onlinePlayerX - buttonW/2 && mouseX < onlinePlayerX + buttonW/2 &&
               mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2) {
      if (isConnected) {
        gameMode = 'online';
        isMultiplayer = true;
        socket.emit('find-match');
      } else {
        alert('Not connected to server!');
      }
    }
  } else if (gameState === 'waiting') {
    let buttonW = 200;
    let buttonH = 60;
    let buttonX = width/2;
    let buttonY = height * 0.7;
    
    if (mouseX > buttonX - buttonW/2 && mouseX < buttonX + buttonW/2 &&
        mouseY > buttonY - buttonH/2 && mouseY < buttonY + buttonH/2) {
      socket.emit('cancel-matchmaking');
      resetGame();
    }
  } else if (gameState === 'selection') {
    let cols = 3;
    let rows = 3;
    let cellHeight = height * 0.22;
    let gridStartY = height * 0.15;
    
    if (isMultiplayer) {
      // Check if we have a player number assigned
      if (!myPlayerNumber) {
        console.log("Waiting for player number assignment...");
        return;
      }
      
      // Single centered grid for multiplayer
      let gridStartX = width/2 - (width * 0.35);
      let gridWidth = width * 0.7;
      let cellWidth = gridWidth / cols;
      
      for (let i = 0; i < shapes.length; i++) {
        let col = i % cols;
        let row = floor(i / cols);
        let shapeX = gridStartX + col * cellWidth + cellWidth / 2;
        let shapeY = gridStartY + row * cellHeight + cellHeight / 2;
        
        if (dist(mouseX, mouseY, shapeX, shapeY) < 40) {
          // Set choice based on player number
          if (myPlayerNumber === 1) {
            player1Choice = shapes[i];
          } else if (myPlayerNumber === 2) {
            player2Choice = shapes[i];
          }
          
          // Send to server
          if (socket && currentGameId) {
            socket.emit('character-selected', {
              gameId: currentGameId,
              character: shapes[i]
            });
            console.log(`Player ${myPlayerNumber} selected: ${shapes[i]}`);
          }
          break;
        }
      }
    } else {
      let p1GridStartX = (width/2) * 0.15;
      let p1GridWidth = (width/2) * 0.7;
      let cellWidth = p1GridWidth / cols;
      
      if (mouseX < width/2) {
        for (let i = 0; i < shapes.length; i++) {
          let col = i % cols;
          let row = floor(i / cols);
          let shapeX = p1GridStartX + col * cellWidth + cellWidth / 2;
          let shapeY = gridStartY + row * cellHeight + cellHeight / 2;
          
          if (dist(mouseX, mouseY, shapeX, shapeY) < 40) {
            player1Choice = shapes[i];
            break;
          }
        }
      }
      
      if (mouseX > width/2) {
        let p2GridStartX = width/2 + (width/2) * 0.15;
        for (let i = 0; i < shapes.length; i++) {
          let col = i % cols;
          let row = floor(i / cols);
          let shapeX = p2GridStartX + col * cellWidth + cellWidth / 2;
          let shapeY = gridStartY + row * cellHeight + cellHeight / 2;
          
          if (dist(mouseX, mouseY, shapeX, shapeY) < 40) {
            if (gameMode === 'single') {
              selectedBotCharacter = shapes[i];
              player2Choice = shapes[i];
            } else {
              player2Choice = shapes[i];
            }
            break;
          }
        }
      }
    }
  } else if (gameState === 'playing') {
    if (isMultiplayer) {
      if (myPlayerNumber === 1 || myPlayerNumber === 2) {
        let myPlayer = myPlayerNumber === 1 ? player1 : player2;
        let myChoice = myPlayerNumber === 1 ? player1Choice : player2Choice;
        let cooldown = (myChoice === 'triangle' || myChoice === 'oval') ? 2000 : 1000;
        
        if (millis() - myPlayer.lastAttack > cooldown && !myPlayer.isDashing) {
          let mouseTarget = { x: mouseX, y: mouseY };
          attack(myPlayer, mouseTarget, myChoice, myPlayerNumber, false);
          sendAttack(mouseTarget, false);
          myPlayer.lastAttack = millis();
          myPlayer.lastMoveTime = millis();
        }
      }
    } else if (gameMode === 'single') {
      let p1Cooldown = (player1Choice === 'triangle' || player1Choice === 'oval') ? 2000 : 1000;
      if (millis() - player1.lastAttack > p1Cooldown && !player1.isDashing) {
        let mouseTarget = { x: mouseX, y: mouseY };
        attack(player1, mouseTarget, player1Choice, 1, false);
        player1.lastAttack = millis();
        player1.lastMoveTime = millis();
      }
    }
  }
}

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
    let pNewX = localPlayer.x;
    let pNewY = localPlayer.y;
    let pMoved = false;
    
    if (keyIsDown(87)) { pNewY -= localPlayer.speed; pMoved = true; }
    if (keyIsDown(83)) { pNewY += localPlayer.speed; pMoved = true; }
    if (keyIsDown(65)) { pNewX -= localPlayer.speed; pMoved = true; }
    if (keyIsDown(68)) { pNewX += localPlayer.speed; pMoved = true; }
    
    if (isMultiplayer || gameMode === 'single') {
      if (keyIsDown(UP_ARROW)) { pNewY -= localPlayer.speed; pMoved = true; }
      if (keyIsDown(DOWN_ARROW)) { pNewY += localPlayer.speed; pMoved = true; }
      if (keyIsDown(LEFT_ARROW)) { pNewX -= localPlayer.speed; pMoved = true; }
      if (keyIsDown(RIGHT_ARROW)) { pNewX += localPlayer.speed; pMoved = true; }
    }
    
    if (!checkCollision(pNewX, pNewY, localPlayer.size)) {
      localPlayer.x = pNewX;
      localPlayer.y = pNewY;
    }
    
    if (pMoved) {
      localPlayer.lastMoveTime = millis();
      localPlayer.rotation += 0.08;
    }
  }
  
  if (isMultiplayer && localPlayer) {
    let myChoice = localPlayerNum === 1 ? player1Choice : player2Choice;
    let maxCharge = (myChoice === 'triangle' || myChoice === 'oval') ? 10 : 4;
    
    if (keyIsDown(32) && localPlayer.superCharge >= maxCharge && !localPlayer.superActive && !localPlayer.isDashing) {
      let mouseTarget = { x: mouseX, y: mouseY };
      attack(localPlayer, mouseTarget, myChoice, localPlayerNum, true);
      sendAttack(mouseTarget, true);
      localPlayer.superCharge = 0;
      localPlayer.lastMoveTime = millis();
      if (myChoice === 'triangle' || myChoice === 'oval') {
        localPlayer.superActive = true;
      }
    }
  } else if (gameMode === 'single') {
    let p1MaxCharge = (player1Choice === 'triangle' || player1Choice === 'oval') ? 10 : 4;
    if (keyIsDown(32) && player1.superCharge >= p1MaxCharge && !player1.superActive && !player1.isDashing) {
      let mouseTarget = { x: mouseX, y: mouseY };
      attack(player1, mouseTarget, player1Choice, 1, true);
      player1.superCharge = 0;
      player1.lastMoveTime = millis();
      if (player1Choice === 'triangle' || player1Choice === 'oval') {
        player1.superActive = true;
      }
    }
    
    updateBotAI();
  } else if (gameMode === 'two') {
    let p1MaxCharge = (player1Choice === 'triangle' || player1Choice === 'oval') ? 10 : 4;
    if (keyIsDown(86) && player1.superCharge >= p1MaxCharge && !player1.superActive && !player1.isDashing) {
      let targetX = player2.x;
      let targetY = player2.y;
      attack(player1, {x: targetX, y: targetY}, player1Choice, 1, true);
      player1.superCharge = 0;
      player1.lastMoveTime = millis();
      if (player1Choice === 'triangle' || player1Choice === 'oval') {
        player1.superActive = true;
      }
    }
    
    let p2NewX = player2.x;
    let p2NewY = player2.y;
    let p2Moved = false;
    
    if (!player2.isDashing) {
      if (keyIsDown(UP_ARROW)) { p2NewY -= player2.speed; p2Moved = true; }
      if (keyIsDown(DOWN_ARROW)) { p2NewY += player2.speed; p2Moved = true; }
      if (keyIsDown(LEFT_ARROW)) { p2NewX -= player2.speed; p2Moved = true; }
      if (keyIsDown(RIGHT_ARROW)) { p2NewX += player2.speed; p2Moved = true; }
      
      if (!checkCollision(p2NewX, p2NewY, player2.size)) {
        player2.x = p2NewX;
        player2.y = p2NewY;
      }
      
      if (p2Moved) {
        player2.lastMoveTime = millis();
        player2.rotation += 0.08;
      }
    }
    
    let p2MaxCharge = (player2Choice === 'triangle' || player2Choice === 'oval') ? 10 : 4;
    if (keyIsDown(190) && player2.superCharge >= p2MaxCharge && !player2.superActive && !player2.isDashing) {
      let targetX = player1.x;
      let targetY = player1.y;
      attack(player2, {x: targetX, y: targetY}, player2Choice, 2, true);
      player2.superCharge = 0;
      player2.lastMoveTime = millis();
      if (player2Choice === 'triangle' || player2Choice === 'oval') {
        player2.superActive = true;
      }
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
    if (attacker.superCharge < maxCharge) {
      attacker.superCharge++;
    }
  }
  
  screenShake = 6;
  
  if (isMultiplayer) {
    let targetNum = player === player1 ? 1 : 2;
    sendDamage(damage, targetNum);
  }
}

function resetGame() {
  screenShake = 0;
  gameState = 'modeSelection';
  gameMode = null;
  player1Choice = null;
  player2Choice = null;
  selectedBotCharacter = null;
  particles = [];
  projectiles = [];
  meleeEffects = [];
  introProgress = 0;
  transitionAlpha = 0;
  botDecisionTimer = 0;
  botAction = 'idle';
  botDodgeTimer = 0;
  botMovementTimer = 0;
  botAttackTimer = 0;
  player1.trail = [];
  player2.trail = [];
  winner = null;
  gameOverTime = 0;
  isMultiplayer = false;
  myPlayerNumber = null;
  currentGameId = null;
  mapSeed = 0;
  generateMap();
  initBackgroundParticles();
  initGridLines();
}

function initGridLines() {
  gridLines = [];
  for (let i = 0; i < 15; i++) {
    gridLines.push({
      x1: random(width),
      y1: random(height),
      x2: random(width),
      y2: random(height),
      alpha: random(30, 80),
      speed: random(0.2, 0.5)
    });
  }
}

function updateGridLines() {
  for (let line of gridLines) {
    line.x1 += line.speed;
    line.y1 += line.speed * 0.5;
    
    if (line.x1 > width) line.x1 = 0;
    if (line.y1 > height) line.y1 = 0;
  }
}

function drawGridLines() {
  for (let gridLine of gridLines) {
    stroke(100, 200, 255, gridLine.alpha);
    strokeWeight(1);
    line(gridLine.x1, gridLine.y1, gridLine.x1 + 100, gridLine.y1 + 50);
  }
}

function addParticleBurst(x, y, count, col, glow = true) {
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) break;
    let angle = random(TWO_PI);
    particles.push({
      x: x,
      y: y,
      vx: cos(angle) * random(3, 10),
      vy: sin(angle) * random(3, 10),
      life: 30,
      maxLife: 30,
      size: random(4, 10),
      color: col,
      glow: glow
    });
  }
  
  while (particles.length > MAX_PARTICLES) {
    particles.shift();
  }
}

function initBackgroundParticles() {
  backgroundParticles = [];
  for (let i = 0; i < 20; i++) {
    backgroundParticles.push({
      x: random(width),
      y: random(height),
      size: random(2, 6),
      speedX: random(-0.5, 0.5),
      speedY: random(-0.5, 0.5),
      alpha: random(50, 120),
      hue: random(180, 240),
      pulseOffset: random(TWO_PI)
    });
  }
}

function updateBackgroundParticles() {
  for (let p of backgroundParticles) {
    p.x += p.speedX;
    p.y += p.speedY;
    
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
  }
}

function drawBackgroundParticles() {
  for (let p of backgroundParticles) {
    let pulse = map(sin(millis() * 0.002 + p.pulseOffset), -1, 1, 0.5, 1);
    fill(p.hue, 150, 255, p.alpha * pulse);
    noStroke();
    circle(p.x, p.y, p.size * pulse);
  }
}

function drawCountdown() {
  background(15, 20, 40);
  
  if (millis() - lastCountdownTime >= 1000) {
    countdownTimer--;
    lastCountdownTime = millis();
    
    addParticleBurst(width/2, height/2, 20, color(random([255, 100]), random([255, 100]), random([100, 255])));
    
    if (countdownTimer <= 0) {
      startGame();
    }
  }
  
  updateAndDrawParticles();
  
  push();
  drawingContext.shadowBlur = 50;
  drawingContext.shadowColor = 'rgba(255, 255, 100, 0.8)';
  fill(255, 255, 100);
  textSize(140);
  textStyle(BOLD);
  text(countdownTimer, width/2, height/2);
  pop();
  
  textStyle(NORMAL);
  
  fill(255);
  textSize(28);
  text("GET READY!", width/2, height/2 - 120);
  
  textSize(20);
  if (gameMode === 'single') {
    text(`PLAYER: ${player1Choice.toUpperCase()}`, width/2 - 150, height * 0.72);
    text(`BOT: ${player2Choice.toUpperCase()}`, width/2 + 150, height * 0.72);
  } else if (isMultiplayer) {
    text(`PLAYER 1: ${player1Choice.toUpperCase()}`, width/2 - 150, height * 0.72);
    text(`PLAYER 2: ${player2Choice.toUpperCase()}`, width/2 + 150, height * 0.72);
  } else {
    text(`PLAYER 1: ${player1Choice.toUpperCase()}`, width/2 - 150, height * 0.72);
    text(`PLAYER 2: ${player2Choice.toUpperCase()}`, width/2 + 150, height * 0.72);
  }
}

function drawGameOver() {
  background(15, 20, 40);
  
  if (frameCount % 4 === 0) {
    updateBackgroundParticles();
  }
  drawBackgroundParticles();
  updateAndDrawParticles();
  
  let winnerColor = winner === 1 ? color(100, 200, 255) : color(255, 100, 100);
  let winnerName = "";
  
  if (gameMode === 'single') {
    // CHANGED: "YOU WIN" instead of "PLAYER WINS"
    winnerName = winner === 1 ? "YOU WIN!" : "BOT WINS!";
  } else if (isMultiplayer) {
    winnerName = winner === myPlayerNumber ? "YOU WIN!" : "YOU LOSE!";
  } else {
    winnerName = winner === 1 ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
  }
  
  push();
  drawingContext.shadowBlur = 60;
  drawingContext.shadowColor = winner === 1 ? 'rgba(100, 200, 255, 0.8)' : 'rgba(255, 100, 100, 0.8)';
  fill(winnerColor);
  textSize(80);
  textStyle(BOLD);
  text(winnerName, width/2, height/2);
  pop();
  
  let timeLeft = 3 - floor((millis() - gameOverTime) / 1000);
  fill(255, 255, 255, 200);
  textSize(24);
  textStyle(NORMAL);
  text(`Returning to menu in ${timeLeft}...`, width/2, height/2 + 80);
  
  if (millis() - gameOverTime >= 3000) {
    resetGame();
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.vx *= 0.98;
    p.life--;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    
    let alpha = map(p.life, 0, p.maxLife, 0, 255);
    let size = p.size * (p.life / p.maxLife);
    
    if (p.glow && frameCount % 3 === 0) {
      fill(red(p.color), green(p.color), blue(p.color), alpha * 0.3);
      noStroke();
      circle(p.x, p.y, size + 6);
    }
    
    fill(red(p.color), green(p.color), blue(p.color), alpha);
    noStroke();
    circle(p.x, p.y, size);
  }
}

function updateDamageFlash() {
  if (player1.damageFlash > 0) {
    player1.damageFlash -= 10;
    player1.scale = lerp(player1.scale, 1, 0.2);
  }
  if (player2.damageFlash > 0) {
    player2.damageFlash -= 10;
    player2.scale = lerp(player2.scale, 1, 0.2);
  }
}

function updateTrails() {
  if (frameCount % 4 === 0) {
    player1.trail.push({x: player1.x, y: player1.y, life: 15});
  }
  for (let i = player1.trail.length - 1; i >= 0; i--) {
    player1.trail[i].life--;
    if (player1.trail[i].life <= 0) {
      player1.trail.splice(i, 1);
    }
  }
  
  if (frameCount % 4 === 0) {
    player2.trail.push({x: player2.x, y: player2.y, life: 15});
  }
  for (let i = player2.trail.length - 1; i >= 0; i--) {
    player2.trail[i].life--;
    if (player2.trail[i].life <= 0) {
      player2.trail.splice(i, 1);
    }
  }
}

function drawTrail(player, playerNum) {
  let trailColor = playerNum === 1 ? color(100, 150, 255) : color(255, 50, 50);
  
  for (let i = 0; i < player.trail.length; i++) {
    let t = player.trail[i];
    let alpha = map(t.life, 0, 15, 0, 80);
    fill(red(trailColor), green(trailColor), blue(trailColor), alpha);
    noStroke();
    circle(t.x, t.y, player.size * 0.4);
  }
}

function drawPlayer(player, playerNum) {
  let currentTime = millis();
  let choice = playerNum === 1 ? player1Choice : player2Choice;
  let playerColor = playerNum === 1 ? color(100, 180, 255) : color(255, 80, 80);
  
  if (player.damageFlash > 0) {
    playerColor = lerpColor(playerColor, color(255, 255, 255), player.damageFlash / 255);
  }
  
  push();
  translate(player.x, player.y);
  scale(player.scale);
  rotate(player.rotation);
  
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = playerNum === 1 ? 'rgba(100, 180, 255, 0.6)' : 'rgba(255, 80, 80, 0.6)';
  
  fill(playerColor);
  stroke(255, 255, 255, 200);
  strokeWeight(3);
  drawPlayerShape(choice, player.size);
  
  pop();
  
  drawHealthBar(player.x, player.y - player.size - 15, player.health, player.maxHealth, playerNum);
}

function drawPlayerShape(choice, size) {
  if (choice === 'square') {
    rect(-size/2, -size/2, size, size, 5);
  } else if (choice === 'triangle') {
    triangle(0, -size/1.5, -size/1.2, size/2, size/1.2, size/2);
  } else if (choice === 'circle') {
    circle(0, 0, size);
  } else if (choice === 'oval') {
    ellipse(0, 0, size * 1.5, size);
  } else if (choice === 'pentagon') {
    beginShape();
    for (let i = 0; i < 5; i++) {
      let angle = (TWO_PI / 5) * i - PI/2;
      vertex(cos(angle) * size/2, sin(angle) * size/2);
    }
    endShape(CLOSE);
  } else if (choice === 'star') {
    beginShape();
    for (let i = 0; i < 10; i++) {
      let angle = (TWO_PI / 10) * i - PI/2;
      let radius = (i % 2 === 0) ? size/2 : size/4;
      vertex(cos(angle) * radius, sin(angle) * radius);
    }
    endShape(CLOSE);
  } else if (choice === 'rhombus') {
    push();
    rotate(PI/4);
    rect(-size/2, -size/2, size, size);
    pop();
  } else if (choice === 'octagon') {
    beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = (TWO_PI / 8) * i;
      vertex(cos(angle) * size/2, sin(angle) * size/2);
    }
    endShape(CLOSE);
  } else if (choice === 'trapezoid') {
    beginShape();
    vertex(-size/2, size/3);
    vertex(-size/3, -size/3);
    vertex(size/3, -size/3);
    vertex(size/2, size/3);
    endShape(CLOSE);
  }
}

function drawHealthBar(x, y, health, maxHealth, playerNum) {
  let barWidth = 80;
  let barHeight = 12;
  
  push();
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  fill(20, 25, 35);
  stroke(60, 70, 90);
  strokeWeight(2);
  rect(x - barWidth/2, y - barHeight/2, barWidth, barHeight, 6);
  pop();
  
  let healthPercent = health / maxHealth;
  let healthWidth = (barWidth - 6) * healthPercent;
  
  let healthColor;
  if (healthPercent > 0.6) {
    healthColor = color(0, 255, 150);
  } else if (healthPercent > 0.3) {
    healthColor = color(255, 200, 0);
  } else {
    healthColor = color(255, 50, 50);
  }
  
  push();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = `rgba(${red(healthColor)}, ${green(healthColor)}, ${blue(healthColor)}, 0.6)`;
  fill(healthColor);
  noStroke();
  rect(x - barWidth/2 + 3, y - barHeight/2 + 3, healthWidth, barHeight - 6, 4);
  pop();
  
  push();
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.8)';
  fill(255);
  textSize(12);
  textStyle(BOLD);
  text(floor(health), x, y - barHeight/2 - 15);
  pop();
}

function drawSuperBar(player, playerNum, x, y) {
  let barWidth = 240;
  let barHeight = 40;
  let choice = playerNum === 1 ? player1Choice : player2Choice;
  let maxCharge = (choice === 'triangle' || choice === 'oval') ? 10 : 4;
  
  push();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  fill(20, 25, 40);
  stroke(60, 70, 100);
  strokeWeight(3);
  rect(x, y, barWidth, barHeight, 10);
  pop();
  
  let segmentWidth = (barWidth - 12) / maxCharge;
  
  for (let i = 0; i < maxCharge; i++) {
    let segX = x + 6 + i * segmentWidth;
    let segY = y + 6;
    let segW = segmentWidth - 4;
    let segH = barHeight - 12;
    
    if (i < player.superCharge) {
      push();
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = playerNum === 1 ? 'rgba(100, 200, 255, 0.6)' : 'rgba(255, 100, 100, 0.6)';
      fill(playerNum === 1 ? color(100, 200, 255) : color(255, 100, 100));
      noStroke();
      rect(segX, segY, segW, segH, 5);
      pop();
    } else {
      fill(40, 45, 60);
      noStroke();
      rect(segX, segY, segW, segH, 5);
    }
  }
  
  push();
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.8)';
  fill(255);
  textSize(14);
  textStyle(BOLD);
  if (player.superCharge >= maxCharge) {
    text("⚡ SUPER READY! ⚡", x + barWidth / 2, y + barHeight / 2);
  } else {
    text(`SUPER ${player.superCharge}/${maxCharge}`, x + barWidth / 2, y + barHeight / 2);
  }
  pop();
}

function drawGame() {
  push();
  translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
  
  background(20, 25, 45);
  
  if (frameCount % 4 === 0) {
    updateBackgroundParticles();
  }
  drawBackgroundParticles();
  
  if (frameCount % 2 === 0) {
    stroke(100, 150, 200, 30);
    strokeWeight(1);
    for (let x = (frameCount % 40); x < width; x += 40) {
      line(x, 0, x, height);
    }
    for (let y = (frameCount % 40); y < height; y += 40) {
      line(0, y, width, y);
    }
  }
  
  if (introProgress < 1) {
    introProgress += 0.02;
  }
  
  updatePoisonGas();
  updateShields();
  updatePlayers();
  updateHealing();
  checkPoisonDamage();
  updateTriangleBullets();
  updateOvalBullets();
  updateSuperTriangleBullets();
  updateSuperOvalBullets();
  updateDashes();
  updateProjectiles();
  updateMeleeEffects();
  updateAndDrawParticles();
  updateDamageFlash();
  updateTrails();
  
  if (screenShake > 0) {
    screenShake *= 0.9;
    if (screenShake < 0.1) screenShake = 0;
  }
  
  if (player1.health <= 0) {
    winner = 2;
    gameState = 'gameOver';
    gameOverTime = millis();
    addParticleBurst(width/2, height/2, 40, color(255, 100, 100));
    screenShake = 15;
  } else if (player2.health <= 0) {
    winner = 1;
    gameState = 'gameOver';
    gameOverTime = millis();
    addParticleBurst(width/2, height/2, 40, color(100, 200, 255));
    screenShake = 15;
  }
  
  drawMap();
  drawPoisonGas();
  drawMeleeEffects();
  drawProjectiles();
  drawTrail(player1, 1);
  drawTrail(player2, 2);
  drawPlayer(player1, 1);
  drawPlayer(player2, 2);
  drawShields();
  
  drawSuperBar(player1, 1, 20, height - 80);
  drawSuperBar(player2, 2, width - 260, height - 80);
  
  push();
  fill(0, 0, 0, 100);
  noStroke();
  rect(0, height - 40, width, 40);
  
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.8)';
  fill(200, 220, 255);
  textSize(14);
  if (gameMode === 'single') {
    text("WASD/Arrows Move • Left Click Attack • Spacebar Super", width/2, height - 20);
  } else if (isMultiplayer) {
    text("WASD/Arrows Move • Left Click Attack • Spacebar Super", width/2, height - 20);
  } else {
    text("P1: WASD • C Attack • V Super | P2: Arrows • , Attack • . Super", width/2, height - 20);
  }
  pop();
  
  pop();
}

function updateShields() {
  if (player1.shieldActive && millis() - player1.shieldStartTime > star_shield_duration) {
    player1.shieldActive = false;
  }
  if (player2.shieldActive && millis() - player2.shieldStartTime > star_shield_duration) {
    player2.shieldActive = false;
  }
}

function drawShields() {
  if (player1.shieldActive) {
    let pulse = map(sin(millis() * 0.015), -1, 1, 0.88, 1.12);
    
    push();
    translate(player1.x, player1.y);
    
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(100, 200, 255, 0.6)';
    stroke(100, 200, 255, 200);
    strokeWeight(4);
    noFill();
    circle(0, 0, (player1.size + 25) * pulse);
    
    stroke(150, 220, 255, 150);
    strokeWeight(2);
    circle(0, 0, (player1.size + 15) * pulse);
    pop();
  }
  
  if (player2.shieldActive) {
    let pulse = map(sin(millis() * 0.015), -1, 1, 0.88, 1.12);
    
    push();
    translate(player2.x, player2.y);
    
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(255, 100, 100, 0.6)';
    stroke(255, 100, 100, 200);
    strokeWeight(4);
    noFill();
    circle(0, 0, (player2.size + 25) * pulse);
    
    stroke(255, 150, 150, 150);
    strokeWeight(2);
    circle(0, 0, (player2.size + 15) * pulse);
    pop();
  }
}

function updatePoisonGas() {
  let elapsed = millis() - gameStartTime;
  
  if (elapsed >= 30000 && !poisonGas.active) {
    poisonGas.active = true;
    poisonGas.startTime = millis();
    poisonGas.lastAdvance = millis();
    poisonGas.topBorder = cellSize;
    poisonGas.bottomBorder = cellSize;
    poisonGas.leftBorder = cellSize;
    poisonGas.rightBorder = cellSize;
    screenShake = 10;
  }
  
  if (poisonGas.active && millis() - poisonGas.lastAdvance >= 5000) {
    poisonGas.topBorder += cellSize;
    poisonGas.bottomBorder += cellSize;
    poisonGas.leftBorder += cellSize;
    poisonGas.rightBorder += cellSize;
    poisonGas.lastAdvance = millis();
    screenShake = 8;
  }
}

function drawPoisonGas() {
  if (!poisonGas.active) return;
  
  let pulseAlpha = map(sin(millis() * 0.005), -1, 1, 50, 90);
  
  push();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(0, 255, 0, 0.3)';
  
  fill(0, 255, 100, pulseAlpha);
  noStroke();
  
  rect(0, 0, width, poisonGas.topBorder);
  rect(0, height - poisonGas.bottomBorder, width, poisonGas.bottomBorder);
  rect(0, poisonGas.topBorder, poisonGas.leftBorder, height - poisonGas.topBorder - poisonGas.bottomBorder);
  rect(width - poisonGas.rightBorder, poisonGas.topBorder, poisonGas.rightBorder, height - poisonGas.topBorder - poisonGas.bottomBorder);
  
  stroke(0, 255, 100, 180);
  strokeWeight(2);
  noFill();
  line(0, poisonGas.topBorder, width, poisonGas.topBorder);
  line(0, height - poisonGas.bottomBorder, width, height - poisonGas.bottomBorder);
  line(poisonGas.leftBorder, 0, poisonGas.leftBorder, height);
  line(width - poisonGas.rightBorder, 0, width - poisonGas.rightBorder, height);
  pop();
}

function isInPoison(x, y) {
  if (!poisonGas.active) return false;
  
  let top = poisonGas.topBorder;
  let bottom = height - poisonGas.bottomBorder;
  let left = poisonGas.leftBorder;
  let right = width - poisonGas.rightBorder;
  
  return y < top || y > bottom || x < left || x > right;
}

function isNearPoison(x, y, buffer) {
  if (!poisonGas.active) return false;
  
  let top = poisonGas.topBorder + buffer;
  let bottom = height - poisonGas.bottomBorder - buffer;
  let left = poisonGas.leftBorder + buffer;
  let right = width - poisonGas.rightBorder - buffer;
  
  return y < top || y > bottom || x < left || x > right;
}

function checkPoisonDamage() {
  if (!poisonGas.active) return;
  
  let currentTime = millis();
  
  if (isInPoison(player1.x, player1.y)) {
    if (currentTime - player1.lastPoisonDamage >= 1000) {
      player1.health -= 1500;
      player1.lastPoisonDamage = currentTime;
      player1.lastHitTime = currentTime;
      player1.damageFlash = 255;
    }
  }
  
  if (isInPoison(player2.x, player2.y)) {
    if (currentTime - player2.lastPoisonDamage >= 1000) {
      player2.health -= 1500;
      player2.lastPoisonDamage = currentTime;
      player2.lastHitTime = currentTime;
      player2.damageFlash = 255;
    }
  }
}

function updateHealing() {
  let currentTime = millis();
  
  if (currentTime - player1.lastHitTime > 3000 && currentTime - player1.lastHealTime > 1000) {
    if (player1.health < player1.maxHealth) {
      player1.health = min(player1.health + 1000, player1.maxHealth);
      player1.lastHealTime = currentTime;
    }
  }
  
  if (currentTime - player2.lastHitTime > 3000 && currentTime - player2.lastHealTime > 1000) {
    if (player2.health < player2.maxHealth) {
      player2.health = min(player2.health + 1000, player2.maxHealth);
      player2.lastHealTime = currentTime;
    }
  }
}

function generateMap() {
  walls = [];
  
  // Use mapSeed for multiplayer to sync maps
  if (isMultiplayer && mapSeed > 0) {
    randomSeed(mapSeed);
  }
  
  let cols = floor(width / cellSize);
  let rows = floor(height / cellSize);
  
  for (let i = 0; i < cols; i++) {
    walls.push({x: i * cellSize, y: 0, w: cellSize, h: cellSize, isBorder: true});
    walls.push({x: i * cellSize, y: (rows - 1) * cellSize, w: cellSize, h: cellSize, isBorder: true});
  }
  
  for (let i = 1; i < rows - 1; i++) {
    walls.push({x: 0, y: i * cellSize, w: cellSize, h: cellSize, isBorder: true});
    walls.push({x: (cols - 1) * cellSize, y: i * cellSize, w: cellSize, h: cellSize, isBorder: true});
  }
  
  let numWallGroups = floor((cols * rows) * 0.008);
  for (let i = 0; i < numWallGroups; i++) {
    let x = floor(random(3, cols - 3)) * cellSize;
    let y = floor(random(3, rows - 3)) * cellSize;
    let length = floor(random(2, 4));
    let horizontal = random() > 0.5;
    
    for (let j = 0; j < length; j++) {
      let wx = horizontal ? x + j * cellSize : x;
      let wy = horizontal ? y : y + j * cellSize;
      
      if (wx < (cols - 2) * cellSize && wy < (rows - 2) * cellSize) {
        walls.push({x: wx, y: wy, w: cellSize, h: cellSize, isBorder: false});
      }
    }
  }
  
  // Reset random seed after map generation
  if (isMultiplayer && mapSeed > 0) {
    randomSeed(millis());
  }
  
  player1.x = cellSize * 2;
  player1.y = cellSize * 2;
  player2.x = width - cellSize * 3;
  player2.y = height - cellSize * 3;
  
  if (player1Choice === 'square') player1.speed = square_movement_speed;
  else if (player1Choice === 'triangle') player1.speed = triangle_movement_speed;
  else if (player1Choice === 'circle') player1.speed = circle_movement_speed;
  else if (player1Choice === 'oval') player1.speed = oval_movement_speed;
  else if (player1Choice === 'pentagon') player1.speed = pentagon_movement_speed;
  else if (player1Choice === 'star') player1.speed = star_movement_speed;
  else if (player1Choice === 'rhombus') player1.speed = rhombus_movement_speed;
  else if (player1Choice === 'octagon') player1.speed = octagon_movement_speed;
  else if (player1Choice === 'trapezoid') player1.speed = trapezoid_movement_speed;
  
  if (player2Choice === 'square') player2.speed = square_movement_speed;
  else if (player2Choice === 'triangle') player2.speed = triangle_movement_speed;
  else if (player2Choice === 'circle') player2.speed = circle_movement_speed;
  else if (player2Choice === 'oval') player2.speed = oval_movement_speed;
  else if (player2Choice === 'pentagon') player2.speed = pentagon_movement_speed;
  else if (player2Choice === 'star') player2.speed = star_movement_speed;
  else if (player2Choice === 'rhombus') player2.speed = rhombus_movement_speed;
  else if (player2Choice === 'octagon') player2.speed = octagon_movement_speed;
  else if (player2Choice === 'trapezoid') player2.speed = trapezoid_movement_speed;
  
  player1.health = player1.maxHealth;
  player2.health = player2.maxHealth;
  player1.lastHitTime = millis();
  player2.lastHitTime = millis();
  player1.lastHealTime = millis();
  player2.lastHealTime = millis();
  player1.lastMoveTime = millis();
  player2.lastMoveTime = millis();
  player1.lastPoisonDamage = 0;
  player2.lastPoisonDamage = 0;
  player1.superCharge = 0;
  player2.superCharge = 0;
  player1.superActive = false;
  player2.superActive = false;
  player1.shieldActive = false;
  player2.shieldActive = false;
  player1.rhombusMode = 1;
  player2.rhombusMode = 1;
  player1.isDashing = false;
  player2.isDashing = false;
  player1.rotation = 0;
  player2.rotation = 0;
  player1.damageFlash = 0;
  player2.damageFlash = 0;
  player1.scale = 1;
  player2.scale = 1;
  player1.trail = [];
  player2.trail = [];
  
  poisonGas.active = false;
  poisonGas.startTime = 0;
  poisonGas.topBorder = 0;
  poisonGas.bottomBorder = 0;
  poisonGas.leftBorder = 0;
  poisonGas.rightBorder = 0;
  
  gameStartTime = millis();
  projectiles = [];
  meleeEffects = [];
  particles = [];
  screenShake = 0;
  introProgress = 0;
}

function drawMap() {
  for (let wall of walls) {
    push();
    if (wall.isBorder) {
      fill(60, 70, 110);
      stroke(100, 120, 180);
    } else {
      fill(50, 60, 95);
      stroke(80, 100, 150);
    }
    strokeWeight(2);
    rect(wall.x, wall.y, wall.w, wall.h, 6);
    pop();
  }
}

function startGame() {
  gameState = 'playing';
  generateMap();
  introProgress = 0;
}

function drawSelectionScreen() {
  background(15, 20, 40);
  
  if (frameCount % 4 === 0) {
    updateBackgroundParticles();
  }
  drawBackgroundParticles();
  
  if (frameCount % 3 === 0) {
    updateGridLines();
  }
  drawGridLines();
  
  if (gameMode === 'single') {
    push();
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(100, 200, 255, 0.5)';
    stroke(100, 150, 255, 150);
    strokeWeight(3);
    line(width/2, 0, width/2, height);
    pop();
    
    drawPlayerSide(1, 0, width/2);
    drawBotSelectionSide(width/2, width);
  } else if (isMultiplayer) {
    // NEW: Single centered selection for multiplayer
    drawMultiplayerSelection();
  } else {
    push();
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(100, 200, 255, 0.5)';
    stroke(100, 150, 255, 150);
    strokeWeight(3);
    line(width/2, 0, width/2, height);
    pop();
    
    drawPlayerSide(1, 0, width/2);
    drawPlayerSide(2, width/2, width);
  }
  
  let alpha = map(sin(millis() * 0.006), -1, 1, 180, 255);
  fill(255, 255, 255, alpha);
  textSize(14);
  if (gameMode === 'single') {
    text("✨ Choose your character and the bot's character • Click to select ✨", width/2, height * 0.97);
  } else if (isMultiplayer) {
    text("✨ Choose your character ✨", width/2, height * 0.97);
  } else {
    text("✨ Player 1 and Player 2: Choose your characters • Click to select ✨", width/2, height * 0.97);
  }
  
  menuAnimationOffset = (menuAnimationOffset + 0.5) % height;
}

// NEW: Multiplayer selection screen with single grid
function drawMultiplayerSelection() {
  push();
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = 'rgba(100, 200, 255, 0.6)';
  fill(100, 200, 255);
  textSize(48);
  textStyle(BOLD);
  text("CHOOSE YOUR CHARACTER", width/2, height * 0.08);
  pop();
  textStyle(NORMAL);
  
  let cols = 3;
  let rows = 3;
  let gridStartX = width/2 - (width * 0.35);
  let gridWidth = width * 0.7;
  let cellWidth = gridWidth / cols;
  let cellHeight = height * 0.22;
  let gridStartY = height * 0.15;
  
  for (let i = 0; i < shapes.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let shapeX = gridStartX + col * cellWidth + cellWidth / 2;
    let shapeY = gridStartY + row * cellHeight + cellHeight / 2;
    
    // Only highlight MY choice
    let myChoice = myPlayerNumber === 1 ? player1Choice : player2Choice;
    let isSelected = myChoice === shapes[i];
    let isHovered = dist(mouseX, mouseY, shapeX, shapeY) < 40;
    
    push();
    if (isSelected) {
      drawingContext.shadowBlur = 25;
      drawingContext.shadowColor = 'rgba(100, 200, 255, 0.8)';
      fill(100, 200, 255, 180);
      stroke(100, 200, 255);
      strokeWeight(5);
    } else if (isHovered) {
      drawingContext.shadowBlur = 18;
      drawingContext.shadowColor = 'rgba(255, 255, 255, 0.6)';
      fill(255, 255, 255, 200);
      stroke(200, 220, 255);
      strokeWeight(4);
    } else {
      fill(60, 70, 100, 200);
      stroke(100, 120, 160);
      strokeWeight(2);
    }
    
    rect(shapeX - 40, shapeY - 40, 80, 80, 15);
    pop();
    
    fill(240, 245, 255);
    stroke(60, 70, 90);
    strokeWeight(2);
    
    push();
    translate(shapeX, shapeY);
    drawPlayerShape(shapes[i], 32);
    pop();
    
    fill(200, 220, 255);
    noStroke();
    textSize(13);
    textStyle(BOLD);
    text(shapes[i].toUpperCase(), shapeX, shapeY + 55);
  }
  
  // Show selection status
  fill(150, 200, 255);
  textSize(18);
  textStyle(NORMAL);
  if (myChoice) {
    text(`✓ You selected: ${myChoice.toUpperCase()}`, width/2, height * 0.88);
  } else {
    let alpha = map(sin(millis() * 0.008), -1, 1, 150, 255);
    fill(255, 255, 255, alpha);
    text("Click a character to select", width/2, height * 0.88);
  }
}

function drawPlayerSide(playerNum, startX, endX) {
  let midX = (startX + endX) / 2;
  let playerColor = playerNum === 1 ? color(100, 180, 255) : color(255, 80, 80);
  
  push();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = playerNum === 1 ? 'rgba(100, 180, 255, 0.5)' : 'rgba(255, 80, 80, 0.5)';
  fill(playerColor);
  textSize(36);
  textStyle(BOLD);
  text(gameMode === 'single' && playerNum === 1 ? "Player" : `Player ${playerNum}`, midX, height * 0.08);
  pop();
  textStyle(NORMAL);
  
  let cols = 3;
  let rows = 3;
  let gridStartX = startX + (endX - startX) * 0.15;
  let gridWidth = (endX - startX) * 0.7;
  let cellWidth = gridWidth / cols;
  let cellHeight = height * 0.22;
  let gridStartY = height * 0.15;
  
  for (let i = 0; i < shapes.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let shapeX = gridStartX + col * cellWidth + cellWidth / 2;
    let shapeY = gridStartY + row * cellHeight + cellHeight / 2;
    
    let isSelected = (playerNum === 1 && player1Choice === shapes[i]) || (playerNum === 2 && player2Choice === shapes[i]);
    let isHovered = dist(mouseX, mouseY, shapeX, shapeY) < 40 && 
                    ((playerNum === 1 && mouseX < width/2) || (playerNum === 2 && mouseX > width/2));
    
    push();
    if (isSelected) {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = playerNum === 1 ? 'rgba(100, 180, 255, 0.6)' : 'rgba(255, 80, 80, 0.6)';
      fill(playerNum === 1 ? color(100, 180, 255, 150) : color(255, 80, 80, 150));
      stroke(playerNum === 1 ? color(100, 180, 255) : color(255, 80, 80));
      strokeWeight(4);
    } else if (isHovered) {
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
      fill(255, 255, 255, 180);
      stroke(200, 220, 255);
      strokeWeight(3);
    } else {
      fill(60, 70, 100, 200);
      stroke(100, 120, 160);
      strokeWeight(2);
    }
    
    rect(shapeX - 35, shapeY - 35, 70, 70, 12);
    pop();
    
    fill(240, 245, 255);
    stroke(60, 70, 90);
    strokeWeight(2);
    
    push();
    translate(shapeX, shapeY);
    drawPlayerShape(shapes[i], 28);
    pop();
    
    fill(200, 220, 255);
    noStroke();
    textSize(11);
    textStyle(BOLD);
    text(shapes[i].toUpperCase(), shapeX, shapeY + 50);
  }
}

function drawBotSelectionSide(startX, endX) {
  let midX = (startX + endX) / 2;
  
  push();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 80, 80, 0.5)';
  fill(255, 80, 80);
  textSize(36);
  textStyle(BOLD);
  text("Bot Opponent", midX, height * 0.08);
  pop();
  textStyle(NORMAL);
  
  let cols = 3;
  let rows = 3;
  let gridStartX = startX + (endX - startX) * 0.15;
  let gridWidth = (endX - startX) * 0.7;
  let cellWidth = gridWidth / cols;
  let cellHeight = height * 0.22;
  let gridStartY = height * 0.15;
  
  for (let i = 0; i < shapes.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let shapeX = gridStartX + col * cellWidth + cellWidth / 2;
    let shapeY = gridStartY + row * cellHeight + cellHeight / 2;
    
    let isSelected = selectedBotCharacter === shapes[i];
    let isHovered = dist(mouseX, mouseY, shapeX, shapeY) < 40 && mouseX > width/2;
    
    push();
    if (isSelected) {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = 'rgba(255, 80, 80, 0.6)';
      fill(255, 80, 80, 150);
      stroke(255, 80, 80);
      strokeWeight(4);
    } else if (isHovered) {
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
      fill(255, 255, 255, 180);
      stroke(255, 200, 200);
      strokeWeight(3);
    } else {
      fill(60, 70, 100, 200);
      stroke(100, 120, 160);
      strokeWeight(2);
    }
    
    rect(shapeX - 35, shapeY - 35, 70, 70, 12);
    pop();
    
    fill(240, 245, 255);
    stroke(60, 70, 90);
    strokeWeight(2);
    
    push();
    translate(shapeX, shapeY);
    drawPlayerShape(shapes[i], 28);
    pop();
    
    fill(255, 200, 200);
    noStroke();
    textSize(11);
    textStyle(BOLD);
    text(shapes[i].toUpperCase(), shapeX, shapeY + 50);
  }
}function updateBotAI() {
  let currentTime = millis();
  
  if (currentTime - botDecisionTimer > botDecisionInterval) {
    makeBotDecision();
    botDecisionTimer = currentTime;
  }
  
  if (currentTime - botMovementTimer > 50) {
    executeBotAction();
    botMovementTimer = currentTime;
  }
  
  if (currentTime - botAttackTimer > 50) {
    botSmartAttack();
    botAttackTimer = currentTime;
  }
}

function makeBotDecision() {
  let distToPlayer = dist(player2.x, player2.y, player1.x, player1.y);
  let healthPercent = player2.health / player2.maxHealth;
  let playerHealthPercent = player1.health / player1.maxHealth;
  
  let playerVelX = player1.x - botLastPlayerPos.x;
  let playerVelY = player1.y - botLastPlayerPos.y;
  botPredictedPlayerPos.x = player1.x + playerVelX * 3;
  botPredictedPlayerPos.y = player1.y + playerVelY * 3;
  botLastPlayerPos.x = player1.x;
  botLastPlayerPos.y = player1.y;
  
  let dangerousProjectile = null;
  let minDist = Infinity;
  for (let proj of projectiles) {
    if (proj.owner === 1) {
      let projDist = dist(proj.x, proj.y, player2.x, player2.y);
      
      let futureX = proj.x + proj.vx * 5;
      let futureY = proj.y + proj.vy * 5;
      let futureDist = dist(futureX, futureY, player2.x, player2.y);
      
      if ((projDist < 250 || futureDist < 200) && projDist < minDist) {
        dangerousProjectile = proj;
        minDist = projDist;
      }
    }
  }
  
  if (dangerousProjectile) {
    botAction = 'dodge';
    let projAngle = atan2(dangerousProjectile.vy, dangerousProjectile.vx);
    let dodgeAngle = projAngle + PI/2;
    if (random() > 0.5) dodgeAngle -= PI;
    botDodgeDirection.x = cos(dodgeAngle);
    botDodgeDirection.y = sin(dodgeAngle);
    botDodgeTimer = millis();
    return;
  }
  
  if (isInPoison(player2.x, player2.y) || isNearPoison(player2.x, player2.y, 80)) {
    botAction = 'escape-poison';
    return;
  }
  
  if (playerHealthPercent < 0.3 && healthPercent > 0.3) {
    botAction = 'chase';
    return;
  }
  
  if (healthPercent < 0.3) {
    botAction = 'retreat';
    return;
  }
  
  let optimalDistance = getOptimalDistance(player2Choice);
  
  if (distToPlayer < optimalDistance - 100) {
    botAction = 'maintain-distance';
  } else if (distToPlayer > optimalDistance + 150) {
    botAction = 'chase';
  } else {
    botAction = 'strafe-attack';
  }
}

function getOptimalDistance(choice) {
  if (choice === 'square' || choice === 'star') return 130;
  if (choice === 'rhombus') return player2.rhombusMode === 1 ? 280 : 120;
  if (choice === 'trapezoid') return 160;
  if (choice === 'circle') return 300;
  return 260;
}

function executeBotAction() {
  if (player2.isDashing) return;
  
  let currentTime = millis();
  let speedMult = 1.4;
  
  if (botAction === 'dodge' && currentTime - botDodgeTimer < 600) {
    moveBotInDirection(botDodgeDirection.x, botDodgeDirection.y, 2.5);
    return;
  }
  
  if (botAction === 'escape-poison') {
    let safeCenterX = width / 2;
    let safeCenterY = height / 2;
    if (poisonGas.active) {
      safeCenterX = poisonGas.leftBorder + (width - poisonGas.leftBorder - poisonGas.rightBorder) / 2;
      safeCenterY = poisonGas.topBorder + (height - poisonGas.topBorder - poisonGas.bottomBorder) / 2;
    }
    let angle = atan2(safeCenterY - player2.y, safeCenterX - player2.x);
    moveBotInDirection(cos(angle), sin(angle), 2.5);
  } else if (botAction === 'chase') {
    moveBotTowards(botPredictedPlayerPos.x, botPredictedPlayerPos.y, 2.0);
  } else if (botAction === 'retreat') {
    let retreatAngle = atan2(player2.y - player1.y, player2.x - player1.x);
    moveBotInDirection(cos(retreatAngle), sin(retreatAngle), 1.8);
  } else if (botAction === 'maintain-distance') {
    let awayAngle = atan2(player2.y - player1.y, player2.x - player1.x);
    moveBotInDirection(cos(awayAngle), sin(awayAngle), speedMult);
  } else if (botAction === 'strafe-attack') {
    let angleToPlayer = atan2(player1.y - player2.y, player1.x - player2.x);
    let strafeAngle = angleToPlayer + (PI/2 * botStrafeDirection);
    if (frameCount % 120 === 0) botStrafeDirection *= -1;
    moveBotInDirection(cos(strafeAngle), sin(strafeAngle), speedMult);
  }
}

function botSmartAttack() {
  let currentTime = millis();
  let distToPlayer = dist(player2.x, player2.y, player1.x, player1.y);
  let p2Cooldown = (player2Choice === 'triangle' || player2Choice === 'oval') ? 2000 : 1000;
  
  if (currentTime - player2.lastAttack > p2Cooldown && !player2.isDashing) {
    let shouldAttack = false;
    
    if (player2Choice === 'square' || player2Choice === 'star') {
      shouldAttack = distToPlayer < 140 && random() < 0.7;
    } else if (player2Choice === 'rhombus' && player2.rhombusMode === 2) {
      shouldAttack = distToPlayer < 110 && random() < 0.7;
    } else {
      shouldAttack = distToPlayer < 450 && random() < 0.7;
    }
    
    if (shouldAttack) {
      attack(player2, botPredictedPlayerPos, player2Choice, 2, false);
      player2.lastAttack = currentTime;
      player2.lastMoveTime = currentTime;
    }
  }
  
  let p2MaxCharge = (player2Choice === 'triangle' || player2Choice === 'oval') ? 10 : 4;
  if (player2.superCharge >= p2MaxCharge && !player2.superActive) {
    let shouldSuper = (distToPlayer < 300) || (player2.health / player2.maxHealth < 0.4);
    if (shouldSuper && random() < 0.8) {
      attack(player2, botPredictedPlayerPos, player2Choice, 2, true);
      player2.superCharge = 0;
      player2.lastMoveTime = currentTime;
      if (player2Choice === 'triangle' || player2Choice === 'oval') {
        player2.superActive = true;
      }
    }
  }
}

function moveBotTowards(targetX, targetY, speedMultiplier = 1.5) {
  let angle = atan2(targetY - player2.y, targetX - player2.x);
  moveBotInDirection(cos(angle), sin(angle), speedMultiplier);
}

function moveBotInDirection(dirX, dirY, speedMultiplier = 1.5) {
  let p2NewX = player2.x + dirX * player2.speed * speedMultiplier;
  let p2NewY = player2.y + dirY * player2.speed * speedMultiplier;
  
  if (isInPoison(p2NewX, p2NewY) || isNearPoison(p2NewX, p2NewY, 40)) {
    return;
  }
  
  let canMove = true;
  for (let i = 1; i <= 2; i++) {
    let checkX = player2.x + dirX * player2.speed * i * 2;
    let checkY = player2.y + dirY * player2.speed * i * 2;
    if (checkCollision(checkX, checkY, player2.size)) {
      canMove = false;
      break;
    }
  }
  
  if (!canMove) {
    let baseAngle = atan2(dirY, dirX);
    let alternatives = [PI/4, -PI/4, PI/3, -PI/3];
    
    for (let alt of alternatives) {
      let altAngle = baseAngle + alt;
      p2NewX = player2.x + cos(altAngle) * player2.speed * speedMultiplier;
      p2NewY = player2.y + sin(altAngle) * player2.speed * speedMultiplier;
      
      if (!checkCollision(p2NewX, p2NewY, player2.size) && !isInPoison(p2NewX, p2NewY) && !isNearPoison(p2NewX, p2NewY, 40)) {
        canMove = true;
        break;
      }
    }
  }
  
  if (!checkCollision(p2NewX, p2NewY, player2.size) && !isInPoison(p2NewX, p2NewY)) {
    player2.x = p2NewX;
    player2.y = p2NewY;
    player2.lastMoveTime = millis();
    player2.rotation += 0.08;
  }
}

function updateTriangleBullets() {
  if (player1Choice === 'triangle' && player1.triangleBulletCount > 0) {
    if (millis() - player1.lastBulletTime > 100) {
      projectiles.push({
        x: player1.x, y: player1.y, startX: player1.x, startY: player1.y,
        vx: cos(player1.triangleTargetAngle) * triangle_bullet_speed,
        vy: sin(player1.triangleTargetAngle) * triangle_bullet_speed,
        damage: triangle_damage, owner: 1, color: color(100, 150, 255),
        size: 12, maxDistance: Infinity, type: 'triangle',
        destroysWalls: false, rotation: 0
      });
      player1.triangleBulletCount--;
      player1.lastBulletTime = millis();
    }
  }
  
  if (player2Choice === 'triangle' && player2.triangleBulletCount > 0) {
    if (millis() - player2.lastBulletTime > 100) {
      projectiles.push({
        x: player2.x, y: player2.y, startX: player2.x, startY: player2.y,
        vx: cos(player2.triangleTargetAngle) * triangle_bullet_speed,
        vy: sin(player2.triangleTargetAngle) * triangle_bullet_speed,
        damage: triangle_damage, owner: 2, color: color(255, 50, 50),
        size: 12, maxDistance: Infinity, type: 'triangle',
        destroysWalls: false, rotation: 0
      });
      player2.triangleBulletCount--;
      player2.lastBulletTime = millis();
    }
  }
}

function updateOvalBullets() {
  if (player1Choice === 'oval' && player1.ovalBulletCount > 0) {
    if (millis() - player1.lastBulletTime > 100) {
      projectiles.push({
        x: player1.x, y: player1.y, startX: player1.x, startY: player1.y,
        vx: cos(player1.ovalTargetAngle) * oval_bullet_speed,
        vy: sin(player1.ovalTargetAngle) * oval_bullet_speed,
        damage: oval_damage, owner: 1, color: color(100, 150, 255),
        size: 10, maxDistance: Infinity, type: 'oval',
        destroysWalls: false, bounces: 0, maxBounces: 1, rotation: 0
      });
      player1.ovalBulletCount--;
      player1.lastBulletTime = millis();
    }
  }
  
  if (player2Choice === 'oval' && player2.ovalBulletCount > 0) {
    if (millis() - player2.lastBulletTime > 100) {
      projectiles.push({
        x: player2.x, y: player2.y, startX: player2.x, startY: player2.y,
        vx: cos(player2.ovalTargetAngle) * oval_bullet_speed,
        vy: sin(player2.ovalTargetAngle) * oval_bullet_speed,
        damage: oval_damage, owner: 2, color: color(255, 50, 50),
        size: 10, maxDistance: Infinity, type: 'oval',
        destroysWalls: false, bounces: 0, maxBounces: 1, rotation: 0
      });
      player2.ovalBulletCount--;
      player2.lastBulletTime = millis();
    }
  }
}

function updateSuperTriangleBullets() {
  if (player1Choice === 'triangle' && player1.superBulletCount > 0) {
    if (millis() - player1.lastSuperBulletTime > 50) {
      projectiles.push({
        x: player1.x, y: player1.y, startX: player1.x, startY: player1.y,
        vx: cos(player1.superTriangleTargetAngle) * triangle_super_bullet_speed,
        vy: sin(player1.superTriangleTargetAngle) * triangle_super_bullet_speed,
        damage: triangle_super_damage, owner: 1, color: color(255, 255, 100),
        size: 30, maxDistance: Infinity, type: 'super-triangle',
        destroysWalls: true, rotation: 0
      });
      player1.superBulletCount--;
      player1.lastSuperBulletTime = millis();
      
      if (player1.superBulletCount <= 0) {
        player1.superActive = false;
      }
    }
  }
  
  if (player2Choice === 'triangle' && player2.superBulletCount > 0) {
    if (millis() - player2.lastSuperBulletTime > 50) {
      projectiles.push({
        x: player2.x, y: player2.y, startX: player2.x, startY: player2.y,
        vx: cos(player2.superTriangleTargetAngle) * triangle_super_bullet_speed,
        vy: sin(player2.superTriangleTargetAngle) * triangle_super_bullet_speed,
        damage: triangle_super_damage, owner: 2, color: color(255, 255, 100),
        size: 30, maxDistance: Infinity, type: 'super-triangle',
        destroysWalls: true, rotation: 0
      });
      player2.superBulletCount--;
      player2.lastSuperBulletTime = millis();
      
      if (player2.superBulletCount <= 0) {
        player2.superActive = false;
      }
    }
  }
}

function updateSuperOvalBullets() {
  if (player1Choice === 'oval' && player1.superBulletCount > 0) {
    if (millis() - player1.lastSuperBulletTime > 50) {
      projectiles.push({
        x: player1.x, y: player1.y, startX: player1.x, startY: player1.y,
        vx: cos(player1.superOvalTargetAngle) * oval_bullet_speed,
        vy: sin(player1.superOvalTargetAngle) * oval_bullet_speed,
        damage: oval_super_damage, owner: 1, color: color(255, 255, 100),
        size: 15, maxDistance: Infinity, type: 'super-oval',
        destroysWalls: false, bounces: 0, maxBounces: 5, rotation: 0
      });
      player1.superBulletCount--;
      player1.lastSuperBulletTime = millis();
      
      if (player1.superBulletCount <= 0) {
        player1.superActive = false;
      }
    }
  }
  
  if (player2Choice === 'oval' && player2.superBulletCount > 0) {
    if (millis() - player2.lastSuperBulletTime > 50) {
      projectiles.push({
        x: player2.x, y: player2.y, startX: player2.x, startY: player2.y,
        vx: cos(player2.superOvalTargetAngle) * oval_bullet_speed,
        vy: sin(player2.superOvalTargetAngle) * oval_bullet_speed,
        damage: oval_super_damage, owner: 2, color: color(255, 255, 100),
        size: 15, maxDistance: Infinity, type: 'super-oval',
        destroysWalls: false, bounces: 0, maxBounces: 5, rotation: 0
      });
      player2.superBulletCount--;
      player2.lastSuperBulletTime = millis();
      
      if (player2.superBulletCount <= 0) {
        player2.superActive = false;
      }
    }
  }
}

function updateDashes() {
  if (player1.isDashing) {
    player1.dashProgress += 0.15;
    
    if (player1.dashProgress >= 1) {
      player1.isDashing = false;
      player1.dashProgress = 0;
    } else {
      let newX = lerp(player1.dashStartX, player1.dashTargetX, player1.dashProgress);
      let newY = lerp(player1.dashStartY, player1.dashTargetY, player1.dashProgress);
      
      if (!checkCollision(newX, newY, player1.size)) {
        player1.x = newX;
        player1.y = newY;
        
        if (dist(player1.x, player1.y, player2.x, player2.y) < (player1.size + player2.size) / 2) {
          dealDamage(player2, trapezoid_damage, player1);
          player1.isDashing = false;
          screenShake = 10;
        }
      } else {
        player1.isDashing = false;
      }
    }
  }
  
  if (player2.isDashing) {
    player2.dashProgress += 0.15;
    
    if (player2.dashProgress >= 1) {
      player2.isDashing = false;
      player2.dashProgress = 0;
    } else {
      let newX = lerp(player2.dashStartX, player2.dashTargetX, player2.dashProgress);
      let newY = lerp(player2.dashStartY, player2.dashTargetY, player2.dashProgress);
      
      if (!checkCollision(newX, newY, player2.size)) {
        player2.x = newX;
        player2.y = newY;
        
        if (dist(player2.x, player2.y, player1.x, player1.y) < (player2.size + player1.size) / 2) {
          dealDamage(player1, trapezoid_damage, player2);
          player2.isDashing = false;
          screenShake = 10;
        }
      } else {
        player2.isDashing = false;
      }
    }
  }
}

function attack(attacker, target, shape, playerNum, isSuper) {
  let attackColor = playerNum === 1 ? color(100, 150, 255) : color(255, 50, 50);
  let opponent = playerNum === 1 ? player2 : player1;
  
  if (isSuper) {
    attackColor = color(255, 255, 100);
    screenShake = 8;
    addParticleBurst(attacker.x, attacker.y, 12, attackColor);
  }
  
  if (shape === 'square') {
    let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
    let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
    
    if (isSuper) {
      meleeEffects.push({
        x: attacker.x, y: attacker.y, angle: angle, color: attackColor,
        life: 30, maxLife: 30, size: attacker.size * 10
      });
      
      if (distance < attacker.size * 10) {
        dealDamage(opponent, square_super_damage, attacker);
        screenShake = 12;
      }
    } else {
      meleeEffects.push({
        x: attacker.x, y: attacker.y, angle: angle, color: attackColor,
        life: 20, maxLife: 20, size: 150
      });
      
      if (distance < 150) {
        dealDamage(opponent, square_damage, attacker);
        screenShake = 6;
      }
    }
  } else if (shape === 'triangle') {
    if (isSuper) {
      attacker.superTriangleTargetAngle = atan2(target.y - attacker.y, target.x - attacker.x);
      attacker.superBulletCount = 20;
      attacker.lastSuperBulletTime = millis();
    } else {
      attacker.triangleTargetAngle = atan2(target.y - attacker.y, target.x - attacker.x);
      attacker.triangleBulletCount = 10;
      attacker.lastBulletTime = millis();
    }
  } else if (shape === 'circle') {
    let angle = atan2(target.y - attacker.y, target.x - attacker.x);
    
    if (isSuper) {
      projectiles.push({
        x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y,
        vx: cos(angle) * circle_super_bullet_speed,
        vy: sin(angle) * circle_super_bullet_speed,
        damage: circle_super_damage, owner: playerNum, color: attackColor,
        size: attacker.size * 3, maxDistance: 700, type: 'super-circle',
        destroysWalls: true, rotation: 0
      });
    } else {
      projectiles.push({
        x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y,
        vx: cos(angle) * circle_bullet_speed,
        vy: sin(angle) * circle_bullet_speed,
        damage: circle_damage, owner: playerNum, color: attackColor,
        size: 20, maxDistance: 600, type: 'circle',
        destroysWalls: false, rotation: 0
      });
    }
  } else if (shape === 'oval') {
    if (isSuper) {
      attacker.superOvalTargetAngle = atan2(target.y - attacker.y, target.x - attacker.x);
      attacker.superBulletCount = 10;
      attacker.lastSuperBulletTime = millis();
    } else {
      attacker.ovalTargetAngle = atan2(target.y - attacker.y, target.x - attacker.x);
      attacker.ovalBulletCount = 10;
      attacker.lastBulletTime = millis();
    }
  } else if (shape === 'pentagon') {
    let angle = atan2(target.y - attacker.y, target.x - attacker.x);
    
    if (isSuper) {
      projectiles.push({
        x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y,
        vx: cos(angle) * pentagon_bullet_speed,
        vy: sin(angle) * pentagon_bullet_speed,
        damage: pentagon_super_damage, owner: playerNum, color: attackColor,
        size: attacker.size * 3, maxDistance: Infinity, type: 'super-pentagon',
        destroysWalls: false, goesThrough: true, rotation: 0
      });
    } else {
      projectiles.push({
        x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y,
        vx: cos(angle) * pentagon_bullet_speed,
        vy: sin(angle) * pentagon_bullet_speed,
        damage: pentagon_damage, owner: playerNum, color: attackColor,
        size: 20, maxDistance: Infinity, type: 'pentagon',
        destroysWalls: false, rotation: 0
      });
    }
  } else if (shape === 'star') {
    if (isSuper) {
      attacker.shieldActive = true;
      attacker.shieldStartTime = millis();
    } else {
      let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
      let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
      
      meleeEffects.push({
        x: attacker.x, y: attacker.y, angle: angle, color: attackColor,
        life: 20, maxLife: 20, size: 150
      });
      
      if (distance < 150) {
        dealDamage(opponent, star_damage, attacker);
        screenShake = 6;
      }
    }
  } else if (shape === 'rhombus') {
    if (isSuper) {
      // NEW: Rhombus super shoots a beam
      let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
      
      meleeEffects.push({
        x: attacker.x, y: attacker.y, angle: angle, color: attackColor,
        life: 40, maxLife: 40, size: 800, width: 60, isBeam: true
      });
      
      // Check if beam hits opponent
      let dx = opponent.x - attacker.x;
      let dy = opponent.y - attacker.y;
      let beamAngle = atan2(dy, dx);
      let angleDiff = abs(beamAngle - angle);
      
      if (angleDiff < 0.2 && dist(attacker.x, attacker.y, opponent.x, opponent.y) < 800) {
        dealDamage(opponent, rhombus_super_damage, attacker);
        screenShake = 12;
      }
    } else {
      if (attacker.rhombusMode === 1) {
        let angle = atan2(target.y - attacker.y, target.x - attacker.x);
        projectiles.push({
          x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y,
          vx: cos(angle) * rhombus_bullet_speed,
          vy: sin(angle) * rhombus_bullet_speed,
          damage: rhombus_damage, owner: playerNum, color: attackColor,
          size: 15, maxDistance: Infinity, type: 'rhombus-long',
          destroysWalls: false, rotation: 0
        });
      } else {
        // NEW: Circular attack with extra damage
        meleeEffects.push({
          x: attacker.x, y: attacker.y, angle: 0, color: attackColor,
          life: 20, maxLife: 20, size: rhombus_melee_range * 2,
          isCircular: true
        });
        
        let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
        if (distance < rhombus_melee_range) {
          dealDamage(opponent, rhombus_damage + rhombus_circular_extra_damage, attacker);
          screenShake = 8;
        }
      }
    }
  } else if (shape === 'octagon') {
    if (isSuper) {
      let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
      
      meleeEffects.push({
        x: attacker.x, y: attacker.y, angle: angle, color: attackColor,
        life: 30, maxLife: 30, size: 300, width: 80
      });
      
      // NEW: Pull all the way to attacker
      projectiles.push({
        x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y,
        vx: cos(angle) * 15, vy: sin(angle) * 15,
        damage: octagon_super_damage, owner: playerNum, color: attackColor,
        size: 40, maxDistance: Infinity, type: 'octagon-super-pull',
        destroysWalls: true, pullTarget: opponent, pullStrength: octagon_super_pull_strength, rotation: 0
      });
    } else {
      let angle = atan2(target.y - attacker.y, target.x - attacker.x);
      
      projectiles.push({
        x: attacker.x, y: attacker.y, startX: attacker.x, startY: attacker.y,
        vx: cos(angle) * octagon_bullet_speed,
        vy: sin(angle) * octagon_bullet_speed,
        damage: octagon_damage, owner: playerNum, color: attackColor,
        size: 20, maxDistance: Infinity, type: 'octagon-split',
        destroysWalls: false, hasSplit: false, rotation: 0
      });
    }
  } else if (shape === 'trapezoid') {
    if (isSuper) {
      let angle = atan2(opponent.y - attacker.y, opponent.x - attacker.x);
      
      meleeEffects.push({
        x: attacker.x, y: attacker.y, angle: angle, color: attackColor,
        life: 30, maxLife: 30, size: attacker.size * 10, width: 80
      });
      
      let distance = dist(attacker.x, attacker.y, opponent.x, opponent.y);
      if (distance < attacker.size * 10) {
        dealDamage(opponent, trapezoid_super_damage, attacker);
        screenShake = 10;
      }
    } else {
      let angle = atan2(target.y - attacker.y, target.x - attacker.x);
      attacker.isDashing = true;
      attacker.dashStartX = attacker.x;
      attacker.dashStartY = attacker.y;
      attacker.dashTargetX = attacker.x + cos(angle) * trapezoid_dash_distance;
      attacker.dashTargetY = attacker.y + sin(angle) * trapezoid_dash_distance;
      attacker.dashProgress = 0;
      
      meleeEffects.push({
        x: attacker.x, y: attacker.y, angle: angle, color: attackColor,
        life: 15, maxLife: 15, size: 80, isDash: true
      });
    }
  }
}

function updateMeleeEffects() {
  for (let i = meleeEffects.length - 1; i >= 0; i--) {
    meleeEffects[i].life--;
    if (meleeEffects[i].life <= 0) {
      meleeEffects.splice(i, 1);
    }
  }
}

function drawMeleeEffects() {
  for (let effect of meleeEffects) {
    let alpha = map(effect.life, 0, effect.maxLife, 0, 200);
    let size = effect.size || 150;
    
    push();
    translate(effect.x, effect.y);
    
    if (effect.isCircular) {
      noFill();
      stroke(red(effect.color), green(effect.color), blue(effect.color), alpha);
      strokeWeight(8);
      circle(0, 0, size);
    } else if (effect.isBeam) {
      // NEW: Draw beam for rhombus super
      rotate(effect.angle);
      noFill();
      stroke(red(effect.color), green(effect.color), blue(effect.color), alpha);
      strokeWeight(effect.width);
      line(0, 0, size, 0);
      
      // Glow effect
      stroke(255, 255, 255, alpha * 0.5);
      strokeWeight(effect.width * 0.5);
      line(0, 0, size, 0);
    } else if (effect.width) {
      rotate(effect.angle);
      noFill();
      stroke(red(effect.color), green(effect.color), blue(effect.color), alpha);
      strokeWeight(effect.width);
      line(0, 0, size, 0);
    } else if (effect.isDash) {
      rotate(effect.angle);
      noFill();
      stroke(red(effect.color), green(effect.color), blue(effect.color), alpha);
      strokeWeight(10);
      line(0, 0, size, 0);
    } else {
      rotate(effect.angle);
      noFill();
      stroke(red(effect.color), green(effect.color), blue(effect.color), alpha);
      strokeWeight(8);
      arc(0, 0, size, size, -PI/4, PI/4);
    }
    
    pop();
  }
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let proj = projectiles[i];
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.rotation += 0.12;
    
    if (proj.type === 'octagon-split' && !proj.hasSplit) {
      let distTraveled = dist(proj.x, proj.y, proj.startX, proj.startY);
      if (distTraveled >= octagon_split_distance) {
        proj.hasSplit = true;
        
        for (let j = 0; j < 10; j++) {
          let angle = (TWO_PI / 10) * j;
          projectiles.push({
            x: proj.x, y: proj.y, startX: proj.x, startY: proj.y,
            vx: cos(angle) * 10, vy: sin(angle) * 10,
            damage: octagon_split_damage, owner: proj.owner, color: proj.color,
            size: 8, maxDistance: 300, type: 'octagon-small',
            destroysWalls: false, rotation: angle
          });
        }
        
        projectiles.splice(i, 1);
        screenShake = 5;
        continue;
      }
    }
    
    if (proj.type === 'octagon-super-pull' && proj.pullTarget) {
      let pullAngle = atan2(proj.startY - proj.pullTarget.y, proj.startX - proj.pullTarget.x);
      
      let newX = proj.pullTarget.x + cos(pullAngle) * proj.pullStrength;
      let newY = proj.pullTarget.y + sin(pullAngle) * proj.pullStrength;
      
      for (let wall of walls) {
        let wallCenterX = wall.x + wall.w / 2;
        let wallCenterY = wall.y + wall.h / 2;
        
        let linearDist = dist(proj.pullTarget.x, proj.pullTarget.y, wallCenterX, wallCenterY);
        
        if (linearDist < 80 && !wall.isBorder) {
          destroyWall(wall);
        }
      }
      
      if (!checkCollision(newX, newY, proj.pullTarget.size)) {
        proj.pullTarget.x = newX;
        proj.pullTarget.y = newY;
      }
      
      let distance = dist(proj.x, proj.y, proj.pullTarget.x, proj.pullTarget.y);
      
      if (distance < proj.size + proj.pullTarget.size + 10) {
        dealDamage(proj.pullTarget, proj.damage, proj.owner === 1 ? player1 : player2);
        projectiles.splice(i, 1);
        screenShake = 12;
        continue;
      }
    }
    
    if (proj.maxDistance && proj.maxDistance !== Infinity) {
      let distTraveled = dist(proj.x, proj.y, proj.startX, proj.startY);
      if (distTraveled > proj.maxDistance) {
        if (proj.type === 'circle' || proj.type === 'super-circle') {
          createExplosion(proj.x, proj.y, proj.owner, proj.color);
        }
        projectiles.splice(i, 1);
        continue;
      }
    }
    
    let wallHit = checkWallCollision(proj.x, proj.y, proj.size);
    if (wallHit && !proj.goesThrough) {
      if ((proj.type === 'oval' || proj.type === 'super-oval') && proj.bounces < proj.maxBounces) {
        bounceProjectile(proj, wallHit);
        proj.bounces++;
        screenShake = 3;
        continue;
      }
      
      if (proj.destroysWalls && !wallHit.isBorder) {
        destroyWall(wallHit);
      }
      
      if (proj.type === 'circle' || proj.type === 'super-circle') {
        createExplosion(proj.x, proj.y, proj.owner, proj.color);
      }
      
      if (!proj.destroysWalls || wallHit.isBorder) {
        projectiles.splice(i, 1);
        continue;
      }
    }
    
    let shieldHit = checkShieldCollision(proj);
    if (shieldHit) {
      proj.vx *= -1;
      proj.vy *= -1;
      proj.damage *= 2;
      proj.owner = shieldHit.owner;
      proj.color = shieldHit.color;
      screenShake = 5;
      continue;
    }
    
    if (proj.owner === 1) {
      if (dist(proj.x, proj.y, player2.x, player2.y) < (proj.size + player2.size) / 2) {
        dealDamage(player2, proj.damage, player1);
        
        if (proj.type === 'circle' || proj.type === 'super-circle') {
          createExplosion(proj.x, proj.y, proj.owner, proj.color);
        }
        projectiles.splice(i, 1);
        screenShake = 6;
        continue;
      }
    } else {
      if (dist(proj.x, proj.y, player1.x, player1.y) < (proj.size + player1.size) / 2) {
        dealDamage(player1, proj.damage, player2);
        
        if (proj.type === 'circle' || proj.type === 'super-circle') {
          createExplosion(proj.x, proj.y, proj.owner, proj.color);
        }
        projectiles.splice(i, 1);
        screenShake = 6;
        continue;
      }
    }
    
    if (proj.x < -50 || proj.x > width + 50 || proj.y < -50 || proj.y > height + 50) {
      if (proj.type === 'circle' || proj.type === 'super-circle') {
        createExplosion(proj.x, proj.y, proj.owner, proj.color);
      }
      projectiles.splice(i, 1);
    }
  }
}

function drawProjectiles() {
  for (let proj of projectiles) {
    push();
    fill(proj.color);
    stroke(255, 255, 255, 180);
    strokeWeight(2);
    
    push();
    translate(proj.x, proj.y);
    
    if (proj.type === 'oval' || proj.type === 'super-oval') {
      let angle = atan2(proj.vy, proj.vx);
      rotate(angle);
      ellipse(0, 0, proj.size * 1.5, proj.size);
    } else if (proj.type === 'pentagon' || proj.type === 'super-pentagon') {
      rotate(proj.rotation);
      beginShape();
      for (let i = 0; i < 5; i++) {
        let angle = (TWO_PI / 5) * i - PI/2;
        vertex(cos(angle) * proj.size/2, sin(angle) * proj.size/2);
      }
      endShape(CLOSE);
    } else {
      circle(0, 0, proj.size);
    }
    
    pop();
    pop();
  }
}

function createExplosion(x, y, owner, color) {
  addParticleBurst(x, y, 15, color);
  
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i;
    projectiles.push({
      x: x, y: y, startX: x, startY: y,
      vx: cos(angle) * 12, vy: sin(angle) * 12,
      damage: circle_explosion_spike_damage, owner: owner, color: color,
      size: 10, maxDistance: 200, type: 'spike',
      destroysWalls: false, rotation: angle
    });
  }
  
  screenShake = 10;
}

function destroyWall(wall) {
  if (wall.isBorder) return;
  
  let index = walls.indexOf(wall);
  if (index > -1) {
    walls.splice(index, 1);
  }
}

function bounceProjectile(proj, wall) {
  let wallCenterX = wall.x + wall.w / 2;
  let wallCenterY = wall.y + wall.h / 2;
  
  let dx = proj.x - wallCenterX;
  let dy = proj.y - wallCenterY;
  
  if (abs(dx) > abs(dy)) {
    proj.vx *= -1;
  } else {
    proj.vy *= -1;
  }
  
  proj.x += proj.vx * 2;
  proj.y += proj.vy * 2;
}

function checkWallCollision(x, y, size) {
  let halfSize = size / 2;
  
  for (let wall of walls) {
    if (x + halfSize > wall.x && x - halfSize < wall.x + wall.w &&
        y + halfSize > wall.y && y - halfSize < wall.y + wall.h) {
      return wall;
    }
  }
  return null;
}

function checkCollision(x, y, size) {
  return checkWallCollision(x, y, size) !== null;
}

function checkShieldCollision(proj) {
  if (player1.shieldActive && proj.owner !== 1) {
    if (dist(proj.x, proj.y, player1.x, player1.y) < player1.size + 20) {
      return {owner: 1, color: color(100, 150, 255)};
    }
  }
  
  if (player2.shieldActive && proj.owner !== 2) {
    if (dist(proj.x, proj.y, player2.x, player2.y) < player2.size + 20) {
      return {owner: 2, color: color(255, 50, 50)};
    }
  }
  
  return null;
}

function keyPressed() {
  if (gameState === 'playing' && gameMode === 'two') {
    if (keyCode === 67) {
      let p1Cooldown = (player1Choice === 'triangle' || player1Choice === 'oval') ? 2000 : 1000;
      if (millis() - player1.lastAttack > p1Cooldown && !player1.isDashing) {
        let targetX = player2.x;
        let targetY = player2.y;
        attack(player1, {x: targetX, y: targetY}, player1Choice, 1, false);
        player1.lastAttack = millis();
        player1.lastMoveTime = millis();
      }
    } else if (keyCode === 188) {
      let p2Cooldown = (player2Choice === 'triangle' || player2Choice === 'oval') ? 2000 : 1000;
      if (millis() - player2.lastAttack > p2Cooldown && !player2.isDashing) {
        let targetX = player1.x;
        let targetY = player1.y;
        attack(player2, {x: targetX, y: targetY}, player2Choice, 2, false);
        player2.lastAttack = millis();
        player2.lastMoveTime = millis();
      }
    }
  }
}