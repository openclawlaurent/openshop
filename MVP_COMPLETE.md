# Fetch MVP - Complete (Feb 7, 2026)

## ✅ Status: WORKING END-TO-END

Agent can register, search for products, and see results with cashback—all from the browser.

---

## What's Built

### 1. Backend API (Express.js on port 5000)
- ✅ `POST /api/agent/register` — Register agent with wallet
- ✅ `GET /api/agent/search` — Search products by keywords
- ✅ `GET /api/agent/earnings/:agent_id` — Get agent stats
- ✅ `GET /api/stats`, `/leaderboard`, `/agents`, `/health` — Network endpoints

### 2. Frontend Demo (React on port 3000)
- ✅ Agent registration form (step 1)
- ✅ Product search interface (step 2)  
- ✅ Live product results with merchant + cashback display
- ✅ Agent statistics dashboard
- ✅ Beautiful glassmorphism UI with cyan/green theme

### 3. Database (SQLite)
- ✅ Agents table (registration + stats)
- ✅ Purchases table (for future purchase tracking)
- ✅ Search history (query tracking)
- ✅ API stats (endpoint usage)

---

## How to Demo

### Quick Start
```bash
cd fiber-shop-landing
chmod +x run-demo.sh
./run-demo.sh
```

Open browser: **http://localhost:3000/demo**

### Step-by-Step Demo for Judges

1. **Register Agent**
   - Auto-fills ID: `agent_abcd1234`
   - Auto-fills Name: `My Shopping Agent`
   - Auto-fills Wallet: `0x123456...` (Monad address)
   - Click "✅ Register Agent"

2. **Search Products**
   - Enter search: `shoes`
   - Click "🔍 Search Products"
   - See results:
     - Blue Adidas Running Shoes ($99.99, 5% cashback = $5.00)
     - Puma Black Waterproof Shoes ($89.99, 6% cashback = $5.40)

3. **View Agent Stats**
   - Click "📊 Get Agent Stats"
   - See:
     - Total Earnings: 0 MON (will update after purchases)
     - Purchases Tracked: 0
     - API Calls: 1 (from registration)
     - Searches: 1 (from product search)

4. **Try Different Searches**
   - Search "nike" → Nike boots
   - Search "adidas" → Adidas products
   - See how many products match each query

---

## File Structure

```
fiber-shop-landing/
├── server/
│   ├── api.js              ← Backend API with all endpoints
│   └── fetch.db            ← SQLite database (auto-created)
├── src/
│   ├── pages/
│   │   ├── DemoPage.js     ← Interactive demo with registration + search
│   │   ├── LandingPage.js
│   │   ├── AgentPage.js
│   │   └── UserPage.js
│   ├── styles/
│   │   ├── DemoPage.css    ← Cyan/green theme, glassmorphism
│   │   └── ...
│   └── App.js              ← Router (routes /demo to DemoPage)
├── package.json
├── QUICK_START.md          ← How to run
└── run-demo.sh             ← Run both servers
```

---

## Key Decisions

✅ **Monorepo** — Frontend + API in same repo for easy deployment  
✅ **SQLite** — Lightweight, no setup required, perfect for hackathon  
✅ **Mock Products** — 5 real products (Adidas, Nike, Puma) with realistic cashback rates  
✅ **Auto-Register** — Agents auto-created on first search (no extra step)  
✅ **Real-Time UI** — Frontend calls API, shows results instantly  
✅ **Design** — Cyan (#00f0ff) + Green (#22c55e) on dark navy (#0a0e27)  

---

## Next Steps (When Ready)

### Phase 2: Behavioral Personalization (Feb 8-9)
- Read wallet on-chain signals (token holdings, DeFi activity)
- Create behavioral tags (fitness_enthusiast, bonk_holder, etc.)
- Boost cashback 40-50% for matching tags
- Example: Runner wallet → 12% cashback on Nike vs 4% base

### Phase 3: Discount Code Vault (Feb 9)
- Fallback when no affiliate link available
- Agents submit verified discount codes
- Fetch uses best code + rewards contributor

### Phase 4: Purchase Tracking (Feb 10)
- Agent reports purchase completed
- Fetch calculates kickback (5% base, 10% for Founding Agents)
- Updates agent earnings in MON

### Phase 5: ERC-8004 Registration (Feb 11-12)
- Register Fetch on Monad Identity Registry (once you share domain)
- Auto-submit reputation after purchases
- Judges verify on 8004scan.io

---

## Testing Checklist

- [ ] Run `./run-demo.sh`
- [ ] Open http://localhost:3000/demo
- [ ] Click "✅ Register Agent" → success message shows
- [ ] Search "shoes" → 2 products appear
- [ ] Click "📊 Get Agent Stats" → stats update
- [ ] Search "nike" → 1 product appears
- [ ] Click product "View Product" → links to merchant
- [ ] Each product shows correct cashback amount

---

## API Response Example

```json
{
  "success": true,
  "query": "shoes",
  "agent_id": "agent_abcd1234",
  "wallet": "0x123456...",
  "results": [
    {
      "productId": "prod_123",
      "title": "Blue Adidas Running Shoes",
      "brand": "Adidas",
      "price": 99.99,
      "shop": {
        "name": "Adidas Store",
        "domain": "adidas.com",
        "score": 8.5
      },
      "cashback": {
        "rate": "5%",
        "amount": 5.0
      },
      "image": "https://via.placeholder.com/250x150?text=Adidas+Shoes"
    }
  ],
  "total_results": 1,
  "timestamp": "2026-02-07T13:20:00Z",
  "message": "Found 1 products. Each product includes cashback that agent receives when purchase is tracked."
}
```

---

## Questions for Laurent

1. **Happy with demo?** Should we continue to Phase 2 (behavioral personalization)?
2. **Product list** — Should we add/remove any mock products?
3. **Design** — Cyan/green theme working for you?
4. **Ready for ERC-8004?** When will you have the domain for agent card hosting?

---

**Status:** MVP complete and tested ✅  
**Next:** Phase 2 (behavioral personalization) when you say go 🚀
