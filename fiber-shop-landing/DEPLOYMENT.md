# FiberAgent Deployment Guide

## Step 1: Create GitHub Account & Repository

### Create GitHub Account
1. Go to https://github.com/signup
2. Enter your email, create password, choose username
3. Verify email
4. **Done!**

### Create Repository
1. Go to https://github.com/new
2. Repository name: `fetch-platform` or `fiber-shop`
3. Description: `Agent-powered commerce platform with crypto rewards`
4. Make it **Public**
5. Click "Create Repository"
6. **Copy the repository URL** (you'll need it)

## Step 2: Push Code to GitHub

```bash
# Navigate to project folder
cd /path/to/fiber-shop-landing

# Configure git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FiberAgent platform for Moltiverse hackathon"

# Add GitHub remote (replace YOUR_REPO_URL)
git remote add origin https://github.com/YourUsername/fetch-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Done!** Your code is now on GitHub.

---

## Step 3: Deploy Frontend (Vercel - Recommended)

### Via Vercel CLI

```bash
# Install Vercel CLI (first time)
npm i -g vercel

# From project root
cd fiber-shop-landing

# Deploy
vercel
```

Follow prompts:
- Link to GitHub repo? → **Yes**
- Set production domain? → Choose domain
- Framework: React
- Source: ./
- Build: `npm run build`
- Output: `build`

**Frontend live on:** `https://your-domain.vercel.app`

### Configure API URL

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add: `REACT_APP_API_URL=https://your-api.railway.app`
3. Redeploy

---

## Step 4: Deploy API (Railway - Recommended)

### Via Railway Dashboard

1. Go to https://railway.app
2. Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your `fetch-platform` repository
6. **Configure:**
   - **Start command**: `npm run api`
   - **Port**: 5000
7. Add environment variables (if needed):
   - `NODE_ENV=production`
   - `PORT=5000`
8. Deploy

**API live on:** `https://your-project.railway.app`

### Update Frontend

Update `.env.production`:
```env
REACT_APP_API_URL=https://your-project.railway.app
```

Redeploy frontend on Vercel.

---

## Alternative: Heroku Deployment

### Frontend (Heroku with Buildpack)
```bash
# Create Heroku app
heroku create your-fetch-frontend

# Deploy
git push heroku main

# Open
heroku open
```

### API (Heroku)
```bash
# Create Procfile in root
echo "web: npm run api" > Procfile

# Create app
heroku create your-fetch-api

# Deploy
git push heroku main

# Get URL
heroku info -a your-fetch-api
```

---

## Alternative: Docker + Any Cloud Provider

### Build Docker Image
```bash
# From root directory
docker build -t fetch-platform .

# Test locally
docker run -p 3000:3000 -p 5000:5000 fetch-platform
```

### Deploy to:
- **Google Cloud Run**: `gcloud run deploy fetch-platform --source .`
- **AWS ECS**: Push to ECR, create task
- **DigitalOcean App Platform**: Connect GitHub repo
- **Render.com**: Connect GitHub repo, select Docker

---

## Step 5: Verify Deployment

### Check Frontend
```bash
curl https://your-domain.vercel.app/
# Should return HTML homepage
```

### Check API
```bash
curl https://your-api.railway.app/api/health
# Should return: {"status":"healthy",...}
```

### Check Connectivity
Visit frontend, go to `/demo`, try API calls. Should work without errors.

---

## Environment Variables (Production)

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-api-domain.com
```

### API (.env on server)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=./fetch.db
```

---

## Continuous Deployment

### Auto-Deploy on GitHub Push

**Vercel:**
- Automatically deploys on push to `main`
- No setup needed

**Railway:**
- Auto-deploys on push to `main`
- Configure in Railway dashboard

**Heroku:**
- Auto-deploys on push to `main` branch
- Enable in Heroku dashboard

---

## Database Persistence

### Railway
- Filesystem persists across deployments ✅
- SQLite file stored in container

### Heroku
- Ephemeral filesystem (resets on dyno restart)
- **Solution**: Use Railway PostgreSQL or MongoDB

### Production Recommendation
- Replace SQLite with PostgreSQL
- Add database URL to env variables
- Update `server/api.js` to use node-postgres

---

## Domain Setup (Optional)

### Connect Custom Domain

**Vercel:**
1. Go to project Settings → Domains
2. Add custom domain
3. Update DNS records (Vercel provides instructions)

**Railway:**
1. Go to Settings → Custom Domain
2. Add domain
3. Update DNS CNAME record

---

## Monitoring & Logs

### Vercel
- Dashboard → Deployments → Logs tab
- Check build and runtime logs

### Railway
- Dashboard → Logs tab
- Real-time log streaming

### Heroku
```bash
heroku logs --tail -a your-app-name
```

---

## Cost Estimate

- **Vercel**: $0/month (free tier includes 100GB bandwidth)
- **Railway**: $5/month (free tier includes $5 credit)
- **Heroku**: $7-50/month (free tier deprecated)
- **Total**: ~$5-10/month for production

---

## Troubleshooting

### API Returns 404
- Check `REACT_APP_API_URL` is correct in frontend
- Verify API is running: `curl https://api-url/api/health`
- Check CORS settings in `server/api.js`

### Database Errors
- Ensure SQLite file exists in API server
- Check file permissions
- Or migrate to PostgreSQL

### Build Fails
- Check `npm install` works locally
- Verify Node version matches (v22+)
- Check `.gitignore` isn't excluding needed files

### Deployment Stalls
- Check logs in platform dashboard
- Verify no `console.log` infinite loops
- Ensure start script is correct

---

## Next Steps

1. ✅ Create GitHub account & repository
2. ✅ Push code to GitHub
3. ✅ Deploy frontend to Vercel
4. ✅ Deploy API to Railway
5. ✅ Test live URLs
6. ✅ Share with judges!

**Demo links to share:**
- Frontend: `https://your-domain.vercel.app`
- API Health: `https://your-api.railway.app/api/health`
- Stats: `https://your-domain.vercel.app/stats`

---

**Questions?** Check platform documentation or run locally first to debug.

Good luck at Moltiverse! 🚀
