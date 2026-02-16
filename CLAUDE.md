# Shape Battle Multiplayer

## Project Overview
A 1v1 online multiplayer shape battle arena game. Players pick a shape character, then fight in real-time on a shared map with projectiles, melee attacks, and super abilities.

## Tech Stack
- **Frontend:** p5.js for canvas rendering, Socket.IO client for networking
- **Backend:** Node.js, Express, Socket.IO
- **No build step** — plain JS served statically

## Project Structure
- `server.js` — Express server + Socket.IO game logic (matchmaking, game state, damage/health sync)
- `index.html` — Client HTML + CSS (styles, connection status UI, shape selection screen)
- `game-multiplayer.js` — All client-side game logic (~1800 lines): rendering, input, physics, AI bot, shapes, attacks, particles

## Running the Project
```bash
npm install
npm start        # production: node server.js
npm run dev      # development: nodemon server.js
```
Server runs on `http://localhost:3000` by default (PORT env var supported).

## Architecture

### Server (server.js)
- Matchmaking queue (`waitingPlayers` array) pairs players into `Game` instances
- `Game` class tracks both players' state: health (9000 HP), super charge, position, shape choice
- Server is authoritative for health/damage — clients send `damage-dealt` events, server validates and broadcasts `health-update`
- Game states flow: `selection` → `countdown` → `playing` → `finished`
- Map seed is generated server-side and sent to both clients so walls are identical

### Client (game-multiplayer.js)
- Uses a base resolution of 1280x720 with a `scaleFactor` for responsive scaling
- Coordinate system: all game logic uses "base" coordinates, converted to screen with `toScreenX/Y/Size` helpers
- Game states: `modeSelection` → `p1Select` → `p2Select`/`waitingForMatch` → `countdown` → `playing` → `gameOver`
- Supports both local (vs bot) and online multiplayer modes

### Playable Shapes
square, triangle, circle, oval, pentagon, star, rhombus, octagon, trapezoid — each with unique attacks, movement speeds, and super abilities.

### Key Socket Events
- `find-match` / `match-found` / `waiting-for-opponent` — matchmaking
- `character-selected` / `opponent-selected` / `start-countdown` — lobby
- `player-update` / `opponent-update` — position/rotation sync
- `player-attack` / `opponent-attack` — attack sync
- `projectile-created` / `projectile-sync` — projectile sync
- `damage-dealt` / `health-update` — server-authoritative damage
- `game-over` / `opponent-disconnected` — end states

## Game Balance
All damage/speed values are defined as global variables at the top of `game-multiplayer.js` (e.g., `square_damage`, `triangle_bullet_speed`). Adjust these to tune balance.

## Conventions
- No TypeScript, no bundler — keep it simple vanilla JS
- All game coordinates use the base 1280x720 system, never raw screen pixels
- Health is 9000 HP for all shapes
- Super charge maxes at 4, built by dealing/taking damage
