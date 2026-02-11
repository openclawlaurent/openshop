// Personalized Search Endpoint
// Add this right after the basic search endpoint in api.js

// app.get('/api/agent/search/personalized', async (req, res) => {
//   const { keywords, wallet, agent_id, size = 10 } = req.query;
//   const query = keywords || wallet;

//   if (!query) {
//     return res.status(400).json({ error: 'Query parameter required: keywords or wallet' });
//   }

//   if (!wallet) {
//     return res.status(400).json({ error: 'wallet parameter required for personalized search' });
//   }

//   try {
//     await trackStat('endpoint', 'search_personalized');

//     // Check if agent exists, create if not
//     let agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id || 'anonymous']);
//     if (!agent && agent_id) {
//       const token = generateToken();
//       await run(
//         `INSERT INTO agents (agent_id, agent_name, wallet_address, crypto_preference, token)
//          VALUES (?, ?, ?, ?, ?)`,
//         [agent_id, agent_id, wallet, 'MON', token]
//       );
//       agent = await get(`SELECT * FROM agents WHERE agent_id = ?`, [agent_id]);
//     }

//     // Update agent stats
//     if (agent_id && agent) {
//       await run(
//         `UPDATE agents SET api_calls_made = api_calls_made + 1, searches_made = searches_made + 1 
//          WHERE agent_id = ?`,
//         [agent_id]
//       );
//     }

//     // Get base search results
//     const baseProducts = mockProducts.results
//       .filter(p => 
//         p.title.toLowerCase().includes(query.toLowerCase()) ||
//         p.brand.toLowerCase().includes(query.toLowerCase()) ||
//         p.shop.name.toLowerCase().includes(query.toLowerCase())
//       )
//       .slice(0, parseInt(size));

//     // Apply personalization
//     const personalizationEngine = require('../src/services/personalizationEngine');
//     const personalized = await personalizationEngine.personalizeSearchResults(baseProducts, wallet, query);

//     // Track search history
//     if (agent_id) {
//       await run(
//         `INSERT INTO search_history (agent_id, query, results_count) VALUES (?, ?, ?)`,
//         [agent_id, query, personalized.products.length]
//       );
//     }

//     res.json({
//       success: true,
//       query,
//       agent_id: agent_id || 'anonymous',
//       wallet,
//       results: personalized.products,
//       total_results: personalized.products.length,
//       personalization: personalized.personalization,
//       tags_applied: personalized.tags,
//       signals: personalized.signals,
//       timestamp: new Date(),
//       message: personalized.personalization.applied 
//         ? `Found ${personalized.products.length} products with ${personalized.personalization.avgBoost}% avg boost`
//         : `Found ${personalized.products.length} products (no personalization)`
//     });
//   } catch (err) {
//     console.error('Personalized search error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });
