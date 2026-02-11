import React, { useState, useEffect } from 'react';
import '../styles/StatsDashboard.css';

export default function StatsDashboard() {
  // Use Vercel API proxy to bypass CORS restrictions
  // TODO: Once Fiber fixes CORS headers, switch back to direct API calls
  const FIBER_API = '/api/fiber-proxy';
  
  // Global Stats
  const [globalStats, setGlobalStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FiberAgent global stats on mount
  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // FiberAgent platform stats (via proxy)
      const statsRes = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/stats/platform'
        })
      });
      const statsData = await statsRes.json();
      
      // FiberAgent leaderboard (via proxy)
      const leaderRes = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/stats/leaderboard',
          queryParams: { limit: 10 }
        })
      });
      const leaderData = await leaderRes.json();

      // FiberAgent trends (via proxy)
      const trendsRes = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/stats/trends',
          queryParams: { days: 30 }
        })
      });
      const trendsData = await trendsRes.json();

      if (statsData.success) {
        setGlobalStats(statsData.stats);
      }
      
      if (leaderData.success) {
        setLeaderboard(leaderData.leaderboard);
      }

      if (trendsData.success) {
        setTrends(trendsData.data);
      }
    } catch (err) {
      setError('Failed to load stats: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="stats-dashboard">
      <div className="dashboard-header">
        <h1>📊 FiberAgent Platform Analytics</h1>
        <p>Real-time stats from Fiber Shopping Platform</p>
        <button className="refresh-btn" onClick={fetchGlobalStats} disabled={loading}>
          {loading ? '⏳ Updating...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <p className="hint">Stats endpoints coming soon from Fiber</p>
        </div>
      )}

      {/* Global Stats Cards */}
      {globalStats && (
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">🤖</div>
            <div className="stat-content">
              <h3>Total Agents</h3>
              <p className="stat-value">{globalStats.total_agents_registered.toLocaleString()}</p>
              <span className="stat-label">Agents earning cashback</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <h3>Total Searches</h3>
              <p className="stat-value">{globalStats.total_searches.toLocaleString()}</p>
              <span className="stat-label">Product searches made</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>Purchases Tracked</h3>
              <p className="stat-value">{globalStats.total_purchases_tracked.toLocaleString()}</p>
              <span className="stat-label">Through affiliate links</span>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Distributed</h3>
              <p className="stat-value">{formatCurrency(globalStats.total_earnings_usd)}</p>
              <span className="stat-label">Earnings distributed to agents</span>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Payout</h3>
              <p className="stat-value">{formatCurrency(globalStats.total_pending_payout_usd)}</p>
              <span className="stat-label">Ready for crypto transfer</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-content">
              <h3>Merchants</h3>
              <p className="stat-value">{globalStats.total_merchants.toLocaleString()}</p>
              <span className="stat-label">Partners in network</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard && (
        <div className="leaderboard-section">
          <h2>🏆 Top Agents</h2>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <div className="col rank">Rank</div>
              <div className="col name">Agent Name</div>
              <div className="col earnings">Earnings</div>
              <div className="col purchases">Purchases</div>
              <div className="col reputation">Reputation</div>
            </div>

            {leaderboard.map((agent) => (
              <div key={agent.agent_id} className="leaderboard-row">
                <div className="col rank">
                  {agent.rank === 1 && '🥇'}
                  {agent.rank === 2 && '🥈'}
                  {agent.rank === 3 && '🥉'}
                  {agent.rank > 3 && `#${agent.rank}`}
                </div>
                <div className="col name">
                  <span className="agent-name">{agent.agent_name}</span>
                  <span className="agent-id">{agent.agent_id}</span>
                </div>
                <div className="col earnings">
                  <strong>{formatCurrency(agent.total_earnings_usd)}</strong>
                </div>
                <div className="col purchases">
                  {agent.total_purchases_tracked}
                </div>
                <div className="col reputation">
                  <div className="reputation-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < agent.reputation_score ? 'star filled' : 'star'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !globalStats && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading platform stats...</p>
          <small>These endpoints are coming soon from Fiber</small>
        </div>
      )}

      {/* Info Banner */}
      <div className="info-banner">
        <h3>📈 How to Read These Stats</h3>
        <div className="info-content">
          <div className="info-item">
            <strong>Total Agents:</strong> Number of AI agents registered and earning with FiberAgent
          </div>
          <div className="info-item">
            <strong>Total Searches:</strong> Product searches made by all agents combined
          </div>
          <div className="info-item">
            <strong>Purchases Tracked:</strong> User purchases completed through agent affiliate links
          </div>
          <div className="info-item">
            <strong>Total Distributed:</strong> Total crypto already paid to agents (in 1-90 days)
          </div>
          <div className="info-item">
            <strong>Pending Payout:</strong> Commissions confirmed by merchants, waiting for payout
          </div>
          <div className="info-item">
            <strong>Reputation:</strong> ERC-8004 reputation score (higher = better rates with merchants)
          </div>
        </div>
      </div>
    </div>
  );
}
