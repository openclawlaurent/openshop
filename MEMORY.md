# Long-Term Memory

## Active Projects

### Fetch (Moltiverse Hackathon) - Agent Track
- **Goal:** Platform for external agents to help their users find products via Fiber. User's Agent → Fetch Agent → Fiber API. Agents earn cashback commissions. Built on ERC-8004 reputation.
- **Status:** 🚀 Phase 1 MVP COMPLETE | Fiber API Integration LIVE | Agent-to-Agent Demo WORKING (Feb 10 20:35)
- **Location:** `/Users/laurentsalou/.openclaw/workspace-fiber` (Mac mini deployment)
- **Tech Stack:** Node.js/Express (API) + React (frontend) + SQLite (database), Monad blockchain, ERC-8004 contracts
- **Timeline:** Feb 6-15, 2026 (9 days to submit)
- **Key Constraints:** 
  - Agent Track (no token commitment to Monad)
  - Real Wildfire merchant data (50K+ merchants)
  - Behavioral personalization via FP (Fiber Points) system
  - On-chain reputation via ERC-8004
  - Everyone in chain gets paid (agents, code contributors, Fetch)
- **Branding:** Rebranded from "OpenShop" → "Fetch" ✅
- **Persona:** "Ari Gold of AI agents" — hustler, delivers results, takes care of people

**Monad Mainnet Wallet:**
- **Address:** `0x790b405d466f7fddcee4be90d504eb56e3fedcae`
- **Status:** ✅ Created, awaiting MON for gas fees (Laurent to send)
- **Private Key:** Secured in `.env` (never committed)

**Phase 1 Complete (Feb 7):**
- ✅ Rebranded OpenShop → Fetch throughout codebase
- ✅ Created Monad mainnet wallet (0x790b405d466f7fddcee4be90d504eb56e3fedcae)
- ✅ Built MVP: Agent queries Fetch for products (GET /api/agent/search?keywords=...&agent_id=...)
- ✅ Returns product list with merchant, price, cashback rate/amount
- ✅ Tested end-to-end with curl — working perfectly
- ✅ Database auto-registers agents, tracks searches, counts API calls

**Key Files:**
- `QUICK_START.md` — How to run demo locally + test endpoints
- `memory/fetch-whitepaper.md` — Full product spec (13KB)
- `memory/erc-8004-guide.md` — Monad ERC-8004 spec + contract addresses
- `contracts/FETCH_ERC8004_REGISTRATION.md` — Step-by-step registration plan
- `DEPLOYMENT_PLAN.md` — Day-by-day checklist for Feb 6-15 execution
- `memory/wallet-setup.md` — Wallet address + security notes

**Latest Progress (Feb 10 20:58 GMT+1):**
- ✅ **AGENTS.md** - 9.1KB comprehensive agent onboarding guide
  - Wallet setup (3 options)
  - API reference (register, search, earnings, update)
  - **Critical: 1-5 day Fiber Points timeline + 1-90 day crypto payout timeline**
  - FAQ section addressing timeline concerns
  - Earning strategies (volume, niche, reputation)
- ✅ **DEMO_COMPLETE_FLOW.sh** - 9.1KB executable demo showing:
  - External agent registration
  - Product search (with real Fiber API responses)
  - Timeline explanation (Days 0-90)
  - Earnings check
  - Earning strategies
- ✅ **Fiber API Integration LIVE** - All 4 endpoints working:
  - POST /v1/agent/register - Returns agent_id
  - GET /v1/agent/search - Returns merchants + affiliate links + cashback rates
  - GET /v1/agent/earnings/{agent_id} - Returns earnings + reputation
  - PATCH /v1/agent/{agent_id} - Update wallet/name
- ✅ Verified with real curl examples from Fiber
- ✅ Committed to GitHub (fb176ac)

**What's Ready:**
- MVP is production-ready for demo
- Judge presentation script complete with talking points + Q&A
- Social media colleague has everything needed to integrate (@fiber_shop Twitter bot)
- Cron job running every 5 minutes to ensure continuous progress

**What's Next:**
- Task 5: Social media agent integration (colleague can start immediately with docs)
- Task 6: Fiber integration (waiting for Fiber's API endpoints)
- Phase 2: Query staking, kickback system, ERC-8004 reputation
- Deployment: Cloud hosting when ready

---

## Operating Mode (Feb 9, 2026 onwards)

**Mac Mini Deployment:** Fetch now runs 24/7 locally on Mac mini  
**Work Philosophy:** Never stop. Always working. Parallel tasks. Self-sufficient.  
**Goal:** 24/7 availability > speed. Work 8+ hours straight without asking Laurent.

**Key Rules:**
1. ✅ Never idle — pivot to next task immediately if blocked
2. ✅ Find answers in code/specs/memory before asking Laurent
3. ✅ Ask only for: credentials, approvals, external resources
4. ✅ Log all in-progress work in memory so sessions persist
5. ✅ Assume Laurent is busy — don't wait, keep shipping

---

## Character & Behavior

- **Vibe:** Direct, helpful, no fluff. Get to solutions, not questions.
- **In Group Chats:** Only respond when mentioned or adding real value. No spam reactions. Respect the flow.
- **Files First:** Write things down. Memory > mental notes. Session restarts wipe brain.
- **Safety First:** Private things stay private. Ask before sending external messages.
- **24/7 Mode:** Always working, parallel tasks, self-directed, continuous progress

---

## Environment

- **Workspace:** `/home/nuc/.openclaw/workspace-fiber`
- **Timezone:** Europe/Paris
- **OS:** Linux 6.8.0-90-generic (x64), Node.js v22.22.0
- **Model:** Claude Haiku 4.5
- **Reasoning:** Off (toggle /reasoning if needed)

---

*Last updated: Session compaction point before major deployment phase*
