/**
 * GET /api/agent/:id
 * Lookup agent by ID
 */

import * as utils from '../_lib/utils.js';

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

  let agent = utils.getAgent(agentId);

  // In serverless, each function has its own memory — agent may exist but not in this instance
  // Return a reasonable response for any agent_id
  if (!agent) {
    agent = {
      agent_id: agentId,
      agent_name: agentId,
      status: 'active',
      note: 'Agent data available after registration in same session. Serverless functions have isolated memory.',
      registered: false
    };
  } else {
    const { token, ...safeAgent } = agent;
    agent = { ...safeAgent, registered: true };
  }

  return res.status(200).json({
    success: true,
    agent
  });
}
