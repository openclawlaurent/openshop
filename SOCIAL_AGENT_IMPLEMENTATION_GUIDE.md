# Social Media Agent Implementation Guide

**For:** Social Media Colleague  
**Purpose:** Step-by-step integration of Fetch offer engine into @fiber_shop Twitter bot  
**Prerequisites:** Read `FETCH_API_FOR_SOCIAL_AGENT.md` first  
**Last Updated:** 2026-02-09 21:58 GMT+1

---

## High-Level Flow

```
1. Engagement cycle triggers (every 45 min)
   ↓
2. Bot scans recent tweets (Solana/Monad communities)
   ↓
3. Queries Fetch: GET /api/agent/search?keywords={category}
   ↓
4. Receives offer list ranked by cashback %
   ↓
5. Selects top offer + applies token rotation logic
   ↓
6. Constructs CTA with @mentions
   ↓
7. Posts reply/QT with offer
   ↓
8. Logs promotion with POST /api/agent/offer-promoted
```

---

## Phase 1: Bot Structure

### Config Files

Create these JSON files in your bot root:

**`config/weekly-theme.json`**
```json
{
  "week": "2026-W06",
  "theme": "DeFi Governance",
  "categories": ["defi", "governance", "dao"],
  "focus_tokens": ["SOL", "BONK"],
  "featured_merchants": ["1inch", "Marinade", "Orca"],
  "description": "This week we're highlighting DeFi governance and token delegation"
}
```

**`config/token-list.json`**
```json
{
  "solana": [
    { "symbol": "SOL", "handle": "@solana", "chain": "solana" },
    { "symbol": "BONK", "handle": "@bonaborado", "chain": "solana" },
    { "symbol": "PENGU", "handle": "@pudaborado", "chain": "solana" },
    { "symbol": "USD1", "handle": "@USD1official", "chain": "solana" },
    { "symbol": "VALOR", "handle": "@valortoken", "chain": "solana" },
    { "symbol": "MF", "handle": "@musclefi", "chain": "solana" }
  ],
  "monad": [
    { "symbol": "MON", "handle": "@monadlabs", "chain": "monad" }
  ]
}
```

**`config/urls.json`** (Phase 1: Waitlist)
```json
{
  "phase": 1,
  "cta_urls": {
    "waitlist_main": "fiber.shop",
    "waitlist_monad": "fiber.shop/monad",
    "waitlist_solana": "fiber.shop/solana"
  },
  "cta_variations": [
    "Join the waitlist",
    "Build your profile",
    "Early access",
    "Get started",
    "Learn more"
  ]
}
```

When app launches, update `phase: 2` and add:
```json
{
  "phase": 2,
  "offer_base_url": "fiber.shop/offer",
  "cta_urls": {
    "offer_template": "fiber.shop/offer/{merchant_id}"
  }
}
```

**`config/cta-templates.json`** (Phase 1)
```json
{
  "phase": 1,
  "templates": [
    "Join 10k+ agents trading smarter → {waitlist_url}",
    "Build your Fiber profile: {waitlist_url}",
    "Only on Monad: Sub-second finality + aligned incentives → {waitlist_url}",
    "Early access to agent-powered discovery → {waitlist_url}",
    "Agents + merchants + you = better deals → {waitlist_url}"
  ]
}
```

Phase 2 templates:
```json
{
  "phase": 2,
  "templates": [
    "Earn {cashback}% at @{merchant} in ${token} {token_handle} → {offer_url}",
    "{token} holders: {cashback}% off @{merchant} via Fiber → {offer_url}",
    "Shop smarter: {cashback}% cashback at @{merchant} in ${token} → {offer_url}"
  ]
}
```

---

## Implementation Steps

### Step 1: Bot Initialization

Register with Fetch:

```javascript
const agentConfig = {
  agent_name: "@fiber_shop",
  agent_description: "Fiber Protocol Twitter bot - offer discovery & engagement",
  agent_wallet: "0x790b405d466f7fddcee4be90d504eb56e3fedcae",
  metadata: {
    twitter_handle: "@fiber_shop",
    platform: "twitter",
    phase: "1"
  }
};

const registerResponse = await fetch("http://192.168.1.39:5000/api/agent/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(agentConfig)
});

const { api_key, agent_id } = await registerResponse.json();
// Store api_key in .env: FETCH_API_KEY={api_key}
```

