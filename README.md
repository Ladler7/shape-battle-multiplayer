# Shape Battle - Multiplayer Arena Game

A real-time multiplayer arena combat game where players battle using different geometric shapes, each with unique abilities.

## 🎮 Game Modes

- **Single Player** - Fight against an AI bot
- **Local 2 Player** - Play with a friend on the same computer
- **Online Multiplayer** - Battle against real players over the internet

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Server**
```bash
npm start
```

3. **Open the Game**
   - Open your browser and go to: `http://localhost:3000`
   - Open another browser window/tab for testing multiplayer locally

## 📦 Project Structure

```
shape-battle-multiplayer/
├── server.js              # Node.js backend server
├── game-multiplayer.js    # Modified game code with multiplayer support
├── index.html             # HTML wrapper
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## 🌐 Deploying to the Cloud

### Option 1: Deploy to Heroku (Free Tier Available)

1. **Create a Heroku Account**
   - Sign up at https://heroku.com

2. **Install Heroku CLI**
```bash
# On Mac
brew install heroku/brew/heroku

# On Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

3. **Deploy**
```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-shape-battle-game

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main

# Open your game
heroku open
```

4. **Update Client Connection**
   - In `game-multiplayer.js`, change the socket connection:
   ```javascript
   socket = io('https://your-shape-battle-game.herokuapp.com');
   ```

### Option 2: Deploy to Render (Free Tier Available)

1. **Create a Render Account**
   - Sign up at https://render.com

2. **Create New Web Service**
   - Connect your GitHub repository
   - Choose "Node" as the environment
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Update Client Connection**
   - In `game-multiplayer.js`, change:
   ```javascript
   socket = io('https://your-app.onrender.com');
   ```

### Option 3: Deploy to Railway (Free Tier Available)

1. **Create Railway Account**
   - Sign up at https://railway.app

2. **Deploy from GitHub**
   - Connect your repository
   - Railway will auto-detect Node.js and deploy

3. **Update Client Connection**
   - Use the provided Railway URL in your socket connection

### Option 4: Deploy to DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Sign up at https://digitalocean.com

2. **Create New App**
   - Connect GitHub repository
   - Choose Node.js
   - Set run command: `npm start`

3. **Update Client Connection**
   - Use provided App Platform URL

## 🔧 Configuration

### Server Configuration

Edit `server.js` to change:
- Port number (default: 3000)
- CORS settings
- Game room settings

### Client Configuration

Edit `game-multiplayer.js` to change:
- Server URL connection
- Game balance variables
- Visual settings

## 🎯 How Multiplayer Works

1. **Matchmaking**
   - Players click "Online Multiplayer"
   - Server puts them in a waiting queue
   - When 2 players are available, creates a game room

2. **Character Selection**
   - Each player chooses their character
   - Opponent's choice is synced in real-time

3. **Game Synchronization**
   - Player positions sent every other frame
   - Attacks and projectiles synced
   - Health updates verified by server
   - Winner determined server-side

4. **Disconnection Handling**
   - If a player disconnects, opponent is notified
   - Game room is cleaned up

## 🔑 Key Multiplayer Features Implemented

### Server-Side
- ✅ WebSocket connections via Socket.io
- ✅ Matchmaking queue system
- ✅ Game room management
- ✅ Player state synchronization
- ✅ Attack/damage verification
- ✅ Disconnection handling

### Client-Side
- ✅ Connection status indicator
- ✅ Waiting screen
- ✅ Character selection sync
- ✅ Real-time position updates
- ✅ Attack synchronization
- ✅ Health bar updates
- ✅ Winner determination

## 🎨 Game Controls

### Single Player & Online
- **WASD** - Move
- **Left Click** - Attack
- **Spacebar** - Super Attack

### Local 2 Player
- **Player 1**: WASD (move), C (attack), V (super)
- **Player 2**: Arrow Keys (move), , (attack), . (super)

## 🐛 Troubleshooting

### Connection Issues
- Make sure server is running
- Check firewall settings
- Verify correct server URL in client code

### Game Not Syncing
- Check browser console for errors
- Ensure both clients are connected to same server
- Try refreshing the page

### Performance Issues
- Lower particle effects in code
- Reduce network update frequency
- Use a faster hosting service

## 📝 Future Enhancements

Possible improvements:
- [ ] Ranked matchmaking system
- [ ] Persistent player accounts
- [ ] Leaderboards
- [ ] Spectator mode
- [ ] Tournament brackets
- [ ] Voice chat
- [ ] Mobile responsive controls
- [ ] Custom game modes
- [ ] Replay system

## 🔒 Security Considerations

For production deployment:
- Implement rate limiting
- Add player authentication
- Validate all client inputs server-side
- Use environment variables for sensitive data
- Enable HTTPS
- Add anti-cheat measures

## 📄 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 💡 Tips for Best Experience

1. **Low Latency** - Deploy server geographically close to players
2. **Test Locally First** - Ensure everything works before deploying
3. **Monitor Resources** - Keep an eye on server CPU/memory usage
4. **Optimize Network** - Reduce data sent per frame if lag occurs

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Review server logs
3. Ensure latest Node.js version
4. Try different browsers

---

**Have fun battling! 🎮⚔️**
