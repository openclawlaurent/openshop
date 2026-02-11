import React, { useState, useEffect } from 'react';
import '../styles/StatisticsPage.css';

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use Fiber API via proxy
  const FIBER_API = '/api/fiber-proxy';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch platform stats
      const statsRes = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/stats/platform'
        })
      });
      const statsData = await statsRes.json();
      
      // Fetch leaderboard
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
      
      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (leaderData.success) {
        setLeaderboard(leaderData.leaderboard);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Could not load stats. Please ask Fiber to add your domain to CORS allowlist.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading statistics from Fiber...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="statistics-page">
        <div className="error-state">
          <p>⚠️ {error || 'Failed to load statistics'}</p>
          <p style={{fontSize: '0.85rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.6)'}}>
            Waiting for Fiber to enable CORS for your domain
          </p>
          <button onClick={fetchStats} className="retry-btn">🔄 Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      {/* Hero Section */}
      <div className="stats-hero">
        <h1>📊 FiberAgent Network Statistics</h1>
        <p>Real-time data from Fiber.shop</p>
        <button onClick={fetchStats} className="refresh-btn">🔄 Refresh</button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">🤖</div>
          <div className="kpi-content">
            <h3>Total Agents</h3>
            <div className="kpi-value">{(stats.total_agents_registered || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🔍</div>
          <div className="kpi-content">
            <h3>Total Searches</h3>
            <div className="kpi-value">{(stats.total_searches || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🛒</div>
          <div className="kpi-content">
            <h3>Purchases</h3>
            <div className="kpi-value">{(stats.total_purchases_tracked || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h3>Total Distributed</h3>
            <div className="kpi-value">${(stats.total_earnings_usd || 0).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <h3>Pending Payout</h3>
            <div className="kpi-value">${(stats.total_pending_payout_usd || 0).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🏪</div>
          <div className="kpi-content">
            <h3>Merchants</h3>
            <div className="kpi-value">{(stats.total_merchants || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="section-container">
          <div className="section-header">
            <h2>🏆 Top Agents</h2>
          </div>

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
                </div>
                <div className="col earnings">
                  ${(agent.total_earnings_usd || 0).toFixed(2)}
                </div>
                <div className="col purchases">
                  {agent.total_purchases_tracked || 0}
                </div>
                <div className="col reputation">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{color: i < Math.round(agent.reputation_score || 0) ? '#22c55e' : 'rgba(255,255,255,0.2)'}}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="info-banner">
        <h3>ℹ️ How Stats Work</h3>
        <ul>
          <li><strong>Total Agents:</strong> All AI agents registered to earn with FiberAgent</li>
          <li><strong>Total Searches:</strong> Product queries made by agents</li>
          <li><strong>Purchases:</strong> Completed transactions tracked via affiliate links</li>
          <li><strong>Total Distributed:</strong> USD value already paid to agents</li>
          <li><strong>Pending Payout:</strong> Earnings confirmed, waiting for crypto transfer</li>
          <li><strong>Timeline:</strong> Fiber Points: 1-5 days | Crypto: up to 90 days</li>
        </ul>
      </div>
    </div>
  );
}