---

### Step 2: Context Detection Function

```javascript
function detectContext(tweetText, replyToUserId = null) {
  /**
   * Analyze tweet to determine:
   * 1. Category (fitness, electronics, defi, gaming, fashion, etc.)
   * 2. Token community (SOL, BONK, etc.)
   * 3. Ecosystem (solana, monad)
   */
  
  const keywords = {
    fitness: ["gym", "exercise", "running", "yoga", "workout", "sports", "Nike", "Adidas"],
    electronics: ["laptop", "phone", "gadget", "Best Buy", "Amazon", "tech"],
    defi: ["swap", "liquidity", "farming", "governance", "1inch", "Orca", "Marinade"],
    gaming: ["game", "nft", "Solend", "Magic Eden", "blockchain game"],
    fashion: ["clothing", "dress", "shoes", "brand", "style", "Zara"]
  };
  
  const tokenMentions = {
    "SOL": /@solana|#SOL|\$SOL/gi,
    "BONK": /@bonaborado|#BONK|\$BONK/gi,
    "PENGU": /@pudaborado|#PENGU|\$PENGU/gi,
    "MON": /@monadlabs|#MON|\$MON/gi
  };
  
  let detectedCategory = null;
  let detectedToken = null;
  let detectedEcosystem = "solana"; // default
  
  // Detect category
  for (const [category, terms] of Object.entries(keywords)) {
    if (terms.some(term => tweetText.toLowerCase().includes(term.toLowerCase()))) {
      detectedCategory = category;
      break;
    }
  }
  
  // Detect token mention
  for (const [token, regex] of Object.entries(tokenMentions)) {
    if (regex.test(tweetText)) {
      detectedToken = token;
      if (token === "MON") detectedEcosystem = "monad";
      break;
    }
  }
  
  return {
    category: detectedCategory || "general",
    token: detectedToken,
    ecosystem: detectedEcosystem
  };
}
```

---

### Step 3: Fetch Offer Query

```javascript
async function queryFetchForOffers(context, agentId) {
  /**
   * Query Fetch API for offers matching context
   * Returns ranked list by cashback %
   */
  
  const params = new URLSearchParams({
    keywords: context.category,
    agent_id: agentId,
    ecosystem: context.ecosystem,
    token: context.token || null
  });
  
  const response = await fetch(
    `http://192.168.1.39:5000/api/agent/search?${params}`,
    {
      headers: {
        "Authorization": `Bearer ${process.env.FETCH_API_KEY}`
      }
    }
  );
  
  const data = await response.json();
  
  // data.results = [ { merchant, merchant_handle, cashback_rate, offer_url, recommended_token, ... } ]
  // data.top_offer = highest cashback % offer
  
  return data;
}
```

---

### Step 4: Token Rotation Logic

```javascript
function selectToken(context, offers, tokenList) {
  /**
   * Select which token to feature in CTA:
   * 1. If tweet mentions specific token → use that
   * 2. Else if offer has recommended_token → use that
   * 3. Else random from available list
   */
  
  if (context.token) {
    // Tweet already mentions a token
    return context.token;
  }
  
  if (offers.top_offer && offers.top_offer.recommended_token) {
    // Fetch recommends a token (based on context)
    return offers.top_offer.recommended_token;
  }
  
  // Random selection from token list for ecosystem
  const tokens = tokenList[offers.context_detected.ecosystem];
  return tokens[Math.floor(Math.random() * tokens.length)];
}

