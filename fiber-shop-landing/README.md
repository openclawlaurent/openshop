# FiberAgent - The Agent's Agent

**"Have your agent call my agent."** 🤖

FiberAgent is a behavioral intelligence agent built by Fiber. When other AI agents need to find deals for their users, they call FiberAgent. We use behavioral signals (on-chain + real purchase data) to return personalized offers with stacked discounts — and everyone in the chain gets paid.

**Monad-powered. Agent-to-agent. Crypto-native.**

---

## 🎯 The Vision

AI agents will handle shopping for people. But today's agents are blind — they search the same product catalogs and return the same generic results for everyone.

FiberAgent changes that. We combine:
- **On-chain intelligence** (wallet holdings, token activity, DeFi positions)
- **Real purchase history** (ecommerce transactions from our merchant network)
- **Behavioral personalization** (FP scoring that decays over time)

Result: When a calling agent queries FiberAgent, they get personalized offers, verified discount codes, and real referral links — with cashback boosted up to 50% for users whose behavior signals high intent.

---

## 🚀 Key Features

### Agent Registration & Discovery
- **ERC-8004 Identity Registry**: Publish your API endpoint on-chain
- **Founding Agent Program**: First 50 agents get 2x kickback multiplier forever
- **Agent Reputation Tracking**: On-chain reputation via transaction history

### Query Endpoint
```
GET /api/agent/search?wallet=0x...&keywords=running+shoes
```
- Other agents call FiberAgent for personalized deals
- Behavioral lookup powered by FP (Fiber Points) system
- Bonus cashback if user profile matches intent (e.g., 50% boost for fitness enthusiasts)

### Behavioral Personalization
- **On-Chain Signals**: Token holdings, DeFi activity, community membership
- **Off-Chain Data**: Real ecommerce purchases from 50K+ merchant network
- **Decay Model**: Recent behavior matters more than old behavior
- **Persona Tags**: Fitness enthusiast, streetwear buyer, tech early-adopter, etc.

### Discount Code Vault (Gap Coverage)
- Fallback for merchants not in affiliate network
- Agents & users submit verified promo codes
- Code contributors earn facilitation fees
- Quality > Quantity: only validated, recently-tested codes

### Agent Kickback System
- **Calling agents earn**: % of cashback when user converts (base 5%, 2x for Founding Agents)
- **Code submitters earn**: Fee when their verified code drives a purchase
- **FiberAgent earns**: Commission from affiliate purchases + facilitation fees
- **Payouts**: Denominated in $MON, settled in real-time via Monad

### On-Chain Reputation (ERC-8004)
- Verifiable track record: conversion rate, accuracy, speed
- Builds trust without middleman
- Enables reputation-based filtering for calling agents

### Gossip Feed & Public Intelligence
- Aggregated, anonymized behavioral insights published to agents
- "BONK community is 3.2x on fitness gear this week"
- Select insights auto-posted to Twitter/X as market intelligence
- Data quality comparable to professional market research

---

## 🏗️ Technical Stack

### Backend
- **Language**: Node.js/Express
- **Database**: PostgreSQL (agents, behavioral tags, kickback balances, codes)
- **Blockchain**: Monad + ERC-8004
- **Product Data**: Wildfire affiliate network + Elasticsearch
- **Intelligence**: Claude API for agent logic (cached queries)

### Blockchain
- **Wallet**: Dedicated Monad wallet for FiberAgent service
- **Contracts**: ERC-8004 Identity Registry for agent discovery
- **Tokens**: $MON for kickback payouts
- **Finality**: Sub-second on Monad (vs. 12s on Ethereum)

### Key Endpoints
- `GET /api/agent/search` - Main query endpoint
- `POST /api/agent/register` - Agent registration
- `POST /api/codes/submit` - Submit verified code
- `GET /api/codes/check` - Check code validity
- `POST /api/webhook/purchase` - Wildfire purchase confirmation
- `GET /api/agent/reputation` - Agent track record
- `GET /api/gossip/feed` - Behavioral intelligence feed
- `GET /api/gossip/trending` - Top insights for Twitter

---

## 📊 Demo Data

Comes pre-loaded with:
- **5 registered agents** ready to query FiberAgent
- **50K+ behavioral tags** simulating FP database
- **60+ verified deals** across top merchants
- **Real Monad wallet** for demo payments
- **Mock purchase data** to show kickback flow

---

## 🎬 How It Works (Agent-to-Agent Flow)

1. **Agent A queries FiberAgent**: "Find running shoes for wallet 0xABC"
2. **FiberAgent looks up wallet behavior**: On-chain signals + past purchases
3. **FiberAgent identifies intent**: User is a serious runner (FP score 0.9+)
4. **FiberAgent finds best deal**: Nike Pegasus at Dick's, $120, 4% cashback
5. **FiberAgent boosts cashback**: +50% for fitness enthusiast = 6% instead of 4%
6. **FiberAgent adds code**: No affiliate link? Here's a verified 15% code
7. **User buys**: $120 purchase → $7.20 cashback in MON
8. **Payouts settle**: Agent A gets $0.36 kickback (5%), code submitter gets fee
9. **Reputation updates**: FiberAgent's track record improves on-chain

---

## 💡 Why Monad?

- **Sub-second finality**: Agent queries → deals → kickbacks in milliseconds
- **Micropayment economics**: $0.25 kickback costs fractions of a cent in gas (vs. >$0.25 on Ethereum)
- **High throughput**: Thousands of A2A queries + reputation updates without congestion
- **EVM compatible**: Standard Solidity contracts, no new toolchain

---

## 🚀 Local Setup

### Prerequisites
- Node.js v22+
- npm v10+

### Install
```bash
git clone https://github.com/openclawlaurent/fetch.git
cd fetch/fiber-shop-landing
npm install
```

### Run Locally

**Terminal 1 - Frontend (port 3000):**
```bash
npm start
```

**Terminal 2 - API (port 5000):**
```bash
npm run api
```

Visit: **http://localhost:3000**

### Environment
Create `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📈 Founding Agent Program

First 50 agents to register get:
- **2x kickback multiplier** (permanent, on-chain)
- **Priority in code bounties** (10x base fee for verified codes)
- **Status signal** in agent community
- **Early access** to behavioral intelligence insights

This creates FOMO and real incentive to integrate day one.

---

## 🎯 Monad Hackathon - Agent Track

FiberAgent was built for the [Moltiverse Hackathon](https://moltiverse.moltiverse.io/) Agent Track (No Token).

**What makes it boundary-pushing:**
1. **Agent-to-agent architecture**: Not user-facing. Purely A2A economic incentives.
2. **Behavioral intelligence**: Combines on-chain signals + real purchase data (not available in other hackathon projects)
3. **Public intelligence feed**: Gossip data worthy of market research ($100K+ value from Nielsen/Circana)
4. **Economic alignment**: Query staking + kickbacks + reputation = trust without middleman

---

## 🔗 Links

- **GitHub**: https://github.com/openclawlaurent/fetch
- **Demo**: http://192.168.1.39:3000
- **API Health**: http://localhost:5000/api/health
- **Whitepaper**: See `/docs/WHITEPAPER.md` for full vision

---

## 📝 License

MIT

---

**"How'd you get that deal?"**  
*"I got an agent."* 🚀
# Trigger redeploy
