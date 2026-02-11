import React, { useState, useEffect } from 'react';
import '../styles/RewardsDashboard.css';

export default function RewardsDashboard() {
  const [agents, setAgents] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_URL = `http://${window.location.hostname}:5000`;

  const fetchAgentsData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/agents`);
      const data = await response.json();
      
      if (data.agents) {
        setAgents(data.agents);
        
        // Calculate totals
        const totalEarn = data.agents.reduce((sum, agent) => sum + agent.total_earnings, 0);
        const totalPurch = data.agents.reduce((sum, agent) => sum + agent.total_purchases_tracked, 0);
        
        setTotalEarnings(totalEarn);
        setTotalPurchases(totalPurch);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  useEffect(() => {
    fetchAgentsData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchAgentsData().then(() => setLoading(false));
  };

  return (
    <div className="rewards-dashboard">
      <div className="dashboard-header">
        <h2>📊 Real-Time Rewards Dashboard</h2>
        <p>Live tracking of all agent earnings across FiberAgent</p>
        
        <div className="dashboard-controls">
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card total-earnings">
          <div className="stat-icon">💰</div>
          <h3>Total Earnings</h3>
          <div className="stat-value">{totalEarnings.toFixed(2)}</div>
          <div className="stat-unit">MON</div>
        </div>

        <div className="stat-card total-purchases">
          <div className="stat-icon">🛍️</div>
          <h3>Total Purchases</h3>
          <div className="stat-value">{totalPurchases}</div>
          <div className="stat-unit">Tracked</div>
        </div>

        <div className="stat-card total-agents">
          <div className="stat-icon">🤖</div>
          <h3>Active Agents</h3>
          <div className="stat-value">{agents.length}</div>
          <div className="stat-unit">Connected</div>
        </div>

        <div className="stat-card average-earnings">
          <div className="stat-icon">📈</div>
          <h3>Average Earnings</h3>
          <div className="stat-value">
            {agents.length > 0 ? (totalEarnings / agents.length).toFixed(2) : '0.00'}
          </div>
          <div className="stat-unit">Per Agent</div>
        </div>
      </div>

      <div className="agents-table-container">
        <h3>Agent Leaderboard</h3>
        
        {agents.length === 0 ? (
          <div className="empty-state">
            <p>No agents registered yet</p>
            <p className="hint">Agents who register and make purchases will appear here</p>
          </div>
        ) : (
          <div className="agents-table">
            <div className="table-header">
              <div className="col rank">#</div>
              <div className="col agent-id">Agent ID</div>
              <div className="col agent-name">Agent Name</div>
              <div className="col earnings">Earnings (MON)</div>
              <div className="col purchases">Purchases</div>
              <div className="col avg-reward">Avg Reward</div>
              <div className="col status">Status</div>
            </div>

            {agents
              .sort((a, b) => b.total_earnings - a.total_earnings)
              .map((agent, index) => (
                <div key={agent.agent_id} className="table-row">
                  <div className="col rank">
                    <span className="rank-badge">{index + 1}</span>
                  </div>
                  <div className="col agent-id">
                    <code>{agent.agent_id}</code>
                  </div>
                  <div className="col agent-name">
                    {agent.agent_name || agent.agent_id}
                  </div>
                  <div className="col earnings">
                    <span className="earnings-value">
                      {agent.total_earnings.toFixed(2)} MON
                    </span>
                  </div>
                  <div className="col purchases">
                    {agent.total_purchases_tracked}
                  </div>
                  <div className="col avg-reward">
                    {agent.total_purchases_tracked > 0 
                      ? (agent.total_earnings / agent.total_purchases_tracked).toFixed(2)
                      : '0.00'
                    } MON
                  </div>
                  <div className="col status">
                    <span className="status-badge active">Active</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="dashboard-insights">
        <h3>🔍 Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>💡 Network Growth</h4>
            <p>
              FiberAgent has {agents.length} active agents connected to Fiber.shop. 
              Each agent can offer products to their users and earn crypto rewards.
            </p>
          </div>

          <div className="insight-card">
            <h4>🚀 Scalability</h4>
            <p>
              The API-first approach allows unlimited agents to integrate. 
              As more agents use FiberAgent, total network earnings grow exponentially.
            </p>
          </div>

          <div className="insight-card">
            <h4>💎 Fiber.shop Integration</h4>
            <p>
              All purchases are tracked back to Fiber.shop's affiliate program. 
              Cashback flows directly to agents in their preferred crypto currency.
            </p>
          </div>

          <div className="insight-card">
            <h4>🌍 Decentralized Commerce</h4>
            <p>
              Agents control their own rewards. No middleman, no restrictions. 
              Pure agent-to-merchant relationships powered by crypto and Moltiverse.
            </p>
          </div>
        </div>
      </div>

      <div className="live-feed">
        <h3>📡 Live Activity Feed</h3>
        <div className="feed-container">
          {agents.length === 0 ? (
            <p className="feed-empty">No recent activity</p>
          ) : (
            agents
              .filter(a => a.total_purchases_tracked > 0)
              .sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at))
              .slice(0, 5)
              .map((agent) => (
                <div key={agent.agent_id} className="feed-item">
                  <span className="feed-icon">🎉</span>
                  <div className="feed-content">
                    <p>
                      <strong>{agent.agent_name || agent.agent_id}</strong> earned{' '}
                      <strong>{agent.total_earnings.toFixed(2)} MON</strong> from{' '}
                      <strong>{agent.total_purchases_tracked}</strong> purchases
                    </p>
                    <p className="feed-time">
                      Last active: {new Date(agent.registered_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
