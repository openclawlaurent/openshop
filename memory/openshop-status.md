# OpenShop Project Status

**Project:** OpenShop - OpenClaw agent for Moltiverse hackathon
**Location:** `/home/nuc/.openclaw/workspace-fiber/fiber-shop-landing`
**Status:** ✅ Core build complete, awaiting GitHub push and deployment

## Immediate Next Steps

1. **GitHub:** Push code (awaiting user GitHub account creation)
   ```bash
   cd /home/nuc/.openclaw/workspace-fiber/fiber-shop-landing
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   git remote add origin https://github.com/YourUsername/openshop.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy Frontend:** Vercel
   - Run: `npm i -g vercel && vercel` in project root
   - Connect to GitHub repo during setup

3. **Deploy API:** Railway (railway.app)
   - Create project, select GitHub repo
   - Set start command to `npm run api`
   - Set environment variable: `NODE_ENV=production`

4. **Post-Deploy:** Update `REACT_APP_API_URL` in Vercel env vars and redeploy

## Architecture

**Frontend:** React with Router (`/`, `/demo`, `/agent`, `/user`, `/stats`)
**Backend:** Express.js + SQLite (port 5000)
**Database:** SQLite at `server/openshop.db`

### Key Components

| File | Purpose |
|------|---------|
| `src/App.js` | React Router with 4 main routes |
| `server/api.js` | Express API, 9 endpoints, SQLite setup |
| `src/pages/LandingPage.js` | Hero, benefits, stats, how-it-works |
| `src/pages/DemoPage.js` | ConversationDemo + AgentApiDemo |
| `src/pages/AgentPage.js` | Blockchain/token selector, earnings |
| `src/components/StatisticsPage.js` | KPI grid, leaderboard, insights |
| `src/components/Navigation.js` | Sticky header with routes |

## Multi-Chain Support

**Blockchains:** Solana, Monad (default)
**Tokens:**
- Solana: SOL, MF, AOL, USDC, BONK, USD1, VALOR, PENGU
- Monad: MON (primary)

```javascript
const blockchainTokens = {
  'solana': ['SOL', 'MF', 'AOL', 'USDC', 'BONK', 'USD1', 'VALOR', 'PENGU'],
  'monad': ['MON']
};
```

## Design

**Colors:** Cyan #00f0ff, Green #22c55e on dark navy #0a0e27
**Style:** Glassmorphism with animations, responsive
**Typography:** Inter/system fonts with proper hierarchy

## API Endpoints (Express.js)

1. `POST /api/agent/register` - Register agent (handles duplicates with UPDATE)
2. `POST /api/agent/search` - Search products (tracks searches)
3. `POST /api/agent/product-details` - Get affiliate link
4. `POST /api/agent/track-purchase` - Log purchase, calculate reward
5. `GET /api/agent/earnings/:agent_id` - Earnings history
6. `GET /api/stats` - Network statistics
7. `GET /api/leaderboard` - Top agents by earnings
8. `GET /api/agents` - List all agents
9. `GET /api/health` - Health check

## Mock Data

- 5 demo agents: agent_claude, agent_gpt, agent_gemini, agent_alex, agent_nova
- 60 tracked purchases (10-15 per agent)
- 382+ MON distributed
- Average 76.46 MON per agent
- 20-25 sample search queries

## Key Decisions

- **Mock API:** Hardcoded product data (sufficient for hackathon)
- **SQLite:** Persistent database, production-ready
- **Affiliate Links:** `https://adidas.com?ref=agent_id`
- **Cashback:** 2-5% per product, calculated server-side
- **URL Routing:** React Router with dedicated pages
- **Statistics:** Granular tracking at API level
- **Deployment:** Vercel (frontend) + Railway (API)

## Running Locally

```bash
# Terminal 1: Frontend
cd fiber-shop-landing
npm start
# Runs on http://localhost:3000

# Terminal 2: API
cd fiber-shop-landing
npm run api
# Runs on http://localhost:5000
```

## Documentation

- `README.md` - Features, setup, stack, API docs
- `DEPLOYMENT.md` - Step-by-step deployment guide
- `API_DOCUMENTATION.md` - Endpoint specs
- `.gitignore` - Excludes node_modules, *.db, .env

## Production URLs (Once Deployed)

- Frontend: `https://your-domain.vercel.app`
- API Health: `https://your-api.railway.app/api/health`
- Stats Page: `https://your-domain.vercel.app/stats`

## Git Status

- Repository initialized locally with initial commit
- 38 files tracked
- Ready to push when user has GitHub account
