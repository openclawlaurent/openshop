const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Behavioral personalization services
const personalizationEngine = require('../src/services/personalizationEngine');
const behavioralTags = require('../src/services/behavioralTags');
const onChainSignals = require('../src/services/onChainSignals');

// Phase 2 Economics services
const queryStaking = require('../src/services/queryStaking');
const kickbackSystem = require('../src/services/kickbackSystem');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const dbPath = path.join(__dirname, 'fiberagent.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
    initializeDatabase();
  }
});

// Database helper functions
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Agents table
    db.run(`
      CREATE TABLE IF NOT EXISTS agents (
        agent_id TEXT PRIMARY KEY,
        agent_name TEXT,
        wallet_address TEXT,
        crypto_preference TEXT DEFAULT 'MON',
        token TEXT,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_earnings REAL DEFAULT 0,
        total_purchases_tracked INTEGER DEFAULT 0,
        api_calls_made INTEGER DEFAULT 0,
        searches_made INTEGER DEFAULT 0
      )
    `);

    // Purchases table
    db.run(`
      CREATE TABLE IF NOT EXISTS purchases (
        purchase_id TEXT PRIMARY KEY,
        product_id TEXT,
        product_title TEXT,
        agent_id TEXT,
        purchase_amount REAL,
        reward_amount REAL,
        reward_currency TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'completed',
        FOREIGN KEY(agent_id) REFERENCES agents(agent_id)
      )
    `);

    // API stats table
    db.run(`
      CREATE TABLE IF NOT EXISTS api_stats (
        id INTEGER PRIMARY KEY,
        stat_type TEXT,
        stat_key TEXT,
        stat_value INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Search history table
    db.run(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY,
        agent_id TEXT,
        query TEXT,
        results_count INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(agent_id) REFERENCES agents(agent_id)
      )
    `);

    // Agent stakes table (Phase 2)
    db.run(`
      CREATE TABLE IF NOT EXISTS agent_stakes (
        stake_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        query TEXT NOT NULL,
        amount_staked REAL NOT NULL,
        product_id_intent TEXT,
        status TEXT DEFAULT 'active',
        kickback_multiplier REAL DEFAULT 1.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        claimed_earnings REAL DEFAULT 0,
        memo TEXT,
        FOREIGN KEY(agent_id) REFERENCES agents(agent_id),
        UNIQUE(agent_id, query)
      )
    `);

    // Agent balances table (Phase 2)
    db.run(`
      CREATE TABLE IF NOT EXISTS agent_balances (
        agent_id TEXT PRIMARY KEY,
        available_balance REAL DEFAULT 0,
        locked_in_stakes REAL DEFAULT 0,
        total_earned REAL DEFAULT 0,
        FOREIGN KEY(agent_id) REFERENCES agents(agent_id)
      )
    `, () => {
      console.log('Database tables initialized');
      // Initialize QueryStaking with database connection
      queryStaking.setDatabase(db);
      console.log('✓ QueryStaking system connected to database');
      // Initialize mock data after tables are created
      setTimeout(initializeMockData, 500);
    });
  });
}

// Helper function to track stats
async function trackStat(statType, statKey) {
  try {
    await run(
      `INSERT INTO api_stats (stat_type, stat_key) VALUES (?, ?)`,
      [statType, statKey]
    );
  } catch (err) {
    console.error('Error tracking stat:', err);
  }
}

// Helper function to generate token
function generateToken() {
  return 'token_' + Math.random().toString(36).substr(2, 9);
}