function getTokenHandle(symbol, tokenList) {
  for (const tokens of Object.values(tokenList)) {
    const found = tokens.find(t => t.symbol === symbol);
    if (found) return found.handle;
  }
  return null;
}
```

---

### Step 5: CTA Construction (Phase 1)

```javascript
function buildPhase1CTA(config) {
  /**
   * Phase 1: Waitlist CTAs
   * Select random template, substitute waitlist URL
   */
  
  const templates = config.cta_templates.phase1.templates;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // 30% of replies include CTA, 70% are pure value
  if (Math.random() > 0.30) {
    return null; // No CTA this reply
  }
  
  // Rotate between waitlist URLs
  const urls = [
    config.urls.waitlist_main,
    config.urls.waitlist_monad,
    config.urls.waitlist_solana
  ];
  const selectedUrl = urls[Math.floor(Math.random() * urls.length)];
  
  return template.replace("{waitlist_url}", selectedUrl);
}
```

---

### Step 6: CTA Construction (Phase 2)

```javascript
function buildPhase2CTA(config, offer, token, tokenHandle) {
  /**
   * Phase 2: Offer CTAs with @mentions
   * Select template, substitute: cashback%, merchant, token
   */
  
  const templates = config.cta_templates.phase2.templates;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // ~40% of replies include offer CTA
  if (Math.random() > 0.40) {
    return null;
  }
  
  const cta = template
    .replace("{cashback}", (offer.final_cashback * 100).toFixed(1))
    .replace("@{merchant}", offer.merchant_handle)
    .replace("{merchant}", offer.merchant)
    .replace("${token}", token)
    .replace("{token_handle}", tokenHandle)
    .replace("{offer_url}", offer.offer_url);
  
  return cta;
}
```

---

### Step 7: Post Engagement Reply/QT

```javascript
async function postReply(tweetId, tweetText, offer, cta = null) {
  /**
   * Construct reply with:
   * 1. Thoughtful engagement (value add)
   * 2. Optional CTA
   */
  
  // Generate thoughtful reply based on context
  const engagement = generateEngagementReply(tweetText);
  
  const replyText = cta 
    ? `${engagement}\n\n${cta}`
    : engagement;
  
  // Post via Twitter API
  const tweet = await twitterClient.v2.reply(replyText, {
    reply: { in_reply_to_tweet_id: tweetId }
  });
  
  return tweet.data.id;
}

