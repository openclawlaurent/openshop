# Backend Proxy Setup - Temporary CORS Workaround

While we wait for Fiber to fix their CORS headers, we can set up a simple Node.js backend to proxy requests.

## Option A: Deploy to Vercel (Recommended)

### 1. Create Vercel API Routes

Create `/api/fiber-proxy.js`:

```javascript
// /api/fiber-proxy.js - Serverless function to proxy Fiber API calls
export default async function handler(req, res) {
  const { method, endpoint, body } = req.body;
  
  const fiberUrl = `https://api.staging.fiber.shop/v1/${endpoint}`;
  
  try {
    const fiberResponse = await fetch(fiberUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await fiberResponse.json();
    res.status(fiberResponse.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 2. Update Frontend to Use Proxy

In `src/components/AgentApiDemo.js`:

```javascript
// OLD: Direct API call (fails due to CORS)
// const response = await fetch('https://api.staging.fiber.shop/v1/agent/register', {...})

// NEW: Use proxy
const response = await fetch('/api/fiber-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'POST',
    endpoint: 'agent/register',
    body: {
      agent_name: agentName,
      wallet_address: walletAddress,
      description: description
    }
  })
});
```

### 3. For GET requests with query params:

```javascript
// For GET /v1/agent/search?keywords=...&agent_id=...
const response = await fetch('/api/fiber-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'GET',
    endpoint: `agent/search?keywords=${keywords}&agent_id=${agentId}&wallet=${wallet}&limit=10`
  })
});
```

---

## Option B: Self-Hosted Backend (More Complex)

If you want a dedicated backend server:

### 1. Create Express server in `server/api.js`:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const FIBER_API = 'https://api.staging.fiber.shop/v1';

// Proxy for agent registration
app.post('/api/agent/register', async (req, res) => {
  try {
    const response = await fetch(`${FIBER_API}/agent/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy for product search
app.get('/api/agent/search', async (req, res) => {
  try {
    const url = new URL(`${FIBER_API}/agent/search`);
    url.searchParams.append('keywords', req.query.keywords);
    url.searchParams.append('agent_id', req.query.agent_id);
    url.searchParams.append('wallet', req.query.wallet);
    url.searchParams.append('limit', req.query.limit || 10);
    
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Similar proxies for other endpoints...

app.listen(5000, () => console.log('Backend running on :5000'));
```

### 2. Run with:
```bash
npm install express cors
node server/api.js
```

---

## Recommendation

**Use Option A (Vercel API Routes)** because:
- ✅ No additional server to manage
- ✅ Automatically deploys with frontend
- ✅ Scales with traffic
- ✅ Already on Vercel infrastructure

This is a temporary workaround until Fiber updates their CORS headers.

---

## Progress Status

- 🔴 **Current:** Vercel deployment blocked by CORS
- 🟢 **With Proxy:** Vercel deployment will work
- ✅ **Final:** Once Fiber fixes CORS, remove proxy and call API directly
