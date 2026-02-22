/**
 * POST /api/agent/task
 * Natural language task endpoint — true agent-to-agent interface
 * 
 * Accepts intent-based requests, processes them, returns structured results.
 * This is what makes FiberAgent an *agent*, not just an API.
 */

import * as utils from '../_lib/utils.js';

const FIBER_API = 'https://api.staging.fiber.shop/v1';

// Extract keywords from natural language intent
function extractKeywords(intent) {
  // Remove common filler words to get search terms
  const stopWords = new Set([
    'find', 'me', 'the', 'best', 'a', 'an', 'some', 'good', 'great',
    'cheap', 'cheapest', 'expensive', 'top', 'rated', 'popular',
    'i', 'want', 'need', 'looking', 'for', 'get', 'buy', 'purchase',
    'show', 'search', 'with', 'and', 'or', 'under', 'over', 'below',
    'above', 'less', 'than', 'more', 'highest', 'lowest', 'deals',
    'deal', 'offer', 'offers', 'discount', 'discounts', 'please',
    'can', 'you', 'could', 'would', 'should', 'of', 'in', 'on', 'at',
    'to', 'is', 'it', 'my', 'that', 'this', 'any', 'all'
  ]);

  const words = intent.toLowerCase()
    .replace(/[^\w\s$]/g, '')
    .split(/\s+/)
    .filter(w => !stopWords.has(w) && w.length > 1 && !w.startsWith('$'));

  return words.join(' ');
}

// Extract price constraint from intent
function extractPriceConstraint(intent) {
  const under = intent.match(/under\s*\$?(\d+)/i);
  const below = intent.match(/below\s*\$?(\d+)/i);
  const less = intent.match(/less\s+than\s*\$?(\d+)/i);
  const max = under || below || less;
  
  if (max) return { max: parseInt(max[1]) };

  const over = intent.match(/over\s*\$?(\d+)/i);
  const above = intent.match(/above\s*\$?(\d+)/i);
  const min = over || above;
  
  if (min) return { min: parseInt(min[1]) };

  return null;
}

// Check if intent asks for highest cashback
function wantsBestCashback(intent) {
  return /highest\s+cashback|best\s+cashback|most\s+cashback|max\s+cashback/i.test(intent);
}

async function searchFiber(keywords, agentId, size = 10) {
  try {
    const params = new URLSearchParams({ keywords, agent_id: agentId, size: String(size) });
    const response = await fetch(`${FIBER_API}/agent/search?${params}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.products) return data.products;
    if (data.results) return data.results;
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (utils.handleCors(req, res)) {
    return res.status(200).end();
  }
  utils.setCorsHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { agent_id, intent, context } = req.body || {};

  if (!agent_id || !intent) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['agent_id', 'intent'],
      optional: ['context'],
      example: {
        agent_id: 'oracle_agent',
        intent: 'Find creatine monohydrate under $30, highest cashback',
        context: { preferences: ['bulk', 'unflavored'] }
      }
    });
  }

  try {
    utils.updateAgentStats(agent_id);

    const keywords = extractKeywords(intent);
    const priceConstraint = extractPriceConstraint(intent);
    const sortByCashback = wantsBestCashback(intent);

    if (!keywords || keywords.trim().length === 0) {
      return res.status(400).json({
        error: 'Could not extract search terms from intent',
        intent,
        hint: 'Try: "Find Nike running shoes under $150"'
      });
    }

    // Search Fiber API, fall back to mock
    let products = await searchFiber(keywords, agent_id, 20);
    let source = 'fiber_live';

    if (!products || products.length === 0) {
      products = utils.searchProducts(keywords, 20);
      source = products.length > 0 ? 'mock_catalog' : 'no_results';
    }

    // Normalize to common format
    products = products.map((p, i) => ({
      productId: p.productId || p.id || p.product_id || `p_${i}`,
      title: p.title || p.name || 'Unknown',
      brand: p.brand || '',
      price: p.price || 0,
      url: p.url || p.product_url || p.affiliateUrl || null,
      affiliateUrl: p.affiliateUrl || p.affiliate_url || p.wild_link || null,
      merchant: p.shop?.name || p.merchant_name || p.merchant || 'Unknown',
      merchantDomain: p.shop?.domain || p.merchant_domain || '',
      cashbackRate: parseFloat(p.cashback?.rate) || p.cashback_rate || 0,
      cashbackAmount: p.cashback?.amount || p.cashback_amount || 0,
      inStock: p.inStock !== false && p.in_stock !== false,
      image: p.image || p.image_url || null
    }));

    // Apply price filter
    if (priceConstraint?.max) {
      products = products.filter(p => p.price <= priceConstraint.max);
    }
    if (priceConstraint?.min) {
      products = products.filter(p => p.price >= priceConstraint.min);
    }

    // Apply preferences from context
    if (context?.preferences && Array.isArray(context.preferences)) {
      // Boost products matching preferences (sort them higher)
      products.sort((a, b) => {
        const aMatch = context.preferences.some(pref => 
          a.title.toLowerCase().includes(pref.toLowerCase()));
        const bMatch = context.preferences.some(pref => 
          b.title.toLowerCase().includes(pref.toLowerCase()));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    // Sort by cashback if requested
    if (sortByCashback) {
      products.sort((a, b) => b.cashbackAmount - a.cashbackAmount);
    }

    // Limit to top results
    const topResults = products.slice(0, 5);

    utils.recordSearch(agent_id, keywords, topResults.length);

    return res.status(200).json({
      success: true,
      task: {
        intent,
        parsed_keywords: keywords,
        price_constraint: priceConstraint,
        sort_by_cashback: sortByCashback,
        preferences: context?.preferences || []
      },
      agent_id,
      total_results: topResults.length,
      results: topResults,
      source,
      timestamp: new Date().toISOString(),
      note: 'Results ranked by relevance, cashback, and agent preferences.'
    });
  } catch (err) {
    console.error('Task error:', err);
    return res.status(500).json({ error: err.message });
  }
}