// Mock Fiber.shop product data
const mockProducts = {
  results: [
    {
      productId: 'prod_123',
      title: 'Blue Adidas Running Shoes',
      brand: 'Adidas',
      price: 99.99,
      priceFormatted: '$99.99',
      inStock: true,
      image: 'https://via.placeholder.com/250x150?text=Adidas+Shoes',
      shop: {
        merchantId: 456,
        name: 'Adidas Store',
        domain: 'adidas.com',
        score: 8.5
      },
      cashback: {
        rate: '5%',
        amount: 5.0,
        type: 'percentage',
        allRates: []
      }
    },
    {
      productId: 'prod_456',
      title: 'Red Adidas Hoodie',
      brand: 'Adidas',
      price: 79.99,
      priceFormatted: '$79.99',
      inStock: true,
      image: 'https://via.placeholder.com/250x150?text=Adidas+Hoodie',
      shop: {
        merchantId: 789,
        name: 'Adidas Outlet',
        domain: 'adidasoutlet.com',
        score: 7.9
      },
      cashback: {
        rate: '3%',
        amount: 2.4,
        type: 'percentage',
        allRates: []
      }
    },
    {
      productId: 'prod_789',
      title: 'White Adidas T-shirt',
      brand: 'Adidas',
      price: 39.99,
      priceFormatted: '$39.99',
      inStock: false,
      image: 'https://via.placeholder.com/250x150?text=Adidas+Tshirt',
      shop: {
        merchantId: 101,
        name: 'Adidas Online Store',
        domain: 'adidas.com',
        score: 9.2
      },
      cashback: {
        rate: '2%',
        amount: 0.8,
        type: 'percentage',
        allRates: []
      }
    },
    {
      productId: 'prod_111',
      title: 'Nike Blue Rain Boots',
      brand: 'Nike',
      price: 119.99,
      priceFormatted: '$119.99',
      inStock: true,
      image: 'https://via.placeholder.com/250x150?text=Nike+Boots',
      shop: {
        merchantId: 222,
        name: 'Nike Direct',
        domain: 'nike.com',
        score: 9.1
      },
      cashback: {
        rate: '4%',
        amount: 4.8,
        type: 'percentage',
        allRates: []
      }
    },
    {
      productId: 'prod_222',
      title: 'Puma Black Waterproof Shoes',
      brand: 'Puma',
      price: 89.99,
      priceFormatted: '$89.99',
      inStock: true,
      image: 'https://via.placeholder.com/250x150?text=Puma+Shoes',
      shop: {
        merchantId: 333,
        name: 'Puma Shop',
        domain: 'puma.com',
        score: 8.7
      },
      cashback: {
        rate: '6%',
        amount: 5.4,
        type: 'percentage',
        allRates: []
      }
    }
  ]
};

// ==================
// AGENT ENDPOINTS
// ==================

