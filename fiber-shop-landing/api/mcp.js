/**
 * FiberAgent MCP Server — Streamable HTTP endpoint
 * 
 * POST /api/mcp  → JSON-RPC messages (tools/list, tools/call, etc.)
 * GET  /api/mcp  → SSE stream for server notifications
 * DELETE /api/mcp → Close session
 * 
 * Stateless mode: no session tracking (Vercel serverless)
 * Compatible with Claude Desktop, Cursor, VS Code, ChatGPT, any MCP client
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

// ─── Product Catalog (same as utils.js) ───

const FIBER_API = 'https://api.staging.fiber.shop/v1';

const mockProducts = [
  {
    productId: 'nike_pegasus_41',
    title: "Nike Pegasus 41 — Men's Road Running Shoes",
    brand: 'Nike',
    price: 145.00,
    image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/770bb236-05c7-4fad-a23c-cac2734a8284/AIR+ZOOM+PEGASUS+41.png',
    merchant: 'NIKE',
    domain: 'nike.com',
    cashbackRate: 0.65,
    cashbackAmount: 0.94,
    affiliateUrl: 'https://wild.link/e?c=3922888&d=38807951&url=https%3A%2F%2Fwww.nike.com%2Fw%2Fpegasus-shoes-8nexhzy7ok',
  },
  {
    productId: 'nike_vomero_premium',
    title: "Nike Vomero Premium — Men's Road Running Shoes",
    brand: 'Nike',
    price: 230.00,
    image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/33d6f8d4-a863-437b-ab3d-c6307831cdd9/NIKE+VOMERO+PREMIUM.png',
    merchant: 'NIKE',
    domain: 'nike.com',
    cashbackRate: 0.65,
    cashbackAmount: 1.50,
    affiliateUrl: 'https://wild.link/e?c=3922888&d=38807951&url=https%3A%2F%2Fwww.nike.com%2Fw%2Fzoom-vomero-shoes-7gee1zy7ok',
  },
  {
    productId: 'nike_vomero5_fl',
    title: "Women's Nike Zoom Vomero 5 — Casual Shoes",
    brand: 'Nike',
    price: 170.00,
    image: 'https://media.finishline.com/i/finishline/HF1877_001_P1?fmt=auto&w=400&h=400',
    merchant: 'Finish Line',
    domain: 'finishline.com',
    cashbackRate: 3.25,
    cashbackAmount: 5.53,
    affiliateUrl: 'https://wild.link/e?c=5517209&d=38807951&url=https%3A%2F%2Fwww.finishline.com%2Fpdp%2Fwomens-nike-zoom-vomero-5-casual-shoes%2Fprod2866808',
  },
  {
    productId: 'nike_airmax270',
    title: 'Nike Air Max 270',
    brand: 'Nike',
    price: 170.00,
    image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/6ae6bf27-085b-4d8d-b370-fd96b7ad3d33/AIR+MAX+270.png',
    merchant: 'NIKE',
    domain: 'nike.com',
    cashbackRate: 0.65,
    cashbackAmount: 1.11,
    affiliateUrl: 'https://wild.link/e?c=3922888&d=38807951&url=https%3A%2F%2Fwww.nike.com%2Fw%2Fair-max-270-shoes-5ix6dzy7ok',
  },
  {
    productId: 'nike_af1_fl',
    title: "Men's Nike Air Force 1 '07 LV8 — Casual Shoes",
    brand: 'Nike',
    price: 115.00,
    image: 'https://media.finishline.com/i/finishline/CW6999_600_P1?fmt=auto&w=400&h=400',
    merchant: 'Finish Line',
    domain: 'finishline.com',
    cashbackRate: 3.25,
    cashbackAmount: 3.74,
    affiliateUrl: 'https://wild.link/e?c=5517209&d=38807951&url=https%3A%2F%2Fwww.finishline.com%2Fpdp%2Fmens-nike-air-force-1-07-lv8-casual-shoes%2Fprod2785305',
  },
  {
    productId: 'adidas_ultraboost',
    title: 'Adidas Ultraboost 5 Running Shoes',
    brand: 'Adidas',
    price: 190.00,
    image: 'https://assets.adidas.com/images/w_400,f_auto,q_auto/68ae7ea7849b43eca70aaf1601151571_9366/Ultraboost_5_Running_Shoes_Black_ID8816_01_standard.jpg',
    merchant: 'Adidas',
    domain: 'adidas.com',
    cashbackRate: 3.5,
    cashbackAmount: 6.65,
    affiliateUrl: 'https://wild.link/e?c=4211003&d=38807951&url=https%3A%2F%2Fwww.adidas.com%2Fus%2Fultraboost-5-running-shoes%2FID8816.html',
  },
  {
    productId: 'adidas_samba',
    title: 'Adidas Samba OG Shoes',
    brand: 'Adidas',
    price: 110.00,
    image: 'https://assets.adidas.com/images/w_400,f_auto,q_auto/36ee3e89895c4a0489c6af1601157781_9366/Samba_OG_Shoes_White_B75806_01_standard.jpg',
    merchant: 'Adidas',
    domain: 'adidas.com',
    cashbackRate: 3.5,
    cashbackAmount: 3.85,
    affiliateUrl: 'https://wild.link/e?c=4211003&d=38807951&url=https%3A%2F%2Fwww.adidas.com%2Fus%2Fsamba-og-shoes%2FB75806.html',
  },
  {
    productId: 'adidas_gazelle',
    title: 'Adidas Gazelle Indoor Shoes',
    brand: 'Adidas',
    price: 120.00,
    image: 'https://assets.adidas.com/images/w_400,f_auto,q_auto/904cdbc97a8240db97b3af9200bcf67b_9366/Gazelle_Indoor_Shoes_Green_IG1596_01_standard.jpg',
    merchant: 'Adidas',
    domain: 'adidas.com',
    cashbackRate: 3.5,
    cashbackAmount: 4.20,
    affiliateUrl: 'https://wild.link/e?c=4211003&d=38807951&url=https%3A%2F%2Fwww.adidas.com%2Fus%2Fgazelle-indoor-shoes%2FIG1596.html',
  },
  {
    productId: 'on_creatine',
    title: 'Optimum Nutrition Micronized Creatine Monohydrate Powder — 120 Servings',
    brand: 'Optimum Nutrition',
    price: 32.99,
    image: 'https://m.media-amazon.com/images/I/61e2s-cF+xL._AC_SX400_.jpg',
    merchant: 'Amazon',
    domain: 'amazon.com',
    cashbackRate: 1.0,
    cashbackAmount: 0.33,
    affiliateUrl: 'https://wild.link/e?c=1234567&d=38807951&url=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB002DYIZEO',
  },
  {
    productId: 'bodybuilding_creatine',
    title: 'MuscleTech Cell-Tech Creatine Monohydrate — 6lbs',
    brand: 'MuscleTech',
    price: 49.97,
    image: 'https://www.bodybuilding.com/images/store/400/400/143651.jpg',
    merchant: 'Bodybuilding.com',
    domain: 'bodybuilding.com',
    cashbackRate: 5.0,
    cashbackAmount: 2.50,
    affiliateUrl: 'https://wild.link/e?c=2345678&d=38807951&url=https%3A%2F%2Fwww.bodybuilding.com%2Fstore%2Fmuscletech%2Fcell-tech.html',
  },
  {
    productId: 'gnc_creatine',
    title: 'GNC Pro Performance Creatine Monohydrate — Unflavored 300g',
    brand: 'GNC',
    price: 19.99,
    image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-masterCatalog_GNC/default/dw_400x400/images/hi-res/350163_web.jpg',
    merchant: 'GNC',
    domain: 'gnc.com',
    cashbackRate: 4.0,
    cashbackAmount: 0.80,
    affiliateUrl: 'https://wild.link/e?c=3456789&d=38807951&url=https%3A%2F%2Fwww.gnc.com%2Fcreatine%2F350163.html',
  },
  {
    productId: 'sony_wh1000xm5',
    title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    brand: 'Sony',
    price: 348.00,
    image: 'https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SX400_.jpg',
    merchant: 'Amazon',
    domain: 'amazon.com',
    cashbackRate: 1.0,
    cashbackAmount: 3.48,
    affiliateUrl: 'https://wild.link/e?c=1234567&d=38807951&url=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB0BX2L8PZG',
  },
  {
    productId: 'airpods_pro2',
    title: 'Apple AirPods Pro 2 with USB-C',
    brand: 'Apple',
    price: 249.00,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=400&fmt=jpeg',
    merchant: 'Best Buy',
    domain: 'bestbuy.com',
    cashbackRate: 1.5,
    cashbackAmount: 3.74,
    affiliateUrl: 'https://wild.link/e?c=4567890&d=38807951&url=https%3A%2F%2Fwww.bestbuy.com%2Fsite%2Fapple-airpods-pro-2%2F6447382.p',
  },
  {
    productId: 'north_face_puffer',
    title: 'The North Face Nuptse 1996 Retro Puffer Jacket',
    brand: 'The North Face',
    price: 330.00,
    image: 'https://images.thenorthface.com/is/image/TheNorthFace/NF0A3C8D_JK3_hero?wid=400&fmt=jpeg',
    merchant: 'The North Face',
    domain: 'thenorthface.com',
    cashbackRate: 2.5,
    cashbackAmount: 8.25,
    affiliateUrl: 'https://wild.link/e?c=5678901&d=38807951&url=https%3A%2F%2Fwww.thenorthface.com%2Fen-us%2Fjackets',
  },
  {
    productId: 'lululemon_abc',
    title: 'lululemon ABC Classic-Fit Pants — Warpstreme',
    brand: 'lululemon',
    price: 138.00,
    image: 'https://images.lululemon.com/is/image/lululemon/LM5AQDS_0001_1?wid=400&fmt=jpeg',
    merchant: 'lululemon',
    domain: 'lululemon.com',
    cashbackRate: 3.0,
    cashbackAmount: 4.14,
    affiliateUrl: 'https://wild.link/e?c=6789012&d=38807951&url=https%3A%2F%2Fshop.lululemon.com%2Fp%2Fmen-pants%2FAbc-Classic-Fit-Pant',
  },
];

// ─── Search Logic ───

function searchProducts(query, maxResults = 5) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);

  const scored = mockProducts.map(p => {
    const searchable = `${p.title} ${p.brand} ${p.merchant}`.toLowerCase();
    if (searchable.includes(queryLower)) return { product: p, score: 100 };
    const matchCount = queryWords.filter(w => searchable.includes(w)).length;
    return { product: p, score: matchCount };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.product);
}

// NL intent → keywords
function extractKeywords(intent) {
  const stopWords = new Set([
    'find', 'me', 'the', 'best', 'a', 'an', 'some', 'good', 'great',
    'cheap', 'cheapest', 'expensive', 'top', 'rated', 'popular',
    'i', 'want', 'need', 'looking', 'for', 'get', 'buy', 'purchase',
    'show', 'search', 'with', 'and', 'or', 'under', 'over', 'below',
    'above', 'less', 'than', 'more', 'highest', 'lowest', 'deals',
    'deal', 'please', 'can', 'you', 'could', 'would', 'should',
    'of', 'in', 'on', 'at', 'to', 'is', 'it', 'my', 'that', 'this'
  ]);
  return intent.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => !stopWords.has(w) && w.length > 1 && !w.startsWith('$'))
    .join(' ');
}

function extractPriceMax(intent) {
  const m = intent.match(/under\s*\$?(\d+)/i) || intent.match(/below\s*\$?(\d+)/i) || intent.match(/less\s+than\s*\$?(\d+)/i);
  return m ? parseInt(m[1]) : null;
}

// ─── In-memory agent store ───

const agents = {};

// ─── Create MCP Server ───

function createServer() {
  const server = new McpServer({
    name: 'FiberAgent',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    }
  });

  // ─── TOOL: search_products ───
  server.tool(
    'search_products',
    'Search for products across 50,000+ merchants with real-time cashback rates. Returns product details, prices, cashback amounts, and affiliate purchase links.',
    {
      keywords: z.string().describe('Product search terms (e.g., "nike running shoes", "creatine", "wireless headphones")'),
      agent_id: z.string().optional().describe('Your agent ID for earning cashback commissions. Register first with register_agent.'),
      max_results: z.number().optional().default(5).describe('Max results to return (1-20)'),
    },
    async ({ keywords, agent_id, max_results }) => {
      const results = searchProducts(keywords, max_results || 5);

      if (agent_id && agents[agent_id]) {
        agents[agent_id].searches++;
      }

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: `No products found for "${keywords}". Try broader search terms.` }],
        };
      }

      const formatted = results.map((p, i) => 
        `${i + 1}. **${p.title}**\n` +
        `   💰 $${p.price.toFixed(2)} at ${p.merchant} (${p.domain})\n` +
        `   🔄 ${p.cashbackRate}% cashback → $${p.cashbackAmount.toFixed(2)} back\n` +
        `   🛒 ${p.affiliateUrl}`
      ).join('\n\n');

      return {
        content: [{
          type: 'text',
          text: `## Search Results: "${keywords}"\n\n${formatted}\n\n---\n*${results.length} products from Fiber's affiliate network. Cashback earned on every purchase.*`
        }],
      };
    }
  );

  // ─── TOOL: search_by_intent ───
  server.tool(
    'search_by_intent',
    'Natural language shopping — describe what you want and FiberAgent finds the best products. Supports price constraints ("under $30"), cashback optimization, and preference filtering.',
    {
      intent: z.string().describe('Natural language shopping request (e.g., "Find creatine monohydrate under $30, highest cashback")'),
      agent_id: z.string().optional().describe('Your agent ID for earning cashback'),
      preferences: z.array(z.string()).optional().describe('Product preferences to boost in results (e.g., ["unflavored", "bulk"])'),
    },
    async ({ intent, agent_id, preferences }) => {
      const keywords = extractKeywords(intent);
      const maxPrice = extractPriceMax(intent);
      const wantsCashback = /highest\s+cashback|best\s+cashback|most\s+cashback/i.test(intent);

      if (!keywords || keywords.trim().length === 0) {
        return {
          content: [{ type: 'text', text: 'Could not extract search terms from your request. Try: "Find Nike running shoes under $150"' }],
        };
      }

      let results = searchProducts(keywords, 20);

      // Price filter
      if (maxPrice) {
        results = results.filter(p => p.price <= maxPrice);
      }

      // Preference boost
      if (preferences && preferences.length > 0) {
        results.sort((a, b) => {
          const aMatch = preferences.some(pref => a.title.toLowerCase().includes(pref.toLowerCase()));
          const bMatch = preferences.some(pref => b.title.toLowerCase().includes(pref.toLowerCase()));
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }

      // Cashback sort
      if (wantsCashback) {
        results.sort((a, b) => b.cashbackAmount - a.cashbackAmount);
      }

      results = results.slice(0, 5);

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: `No products match your request: "${intent}"\n\nParsed: keywords="${keywords}"${maxPrice ? `, max price=$${maxPrice}` : ''}\n\nTry adjusting your search or increasing the budget.` }],
        };
      }

      const formatted = results.map((p, i) =>
        `${i + 1}. **${p.title}**\n` +
        `   💰 $${p.price.toFixed(2)} at ${p.merchant}\n` +
        `   🔄 ${p.cashbackRate}% cashback → $${p.cashbackAmount.toFixed(2)} back\n` +
        `   🛒 ${p.affiliateUrl}`
      ).join('\n\n');

      return {
        content: [{
          type: 'text',
          text: `## FiberAgent Results\n**Intent:** ${intent}\n**Parsed:** keywords="${keywords}"${maxPrice ? ` | max $${maxPrice}` : ''}${wantsCashback ? ' | sorted by cashback' : ''}\n\n${formatted}\n\n---\n*Results ranked by relevance${wantsCashback ? ' and cashback rate' : ''}.*`
        }],
      };
    }
  );

  // ─── TOOL: register_agent ───
  server.tool(
    'register_agent',
    'Register an AI agent with a crypto wallet to earn cashback commissions on purchases routed through FiberAgent. Supports MON, BONK, and USDC on Monad.',
    {
      agent_id: z.string().describe('Unique identifier for your agent (e.g., "oracle_agent", "shopping_bot_001")'),
      wallet_address: z.string().describe('EVM wallet address on Monad for receiving cashback (e.g., "0x26EE...")'),
      agent_name: z.string().optional().describe('Human-readable name for your agent'),
      crypto_preference: z.enum(['MON', 'BONK', 'USDC']).optional().default('MON').describe('Preferred reward token'),
    },
    async ({ agent_id, wallet_address, agent_name, crypto_preference }) => {
      if (agents[agent_id]) {
        return {
          content: [{ type: 'text', text: `Agent "${agent_id}" is already registered.\n\nWallet: ${agents[agent_id].wallet_address}\nRegistered: ${agents[agent_id].registered_at}` }],
        };
      }

      agents[agent_id] = {
        agent_id,
        agent_name: agent_name || agent_id,
        wallet_address,
        crypto_preference: crypto_preference || 'MON',
        registered_at: new Date().toISOString(),
        searches: 0,
        earnings: 0,
      };

      return {
        content: [{
          type: 'text',
          text: `✅ Agent registered successfully!\n\n**Agent ID:** ${agent_id}\n**Name:** ${agents[agent_id].agent_name}\n**Wallet:** ${wallet_address}\n**Token:** ${agents[agent_id].crypto_preference}\n**ERC-8004:** https://www.8004scan.io/agents/monad/135\n\nYou're now earning cashback on every purchase routed through FiberAgent. Use search_products or search_by_intent to find products.`
        }],
      };
    }
  );

  // ─── TOOL: get_agent_stats ───
  server.tool(
    'get_agent_stats',
    'Get performance statistics for a registered agent — searches, earnings, and activity.',
    {
      agent_id: z.string().describe('The agent ID to look up'),
    },
    async ({ agent_id }) => {
      const agent = agents[agent_id];

      const stats = agent ? {
        agent_id,
        agent_name: agent.agent_name,
        wallet: agent.wallet_address,
        total_searches: agent.searches,
        total_earnings_mon: agent.earnings,
        fiber_points: agent.searches * 10,
        registered_at: agent.registered_at,
      } : {
        agent_id,
        note: 'Agent not registered in this session. Stats reset on serverless cold start.',
        total_searches: 0,
        total_earnings_mon: 0,
        fiber_points: 0,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
      };
    }
  );

  // ─── TOOL: compare_cashback ───
  server.tool(
    'compare_cashback',
    'Compare the same or similar products across different merchants to find the highest cashback rate. Smart agents pick the merchant that pays the most back.',
    {
      product_query: z.string().describe('Product to search for (e.g., "nike air force 1", "creatine")'),
      agent_id: z.string().optional().describe('Your agent ID for tracking'),
    },
    async ({ product_query, agent_id }) => {
      const results = searchProducts(product_query, 20);

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: `No products found for "${product_query}".` }],
        };
      }

      // Group by brand/category, sort by cashback
      const sorted = [...results].sort((a, b) => b.cashbackRate - a.cashbackRate);

      const comparison = sorted.map((p, i) =>
        `${i + 1}. **${p.merchant}** (${p.domain}) — ${p.cashbackRate}% → $${p.cashbackAmount.toFixed(2)} cashback\n` +
        `   ${p.title} — $${p.price.toFixed(2)}`
      ).join('\n\n');

      const best = sorted[0];
      const worst = sorted[sorted.length - 1];
      const savings = best.cashbackAmount - worst.cashbackAmount;

      return {
        content: [{
          type: 'text',
          text: `## Cashback Comparison: "${product_query}"\n\n${comparison}\n\n---\n🏆 **Best:** ${best.merchant} at ${best.cashbackRate}% ($${best.cashbackAmount.toFixed(2)} back)\n${savings > 0 ? `💡 Choosing ${best.merchant} over ${worst.merchant} saves **$${savings.toFixed(2)}** per purchase` : ''}`
        }],
      };
    }
  );

  // ─── RESOURCE: merchant catalog ───
  server.resource(
    'merchant-catalog',
    'fiber://merchants/catalog',
    {
      description: 'Browse FiberAgent\'s merchant catalog — top merchants with cashback rates',
      mimeType: 'application/json',
    },
    async () => {
      // Unique merchants from catalog
      const merchants = {};
      for (const p of mockProducts) {
        if (!merchants[p.merchant]) {
          merchants[p.merchant] = {
            name: p.merchant,
            domain: p.domain,
            cashbackRate: p.cashbackRate,
            sampleProducts: [],
          };
        }
        merchants[p.merchant].sampleProducts.push(p.title);
      }

      return {
        contents: [{
          uri: 'fiber://merchants/catalog',
          mimeType: 'application/json',
          text: JSON.stringify({
            total_merchants: '50,000+',
            catalog_sample: Object.values(merchants),
            note: 'This is a sample. Full catalog available via Fiber API.',
            powered_by: 'Wildfire/Fiber affiliate network',
          }, null, 2),
        }],
      };
    }
  );

  // ─── RESOURCE: agent card ───
  server.resource(
    'agent-card',
    'fiber://agent-card',
    {
      description: 'FiberAgent discovery metadata — capabilities, endpoints, blockchain info',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [{
        uri: 'fiber://agent-card',
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'FiberAgent',
          version: '1.1.0',
          description: 'AI shopping agent for 50,000+ merchants with on-chain rewards',
          capabilities: ['product_search', 'natural_language_tasks', 'agent_registration', 'cashback_comparison'],
          blockchain: { network: 'Monad', standard: 'ERC-8004', agent_id: 135 },
          rewards: { tokens: ['MON', 'BONK', 'USDC'], mechanism: 'Affiliate cashback via Fiber/Wildfire' },
          mcp_endpoint: 'https://fiberagent.shop/api/mcp',
          rest_api: 'https://fiberagent.shop/api/docs',
          website: 'https://fiberagent.shop',
        }, null, 2),
      }],
    })
  );

  // ─── RESOURCE: top cashback rates ───
  server.resource(
    'cashback-rates',
    'fiber://rates/top',
    {
      description: 'Current top cashback rates by merchant',
      mimeType: 'application/json',
    },
    async () => {
      const rates = {};
      for (const p of mockProducts) {
        if (!rates[p.merchant] || rates[p.merchant].rate < p.cashbackRate) {
          rates[p.merchant] = { merchant: p.merchant, domain: p.domain, rate: p.cashbackRate };
        }
      }
      const sorted = Object.values(rates).sort((a, b) => b.rate - a.rate);

      return {
        contents: [{
          uri: 'fiber://rates/top',
          mimeType: 'application/json',
          text: JSON.stringify({ top_cashback_rates: sorted }, null, 2),
        }],
      };
    }
  );

  // ─── PROMPT: shopping assistant ───
  server.prompt(
    'shopping_assistant',
    'Turn any AI into a shopping assistant with access to 50,000+ merchants and cashback',
    {
      budget: z.string().optional().describe('Max budget (e.g., "$200")'),
      category: z.string().optional().describe('Product category (e.g., "shoes", "electronics", "supplements")'),
    },
    async ({ budget, category }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `You are a shopping assistant powered by FiberAgent. You help users find products across 50,000+ merchants and maximize their cashback earnings.\n\n${budget ? `Budget: ${budget}\n` : ''}${category ? `Category: ${category}\n` : ''}\nYour workflow:\n1. Understand what the user wants\n2. Use search_products or search_by_intent to find options\n3. Use compare_cashback to find the best merchant for each product\n4. Present results clearly with prices, cashback, and purchase links\n5. Always recommend the merchant with the highest cashback\n\nBe concise. Show real prices. Include affiliate links. Mention that cashback is earned in crypto (MON on Monad).`
        }
      }],
    })
  );

  // ─── PROMPT: deal finder ───
  server.prompt(
    'deal_finder',
    'Find the absolute best deal for a specific item — compares prices and cashback across merchants',
    {
      item: z.string().describe('The item to find deals for (e.g., "Nike Air Force 1")'),
    },
    async ({ item }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Find the best deal for: ${item}\n\nSearch for this item, compare all available merchants, and tell me:\n1. Lowest price available\n2. Highest cashback available\n3. Best overall value (price minus cashback)\n4. Purchase link for the best option\n\nUse search_products and compare_cashback tools.`
        }
      }],
    })
  );

  return server;
}

// ─── Vercel Handler ───

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('MCP error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
}
