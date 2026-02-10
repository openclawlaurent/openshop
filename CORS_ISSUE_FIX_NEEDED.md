# CORS Issue - Fiber API Configuration Needed

## Problem
**Fiber's staging API is rejecting requests from Vercel deployment.**

```
Error: Access to fetch at 'https://api.staging.fiber.shop/v1/agent/register' 
from origin 'https://openshop-ten.vercel.app' has been blocked by CORS policy
```

### Root Cause
Fiber's API response header shows:
```
Access-Control-Allow-Origin: http://localhost:3000
```

This only allows localhost development. The Vercel production domain is blocked.

## What Needs to Happen (Fiber Team)

**Fiber API Configuration Team** needs to update their CORS settings to include:

```
Access-Control-Allow-Origin: https://openshop-ten.vercel.app
```

Or better yet, add multiple origins:
```
Access-Control-Allow-Origin: http://localhost:3000, https://openshop-ten.vercel.app
```

## Affected Endpoints
All endpoints are blocked:
- `POST /v1/agent/register`
- `GET /v1/agent/search`
- `GET /v1/agent/stats/platform`
- `GET /v1/agent/stats/leaderboard`
- `GET /v1/agent/stats/trends`
- `GET /v1/agent/:agent_id/stats`
- `GET /v1/agent/:agent_id/merchants`
- `GET /v1/agent/earnings/:agent_id`
- `PATCH /v1/agent/:agent_id`

## Workaround (Temporary)

### Option 1: Local Testing (Works Now ✅)
```bash
cd fiber-shop-landing
npm start  # Runs on http://localhost:3000
# Demo works here!
```

### Option 2: Backend Proxy (If Local Doesn't Work for Fiber)
Create a simple Node.js proxy to forward requests:

```javascript
// Add to main server/api.js
app.post('/api/agent/register', async (req, res) => {
  const response = await fetch('https://api.staging.fiber.shop/v1/agent/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
});
```

Then in frontend, call `/api/agent/register` instead of the Fiber endpoint.

### Option 3: Use CORS Proxy (Temporary)
```javascript
const response = await fetch(
  'https://cors-anywhere.herokuapp.com/https://api.staging.fiber.shop/v1/agent/register',
  { method: 'POST', ... }
);
```
⚠️ Not recommended for production

## Message to Fiber

```
Hi Fiber team,

FiberAgent (agent-to-agent commerce platform) is live on Vercel at:
https://openshop-ten.vercel.app

Your staging API is returning CORS headers that only allow localhost:3000:
Access-Control-Allow-Origin: http://localhost:3000

Can you please update your CORS configuration to allow:
✅ https://openshop-ten.vercel.app

This will unblock all product search and agent registration calls from our live demo.

Thanks!
```

## Status
- 🟢 **Local Development:** Working (localhost:3000)
- 🔴 **Vercel Production:** Blocked by CORS
- ⏳ **Waiting on:** Fiber API CORS configuration update

## Next Steps
1. Share this issue with Fiber team
2. Once fixed, Vercel deployment will work automatically
3. No code changes needed on our end
