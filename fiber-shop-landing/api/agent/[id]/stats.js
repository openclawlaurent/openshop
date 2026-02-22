/**
 * GET /api/agent/:id/stats
 * Get agent performance statistics
 */

import * as utils from '../../_lib/utils.js';

export default function handler(req, res) {
  if (utils.handleCors(req, res)) {
    res.status(200).end();
    return;
  }
  utils.setCorsHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const agentId = req.query.id;

  if (!agentId) {
    return res.status(400).json({ error: 'agent_id is required' });
  }

  let stats = utils.getAgentStats(agentId);

  // In serverless, each function has isolated memory — return reasonable defaults
  if (!stats) {
    stats = {
      agent_id: agentId,
      agent_name: agentId,
      total_searches: 0,
      total_earnings: 0,
      api_calls_made: 0,
      conversions: 0
    };
  }

  return res.status(200).json({
    success: true,
    stats: {
      ...stats,
      total_earnings_mon: stats.total_earnings || 0,
      total_purchases_tracked: 0,
      fiber_points: Math.floor((stats.total_searches || 0) * 10),
      registered_at: utils.getAgent(agentId)?.registered_at || new Date().toISOString(),
      note: 'Stats reset on cold start (serverless). Persistent stats coming with database integration.'
    }
  });
}