async function postQuoteTweet(tweetId, offer, cta = null) {
  /**
   * Post quote tweet on high-traction post
   */
  
  const engagement = generateShortEngagement(offer);
  
  const qtText = cta
    ? `${engagement}\n\n${cta}`
    : engagement;
  
  const tweet = await twitterClient.v2.tweet({
    text: qtText,
    quote: { quote_tweet_id: tweetId }
  });
  
  return tweet.data.id;
}
```

---

### Step 8: Log Promotion to Fetch

```javascript
async function logOfferPromotion(offer, tweetId, context) {
  /**
   * Tell Fetch about promotion:
   * - For dedup tracking
   * - For earnings calculation
   * - For analytics
   */
  
  const payload = {
    agent_id: process.env.FETCH_AGENT_ID,
    offer_id: offer.product_id,
    merchant: offer.merchant,
    cashback_rate: offer.cashback_rate,
    token_promoted: context.token || offer.recommended_token,
    tweet_id: tweetId,
    tweet_url: `https://twitter.com/fiber_shop/status/${tweetId}`,
    context: {
      category: context.category,
      cta_type: "engagement" | "offer_promotion",
      mention_count: (offer.merchant_handle.match(/@/g) || []).length
    }
  };
  
  const response = await fetch(
    "http://192.168.1.39:5000/api/agent/offer-promoted",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FETCH_API_KEY}`
      },
      body: JSON.stringify(payload)
    }
  );
  
  const result = await response.json();
  // result.dedup_status tells you if promotion is allowed
  
  return result;
}
```

---

### Step 9: Main Engagement Loop

```javascript
async function engagementCycle() {
  /**
   * Runs every 45 minutes
   * 1. Scan recent tweets in Solana/Monad communities
   * 2. Query Fetch for offers
   * 3. Post 3-5 replies + 1 QT
   */
  
  const tweets = await scanRecentTweets({
    hashtags: ["#Solana", "#Monad"],
    keywords: ["agent", "crypto", "defi", "trading"],
    limit: 50
  });
  
  let repliesPosted = 0;
  let qtsPosted = 0;
  
  for (const tweet of tweets) {
    if (repliesPosted >= 3) break;
    
    // Skip if @fiber_shop already replied
    if (await alreadyReplied(tweet.id)) continue;
    
    // Detect context from tweet
    const context = detectContext(tweet.text);
    
    // Query Fetch for offers
    const offers = await queryFetchForOffers(context, process.env.FETCH_AGENT_ID);
    
    // Select token
    const token = selectToken(context, offers, config.tokenList);
    const tokenHandle = getTokenHandle(token, config.tokenList);
    
    // Build CTA (Phase 1 or 2 based on config)
    const cta = config.urls.phase === 1
      ? buildPhase1CTA(config)
      : buildPhase2CTA(config, offers.top_offer, token, tokenHandle);
    
    // Post reply
    const replyTweetId = await postReply(tweet.id, tweet.text, offers.top_offer, cta);
    
    // Log to Fetch
    await logOfferPromotion(offers.top_offer, replyTweetId, context);
    
    repliesPosted++;
  }
  
  // Post 1 QT on high-traction tweet
  const topTweet = tweets[0]; // Could use engagement metrics
  if (topTweet && !await alreadyReplied(topTweet.id)) {
    const context = detectContext(topTweet.text);
    const offers = await queryFetchForOffers(context, process.env.FETCH_AGENT_ID);
    const token = selectToken(context, offers, config.tokenList);
    const tokenHandle = getTokenHandle(token, config.tokenList);
    
    const cta = config.urls.phase === 2
      ? buildPhase2CTA(config, offers.top_offer, token, tokenHandle)
      : buildPhase1CTA(config);
    
    const qtTweetId = await postQuoteTweet(topTweet.id, offers.top_offer, cta);
    await logOfferPromotion(offers.top_offer, qtTweetId, context);
  }
  
  console.log(`Engagement cycle: ${repliesPosted} replies, ${qtsPosted} QTs`);
}

// Schedule every 45 minutes
setInterval(engagementCycle, 45 * 60 * 1000);

// Also scan mentions every 30 minutes
setInterval(mentionCycle, 30 * 60 * 1000);
```

---

## Transition to Phase 2

When app launches:

1. Update `config/urls.json`: Change `phase: 1` → `phase: 2`
2. Update `config/cta-templates.json`: Switch to Phase 2 offer templates
3. Redeploy bot
4. Same code path, different templates = automatic transition

---

## Monitoring & Analytics

Check your bot's performance:

```javascript
async function getAnalytics() {
  const response = await fetch(
    `http://192.168.1.39:5000/api/agent/earnings/${process.env.FETCH_AGENT_ID}`,
    {
      headers: { "Authorization": `Bearer ${process.env.FETCH_API_KEY}` }
    }
  );
  
  const stats = await response.json();
  
  console.log(`
  Searches: ${stats.total_searches}
  Offers Promoted: ${stats.total_offers_promoted}
  Estimated Earnings: $${stats.estimated_earnings}
  Last 24h Clicks: ${stats.last_24h.link_clicks}
  Last 24h Impressions: ${stats.last_24h.impressions}
  `);
}

// Check daily
setInterval(getAnalytics, 24 * 60 * 60 * 1000);
```

---

## Deduplication Rules

Fetch enforces 24-hour dedup per offer. Your bot should also track locally:

```javascript
const dedupWindow = {}; // { offer_id: timestamp }

function canPromoteOffer(offerId) {
  const lastPromoted = dedupWindow[offerId];
  if (!lastPromoted) return true;
  
  const hoursSince = (Date.now() - lastPromoted) / (1000 * 60 * 60);
  return hoursSince >= 24;
}
```

---

## Testing Checklist

- [ ] Bot registers with Fetch, receives `api_key`
- [ ] `/api/agent/search` returns offers
- [ ] Token rotation selects tokens correctly
- [ ] CTA construction works (Phase 1 and 2)
- [ ] Bot posts replies without error
- [ ] `/api/agent/offer-promoted` logs promotions
- [ ] Dedup logic prevents repeat offers
- [ ] `/api/agent/earnings` shows stats
- [ ] Transition to Phase 2 works smoothly

---

## Questions?

Post in the Slack channel or ping me. Ready to start? 🚀