// 1. Register/Login Agent
app.post('/api/agent/register', async (req, res) => {
  const { agent_id, agent_name, wallet_address, crypto_preference } = req.body;

  if (!agent_id || !wallet_address) {
    return res.status(400).json({ 
      error: 'Missing required fields: agent_id, wallet_address' 
    });
  }

  try {
    // Check if agent already exists
    const existingAgent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    
    if (existingAgent) {
      // Update existing agent
      await run(
        `UPDATE agents SET agent_name = ?, wallet_address = ?, crypto_preference = ? WHERE agent_id = ?`,
        [agent_name || agent_id, wallet_address, crypto_preference || 'MON', agent_id]
      );
    } else {
      // Create new agent
      const token = generateToken();
      await run(
        `INSERT INTO agents (agent_id, agent_name, wallet_address, crypto_preference, token)
         VALUES (?, ?, ?, ?, ?)`,
        [agent_id, agent_name || agent_id, wallet_address, crypto_preference || 'MON', token]
      );
    }

    await trackStat('endpoint', 'register');

    const agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);

    res.json({
      success: true,
      message: existingAgent ? 'Agent updated successfully' : 'Agent registered successfully',
      agent: agent
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Search Products (GET - Standard REST)
app.get('/api/agent/search', async (req, res) => {
  const { keywords, wallet, agent_id, size = 10 } = req.query;
  const query = keywords || wallet; // Accept either keywords or wallet param

  if (!query) {
    return res.status(400).json({ error: 'Query parameter required: keywords or wallet' });
  }

  try {
    await trackStat('endpoint', 'search');

    // Check if agent exists, create if not
    let agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id || 'anonymous']);
    if (!agent && agent_id) {
      const token = generateToken();
      await run(
        `INSERT INTO agents (agent_id, agent_name, wallet_address, crypto_preference, token)
         VALUES (?, ?, ?, ?, ?)`,
        [agent_id, agent_id, wallet || `0x${agent_id}`, 'MON', token]
      );
      agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    }

    // Update agent stats
    if (agent_id && agent) {
      await run(
        `UPDATE agents SET api_calls_made = api_calls_made + 1, searches_made = searches_made + 1 
         WHERE agent_id = ?`,
        [agent_id]
      );
    }

    // Search products
    const filteredProducts = mockProducts.results
      .filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.shop.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, parseInt(size));

    // Track search history
    if (agent_id) {
      await run(
        `INSERT INTO search_history (agent_id, query, results_count) VALUES (?, ?, ?)`,
        [agent_id, query, filteredProducts.length]
      );
    }

    res.json({
      success: true,
      query,
      agent_id: agent_id || 'anonymous',
      wallet: wallet || 'unknown',
      results: filteredProducts,
      total_results: filteredProducts.length,
      timestamp: new Date(),
      message: `Found ${filteredProducts.length} products. Each product includes cashback that agent receives when purchase is tracked.`
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2b. Search Products (POST - Alternative)
app.post('/api/agent/search', async (req, res) => {
  const { query, agent_id, size = 10 } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    await trackStat('endpoint', 'search');

    // Check if agent exists, create if not
    let agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    if (!agent) {
      const token = generateToken();
      await run(
        `INSERT INTO agents (agent_id, agent_name, wallet_address, crypto_preference, token)
         VALUES (?, ?, ?, ?, ?)`,
        [agent_id, agent_id, `0x${agent_id}`, 'MON', token]
      );
      agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    }

    // Update agent stats
    await run(
      `UPDATE agents SET api_calls_made = api_calls_made + 1, searches_made = searches_made + 1 
       WHERE agent_id = ?`,
      [agent_id]
    );

    // Track search history
    const filteredProducts = mockProducts.results
      .filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.shop.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, size);

    await run(
      `INSERT INTO search_history (agent_id, query, results_count) VALUES (?, ?, ?)`,
      [agent_id, query, filteredProducts.length]
    );

    res.json({
      success: true,
      query,
      agent_id,
      results: filteredProducts,
      total_results: filteredProducts.length,
      timestamp: new Date(),
      note: 'Each product includes cashback amount. Agent will receive this amount in crypto when purchase is tracked.'
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2c. Personalized Search (with behavioral boosts)
app.get('/api/agent/search/personalized', async (req, res) => {
  const { keywords, wallet, agent_id, size = 10 } = req.query;
  const query = keywords || wallet;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter required: keywords' });
  }

  if (!wallet) {
    return res.status(400).json({ error: 'wallet parameter required for personalized search' });
  }

  try {
    await trackStat('endpoint', 'search_personalized');

    // Check if agent exists, create if not
    let agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id || 'anonymous']);
    if (!agent && agent_id) {
      const token = generateToken();
      await run(
        `INSERT INTO agents (agent_id, agent_name, wallet_address, crypto_preference, token)
         VALUES (?, ?, ?, ?, ?)`,
        [agent_id, agent_id, wallet, 'MON', token]
      );
      agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    }

    // Update agent stats
    if (agent_id && agent) {
      await run(
        `UPDATE agents SET api_calls_made = api_calls_made + 1, searches_made = searches_made + 1 
         WHERE agent_id = ?`,
        [agent_id]
      );
    }

    // Get base search results
    const baseProducts = mockProducts.results
      .filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.shop.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, parseInt(size));

    // Apply personalization
    const personalized = await personalizationEngine.personalizeSearchResults(baseProducts, wallet, query);

    // Track search history
    if (agent_id) {
      await run(
        `INSERT INTO search_history (agent_id, query, results_count) VALUES (?, ?, ?)`,
        [agent_id, query, personalized.products.length]
      );
    }

    res.json({
      success: true,
      query,
      agent_id: agent_id || 'anonymous',
      wallet,
      results: personalized.products,
      total_results: personalized.products.length,
      personalization: personalized.personalization,
      tags: personalized.tags,
      signals: personalized.signals,
      timestamp: new Date(),
      message: personalized.personalization.applied 
        ? `Found ${personalized.products.length} products with +${personalized.personalization.avgBoost}% avg behavioral boost`
        : `Found ${personalized.products.length} products`
    });
  } catch (err) {
    console.error('Personalized search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Product Details
app.post('/api/agent/product-details', async (req, res) => {
  const { product_id, agent_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }

  try {
    await trackStat('endpoint', 'product_details');

    const agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    if (agent) {
      await run(
        `UPDATE agents SET api_calls_made = api_calls_made + 1 WHERE agent_id = ?`,
        [agent_id]
      );
    }

    const product = mockProducts.results.find(p => p.productId === product_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const affiliateLink = `https://${product.shop.domain}?ref=${agent_id}`;

    res.json({
      success: true,
      product: {
        ...product,
        affiliate_link: affiliateLink,
        agent_reward: product.cashback.amount,
        crypto_currency: agent?.crypto_preference || 'MON'
      }
    });
  } catch (err) {
    console.error('Product details error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Track Purchase & Register Reward
app.post('/api/agent/track-purchase', async (req, res) => {
  const { product_id, agent_id, purchase_amount } = req.body;

  if (!product_id || !agent_id || !purchase_amount) {
    return res.status(400).json({ 
      error: 'Missing required fields: product_id, agent_id, purchase_amount' 
    });
  }

  try {
    await trackStat('endpoint', 'track_purchase');

    const product = mockProducts.results.find(p => p.productId === product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const cashbackPercentage = parseFloat(product.cashback.rate) / 100;
    const rewardAmount = purchase_amount * cashbackPercentage;

    let agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    if (!agent) {
      const token = generateToken();
      await run(
        `INSERT INTO agents (agent_id, agent_name, wallet_address, crypto_preference, token)
         VALUES (?, ?, ?, ?, ?)`,
        [agent_id, agent_id, `0x${agent_id}`, 'MON', token]
      );
      agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    }

    const purchaseId = 'purchase_' + Date.now();

    await run(
      `INSERT INTO purchases (purchase_id, product_id, product_title, agent_id, purchase_amount, reward_amount, reward_currency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [purchaseId, product_id, product.title, agent_id, purchase_amount, rewardAmount, agent.crypto_preference || 'MON', 'completed']
    );

    await run(
      `UPDATE agents SET total_earnings = total_earnings + ?, total_purchases_tracked = total_purchases_tracked + 1 
       WHERE agent_id = ?`,
      [rewardAmount, agent_id]
    );

    agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);

    res.json({
      success: true,
      message: 'Purchase tracked successfully',
      purchase: {
        purchase_id: purchaseId,
        product_id,
        product_title: product.title,
        agent_id,
        purchase_amount,
        reward_amount: rewardAmount,
        reward_currency: agent.crypto_preference || 'MON',
        timestamp: new Date(),
        status: 'completed'
      },
      agent_updated: {
        agent_id: agent.agent_id,
        total_earnings: agent.total_earnings,
        total_purchases_tracked: agent.total_purchases_tracked
      }
    });
  } catch (err) {
    console.error('Track purchase error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Agent Earnings
app.get('/api/agent/earnings/:agent_id', async (req, res) => {
  const { agent_id } = req.params;

  try {
    await trackStat('endpoint', 'get_earnings');

    const agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agentPurchases = await all(
      `SELECT * FROM purchases WHERE agent_id = ? ORDER BY timestamp DESC`,
      [agent_id]
    );

    res.json({
      success: true,
      agent_id,
      agent_name: agent.agent_name,
      wallet_address: agent.wallet_address,
      crypto_preference: agent.crypto_preference,
      total_earnings: agent.total_earnings,
      total_purchases_tracked: agent.total_purchases_tracked,
      api_calls_made: agent.api_calls_made || 0,
      searches_made: agent.searches_made || 0,
      purchases: agentPurchases,
      pending_withdrawal: agent.total_earnings
    });
  } catch (err) {
    console.error('Get earnings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Comprehensive Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const agents = await all(`SELECT * FROM agents ORDER BY total_earnings DESC`);
    const topAgents = agents.slice(0, 10);
    const purchases = await all(`SELECT * FROM purchases ORDER BY timestamp DESC`);
    const searchHistory = await all(`SELECT * FROM search_history ORDER BY timestamp DESC LIMIT 20`);

    // Calculate search stats
    const searchCounts = {};
    const searches = await all(`SELECT query, COUNT(*) as count FROM search_history GROUP BY query ORDER BY count DESC LIMIT 10`);
    
    const totalNetworkEarnings = agents.reduce((sum, agent) => sum + agent.total_earnings, 0);
    const totalApiCalls = await get(`SELECT COUNT(*) as count FROM api_stats`);
    const totalRegistrations = agents.length;
    const totalSearches = searchHistory.length;
    const totalPurchases = purchases.length;
    const totalProductDetails = await get(`SELECT COUNT(*) as count FROM api_stats WHERE stat_key = 'product_details'`);

    res.json({
      success: true,
      timestamp: new Date(),
      overview: {
        total_api_calls: totalApiCalls?.count || 0,
        total_agents_registered: totalRegistrations,
        active_agents: agents.length,
        total_searches: totalSearches,
        total_product_details_requests: totalProductDetails?.count || 0,
        total_purchases_tracked: totalPurchases,
        total_network_earnings: totalNetworkEarnings.toFixed(2),
        network_currency: 'MON'
      },
      top_agents: topAgents.map(a => ({
        agent_id: a.agent_id,
        agent_name: a.agent_name,
        total_earnings: a.total_earnings,
        total_purchases: a.total_purchases_tracked,
        api_calls_made: a.api_calls_made || 0,
        searches_made: a.searches_made || 0,
        registered_at: a.registered_at
      })),
      top_searches: searches,
      recent_searches: searchHistory.slice(0, 10),
      all_agents: {
        total: agents.length,
        agents: agents.map(a => ({
          agent_id: a.agent_id,
          agent_name: a.agent_name,
          total_earnings: a.total_earnings,
          total_purchases_tracked: a.total_purchases_tracked,
          api_calls_made: a.api_calls_made || 0,
          searches_made: a.searches_made || 0
        }))
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Earnings Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await all(
      `SELECT 
        agent_id, 
        agent_name, 
        wallet_address,
        crypto_preference,
        total_earnings, 
        total_purchases_tracked,
        api_calls_made,
        searches_made,
        registered_at
      FROM agents 
      ORDER BY total_earnings DESC`
    );

    res.json({
      success: true,
      leaderboard,
      total_agents: leaderboard.length,
      top_earner: leaderboard[0] || null,
      total_network_earnings: leaderboard.reduce((sum, a) => sum + a.total_earnings, 0)
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Health Check
app.get('/api/health', async (req, res) => {
  try {
    const agentCount = await get(`SELECT COUNT(*) as count FROM agents`);
    const purchaseCount = await get(`SELECT COUNT(*) as count FROM purchases`);
    
    res.json({
      status: 'healthy',
      service: 'FiberAgent Agent API',
      version: '1.0.0',
      timestamp: new Date(),
      database: 'SQLite',
      agents_registered: agentCount?.count || 0,
      total_purchases: purchaseCount?.count || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get All Registered Agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await all(`SELECT * FROM agents ORDER BY registered_at DESC`);

    res.json({
      success: true,
      total_agents: agents.length,
      agents: agents
    });
  } catch (err) {
    console.error('Get agents error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================
// PHASE 2: QUERY STAKING & KICKBACKS
// ==================

// 10. Create Query Stake
app.post('/api/agent/create-stake', async (req, res) => {
  const { agent_id, amount, query, product_id_intent } = req.body;

  try {
    const stake = await queryStaking.createStake({
      agent_id: agent_id,
      amount: amount,
      query: query,
      product_id_intent: product_id_intent
    });

    if (!stake.success) {
      return res.status(400).json(stake);
    }

    await trackStat('endpoint', 'create_stake');

    res.json({
      success: true,
      message: stake.message,
      stake: stake.stake
    });
  } catch (err) {
    console.error('Create stake error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 11. Get Agent Stakes
app.get('/api/agent/stakes/:agent_id', async (req, res) => {
  const { agent_id } = req.params;

  try {
    const stakes = await queryStaking.getAgentStakes(agent_id);

    await trackStat('endpoint', 'get_stakes');

    res.json({
      success: true,
      ...stakes
    });
  } catch (err) {
    console.error('Get stakes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 12. Calculate Kickback on Purchase
app.post('/api/agent/calculate-kickback', async (req, res) => {
  const { agent_id, cashback_amount, agent_tier = 'agent', agent_stats = {} } = req.body;

  try {
    const kickback = kickbackSystem.calculateKickback({
      cashback_amount: cashback_amount,
      agent_id: agent_id,
      agent_stats: agent_stats,
      agent_tier: agent_tier
    });

    await trackStat('endpoint', 'calculate_kickback');

    res.json({
      success: true,
      ...kickback
    });
  } catch (err) {
    console.error('Calculate kickback error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 13. Get Staking Stats
app.get('/api/stats/staking', async (req, res) => {
  try {
    const stats = await queryStaking.getStakingStats();
    const foundingAgents = queryStaking.promoteFoundingAgents();

    await trackStat('endpoint', 'staking_stats');

    res.json({
      success: true,
      staking: stats,
      founding_agents: foundingAgents,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Staking stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 14. Predict Monthly Kickback
app.post('/api/agent/predict-kickback', async (req, res) => {
  const { agent_id, agent_stats } = req.body;

  try {
    const prediction = kickbackSystem.predictMonthlyKickback({
      agent_id: agent_id,
      ...agent_stats
    });

    await trackStat('endpoint', 'predict_kickback');

    res.json({
      success: true,
      ...prediction
    });
  } catch (err) {
    console.error('Predict kickback error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Initialize mock data if database is empty
async function initializeMockData() {
  try {
    const agentCount = await get(`SELECT COUNT(*) as count FROM agents`);
    
    if (agentCount && agentCount.count === 0) {
      console.log('📊 Initializing mock data...');
      
      const agentNames = [
        { id: 'agent_claude', name: 'Claude Shopping Assistant' },
        { id: 'agent_gpt', name: 'GPT Commerce Bot' },
        { id: 'agent_gemini', name: 'Gemini Smart Shopper' },
        { id: 'agent_alex', name: 'Alex\'s Shopping Buddy' },
        { id: 'agent_nova', name: 'Nova AI Assistant' }
      ];
      
      const products = [
        { id: 'prod_adidas_shoes', title: 'Adidas Running Shoes', cashback: 4.5 },
        { id: 'prod_nike_boots', title: 'Nike Winter Boots', cashback: 5.0 },
        { id: 'prod_puma_hoodie', title: 'Puma Performance Hoodie', cashback: 3.8 }
      ];
      
      // Create mock agents with random earnings
      for (const agent of agentNames) {
        const numPurchases = Math.floor(Math.random() * 15) + 2;
        let totalEarnings = 0;
        
        const token = generateToken();
        await run(
          `INSERT INTO agents (agent_id, agent_name, wallet_address, crypto_preference, token, api_calls_made, searches_made)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [agent.id, agent.name, `0x${agent.id}`, 'MON', token, Math.floor(Math.random() * 200) + 50, Math.floor(Math.random() * 100) + 20]
        );
        
        // Create mock purchases
        for (let i = 0; i < numPurchases; i++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const purchaseAmount = Math.random() * 200 + 50;
          const rewardAmount = (purchaseAmount * product.cashback) / 100;
          totalEarnings += rewardAmount;
          
          const purchaseId = `purchase_${Date.now()}_${i}`;
          const daysAgo = Math.floor(Math.random() * 30);
          const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
          
          await run(
            `INSERT INTO purchases (purchase_id, product_id, product_title, agent_id, purchase_amount, reward_amount, reward_currency, status, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [purchaseId, product.id, product.title, agent.id, purchaseAmount, rewardAmount, 'MON', 'completed', timestamp.toISOString()]
          );
        }
        
        // Update agent with total earnings
        await run(
          `UPDATE agents SET total_earnings = ?, total_purchases_tracked = ? WHERE agent_id = ?`,
          [totalEarnings, numPurchases, agent.id]
        );
      }
      
      // Add mock search history
      const queries = ['shoes', 'boots', 'hoodie', 'jacket', 'sneakers', 'running shoes', 'winter gear', 'athletic wear'];
      for (let i = 0; i < 25; i++) {
        const query = queries[Math.floor(Math.random() * queries.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        const agent = agentNames[Math.floor(Math.random() * agentNames.length)];
        
        await run(
          `INSERT INTO search_history (agent_id, query, results_count, timestamp)
           VALUES (?, ?, ?, ?)`,
          [agent.id, query, Math.floor(Math.random() * 10) + 1, timestamp.toISOString()]
        );
      }
      
      console.log('✅ Mock data initialized successfully!');
    }
  } catch (err) {
    console.error('Error initializing mock data:', err);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FiberAgent Agent API running on http://localhost:${PORT}`);
  console.log('');
  console.log('📡 AGENT ENDPOINTS:');
  console.log(`   GET  http://localhost:${PORT}/api/agent/search?keywords=shoes&agent_id=my_agent&wallet=0x...`);
  console.log(`   POST http://localhost:${PORT}/api/agent/search`);
  console.log(`   GET  http://localhost:${PORT}/api/agent/earnings/:agent_id`);
  console.log('');
  console.log('📊 NETWORK ENDPOINTS:');
  console.log(`   GET  http://localhost:${PORT}/api/stats`);
  console.log(`   GET  http://localhost:${PORT}/api/leaderboard`);
  console.log(`   GET  http://localhost:${PORT}/api/agents`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log('');
  initializeMockData();
});
