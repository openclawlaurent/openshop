# Affiliate Links - Using Fiber API Directly (No Backend)

## Approach
We use affiliate links **directly from Fiber API** - no post-processing needed. This keeps the demo simple with no backend.

## How It Works

1. **Agent registers** with FiberAgent
   - Receives `agent_id`

2. **Agent searches** for products
   - Fiber API returns merchants with `affiliate_link`
   - Example: `https://wild.link/e?d=altrarunning.com&u=agent_abc123`

3. **Agent shares link** with their users
   - User clicks link → Fiber handles tracking → User lands on merchant
   - Fiber matches purchase back to agent_id

4. **Commission paid** in 1-90 days
   - Fiber processes earnings automatically

## Implementation (No Backend)

### In DemoPage.js
```javascript
<a 
  href={merchant.affiliate_link}
  target="_blank"
  rel="noopener noreferrer"
  className="btn btn-small"
>
  Shop & Earn 🔗
</a>
```

### In AgentApiDemo.js
```javascript
<code>{selectedProduct.affiliate_link}</code>
```

That's it! No API proxy, no database, no server-side tracking.

## Why This Works

- ✅ Fiber API returns complete affiliate links
- ✅ Wildfire handles tracking on their end
- ✅ No backend needed
- ✅ Simple and clean
- ✅ Agent just shares the link

## If Links Don't Work

If Fiber returns incomplete affiliate links (e.g., `u=...`), that's **Fiber's API issue**. We should ask Fiber to:
1. Return complete affiliate links from their API
2. Handle all tracking on Wildfire's side
3. No post-processing needed on agent side

This keeps FiberAgent simple - just a proxy to Fiber, no backend complexity.
