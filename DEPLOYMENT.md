# Deployment Guide - Shape Battle Multiplayer

This guide covers deploying your multiplayer game to various cloud platforms.

## 🚀 Prerequisites

Before deploying, ensure:
- [ ] Your game works locally (`npm start` and test at localhost:3000)
- [ ] You have a GitHub account
- [ ] Your code is in a Git repository

## Platform-Specific Deployment

---

## 1. Heroku Deployment (Recommended for Beginners)

### Step 1: Prepare Your Code

Add a `Procfile` to your project root:
```
web: node server.js
```

### Step 2: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows (download installer from heroku.com)
# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 3: Deploy
```bash
# Login
heroku login

# Create app
heroku create shape-battle-[your-name]

# Deploy
git add .
git commit -m "Ready for deployment"
git push heroku main

# Open your app
heroku open
```

### Step 4: Update Client URL
In `game-multiplayer.js`, find this line:
```javascript
socket = io('http://localhost:3000');
```

Change to:
```javascript
socket = io('https://shape-battle-[your-name].herokuapp.com');
```

Then redeploy:
```bash
git add .
git commit -m "Update socket URL"
git push heroku main
```

### Troubleshooting Heroku
- View logs: `heroku logs --tail`
- Check dyno status: `heroku ps`
- Restart: `heroku restart`

---

## 2. Render Deployment (Free, Easy)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/shape-battle.git
git push -u origin main
```

### Step 2: Create Render Service
1. Go to https://render.com
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: shape-battle
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Get your URL: `https://shape-battle.onrender.com`

### Step 4: Update Socket URL
In `game-multiplayer.js`:
```javascript
socket = io('https://shape-battle.onrender.com');
```

Commit and push to GitHub (Render auto-deploys on push).

### Render Notes
- ⚠️ Free tier spins down after inactivity (first request takes 30-60 seconds)
- Logs available in Render dashboard
- Environment variables in "Environment" tab

---

## 3. Railway Deployment (Fast & Simple)

### Step 1: Push to GitHub (if not done)
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Step 2: Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway auto-detects Node.js

### Step 3: Get Your URL
- Click on your deployment
- Go to "Settings" → "Generate Domain"
- Copy the URL

### Step 4: Update Socket URL
```javascript
socket = io('https://your-project.up.railway.app');
```

### Railway Notes
- $5 free credit per month
- Great performance
- Easy environment variables

---

## 4. DigitalOcean App Platform

### Step 1: Push to GitHub

### Step 2: Create App
1. Go to https://cloud.digitalocean.com
2. Click "Apps" → "Create App"
3. Connect GitHub
4. Choose repository
5. Configure:
   - **Type**: Web Service
   - **Run Command**: `npm start`
   - **HTTP Port**: 3000

### Step 3: Deploy
- Click "Next" through setup
- Review and "Create Resources"
- Wait for deployment

### Step 4: Update Socket URL
Use provided App URL in your socket connection.

### DigitalOcean Notes
- $5/month minimum
- Better performance than free tiers
- Includes monitoring

---

## 5. Vercel Deployment

⚠️ **Note**: Vercel is designed for serverless, which makes WebSocket apps challenging. Not recommended for this project, but here's how if you must:

### Alternative: Use Vercel for Frontend + Separate Backend

1. Deploy backend to Railway/Render
2. Deploy frontend (HTML/JS only) to Vercel
3. Point frontend to backend URL

---

## 6. AWS Elastic Beanstalk (Advanced)

### Step 1: Install AWS CLI and EB CLI
```bash
pip install awsebcli
```

### Step 2: Initialize
```bash
eb init
# Follow prompts
```

### Step 3: Create Environment
```bash
eb create shape-battle-env
```

### Step 4: Deploy
```bash
eb deploy
```

### Step 5: Open
```bash
eb open
```

---

## 🔧 Post-Deployment Checklist

After deploying to any platform:

- [ ] Test connection at your live URL
- [ ] Try matchmaking with 2 browser windows
- [ ] Verify all game modes work
- [ ] Check for console errors
- [ ] Test on mobile (if applicable)
- [ ] Monitor server resources
- [ ] Set up error logging
- [ ] Configure custom domain (optional)

---

## 🌐 Custom Domain Setup

### Heroku
```bash
heroku domains:add www.yourdomain.com
# Add CNAME record in your DNS provider
```

### Render
1. Go to dashboard → "Settings"
2. "Custom Domains"
3. Add domain and follow DNS instructions

### Railway
1. Project settings → "Domains"
2. Add custom domain
3. Configure DNS

---

## 📊 Monitoring Your Deployment

### Check Server Health
```bash
# Heroku
heroku logs --tail

# Check for errors
heroku logs --tail | grep "ERROR"
```

### Important Metrics to Monitor
- Response time
- Active connections
- Error rate
- Memory usage
- CPU usage

---

## 🔐 Production Best Practices

### 1. Environment Variables
Never hardcode:
- Server URLs
- API keys
- Database credentials

Use `.env` files:
```javascript
const PORT = process.env.PORT || 3000;
```

### 2. Enable HTTPS
All platforms above provide HTTPS automatically.

### 3. Rate Limiting
Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### 4. Error Handling
```javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
```

---

## 🐛 Common Deployment Issues

### Issue: "Application Error" or "Cannot GET /"
**Solution**: Check server logs, ensure `server.js` starts correctly

### Issue: "WebSocket connection failed"
**Solution**: 
- Verify socket URL is correct
- Check CORS settings
- Ensure HTTPS if site uses HTTPS

### Issue: "Port already in use"
**Solution**: 
```javascript
const PORT = process.env.PORT || 3000;
```

### Issue: High latency
**Solution**:
- Deploy closer to your users
- Reduce data sent per network update
- Optimize game logic

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Starting | WebSockets | Auto-Sleep |
|----------|-----------|---------------|------------|------------|
| Heroku | 550 hours/month | $7/month | ✅ | After 30 min |
| Render | Yes | $7/month | ✅ | After 15 min |
| Railway | $5 credit/month | $5/month | ✅ | No |
| DigitalOcean | - | $5/month | ✅ | No |
| Vercel | Yes | $20/month | ⚠️ Limited | No |

---

## 🎯 Recommended Deployment Path

**For Testing**: Render (free, easy)
**For Production**: Railway or DigitalOcean (reliable, no sleep)
**For Scale**: AWS or DigitalOcean with load balancer

---

## 📞 Getting Help

If deployment fails:
1. Check platform-specific logs
2. Review error messages
3. Search platform's documentation
4. Check community forums
5. Contact platform support

---

**Good luck with your deployment! 🚀**
