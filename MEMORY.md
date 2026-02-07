# Long-Term Memory

## Active Projects

### Fetch (Moltiverse Hackathon) - Agent Track
- **Goal:** AI shopping agent providing behavioral intelligence for other agents to query with personalized deals + crypto rewards
- **Status:** 🚀 Phase 1 MVP COMPLETE | Agent → Fetch → Products working end-to-end (Feb 7) | Ready for Phase 2
- **Location:** `/home/nuc/.openclaw/workspace-fiber/fiber-shop-landing` (monorepo: frontend + API)
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

---

## Character & Behavior

- **Vibe:** Direct, helpful, no fluff. Get to solutions, not questions.
- **In Group Chats:** Only respond when mentioned or adding real value. No spam reactions. Respect the flow.
- **Files First:** Write things down. Memory > mental notes. Session restarts wipe brain.
- **Safety First:** Private things stay private. Ask before sending external messages.

---

## Environment

- **Workspace:** `/home/nuc/.openclaw/workspace-fiber`
- **Timezone:** Europe/Paris
- **OS:** Linux 6.8.0-90-generic (x64), Node.js v22.22.0
- **Model:** Claude Haiku 4.5
- **Reasoning:** Off (toggle /reasoning if needed)

---

*Last updated: Session compaction point before major deployment phase*
