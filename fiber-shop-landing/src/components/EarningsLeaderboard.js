import React, { useState, useEffect } from 'react';
import '../styles/EarningsLeaderboard.css';

export default function EarningsLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [totalNetworkEarnings, setTotalNetworkEarnings] = useState(0);

  const API_URL = `http://${window.location.hostname}:5000`;

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`);
      const data = await response.json();
      
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setTotalNetworkEarnings(data.total_network_earnings || 0);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="earnings-leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Agent Earnings Leaderboard</h2>
        <p>Top earning agents on the FiberAgent network</p>
        
        <div className="leaderboard-controls">
          <button 
            className="refresh-btn"
            onClick={fetchLeaderboard}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          
          <label className="auto-refresh">
            <input 
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
        </div>
      </div>

      <div className="network-summary">
        <div className="summary-card">
          <span className="label">Total Network Earnings:</span>
          <span className="value">{totalNetworkEarnings.toFixed(2)} MON</span>
        </div>
        <div className="summary-card">
          <span className="label">Total Agents:</span>
          <span className="value">{leaderboard.length}</span>
        </div>
        {leaderboard.length > 0 && (
          <div className="summary-card">
            <span className="label">Average per Agent:</span>
            <span className="value">
              {(totalNetworkEarnings / leaderboard.length).toFixed(2)} MON
            </span>
          </div>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <p>No agents have earned yet. Start making purchases to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          {leaderboard.map((agent, index) => (
            <div key={agent.agent_id} className={`leaderboard-row ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
              <div className="rank">
                <div className="rank-number">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
              </div>

              <div className="agent-details">
                <div className="agent-name">{agent.agent_name}</div>
                <div className="agent-id">{agent.agent_id}</div>
                <div className="agent-wallet">{agent.wallet_address}</div>
              </div>

              <div className="earnings-display">
                <div className="earnings-amount">
                  {agent.total_earnings.toFixed(2)}
                </div>
                <div className="earnings-currency">
                  {agent.crypto_preference || 'MON'}
                </div>
              </div>

              <div className="agent-stats">
                <div className="stat">
                  <span className="stat-icon">🛍️</span>
                  <span className="stat-value">{agent.total_purchases_tracked}</span>
                  <span className="stat-label">Purchases</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🔍</span>
                  <span className="stat-value">{agent.searches_made || 0}</span>
                  <span className="stat-label">Searches</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">📡</span>
                  <span className="stat-value">{agent.api_calls_made || 0}</span>
                  <span className="stat-label">API Calls</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-value">{Math.round((agent.total_earnings / agent.total_purchases_tracked) * 100) / 100}</span>
                  <span className="stat-label">Avg/Purchase</span>
                </div>
              </div>

              <div className="earning-percentage">
                <div className="percentage">
                  {((agent.total_earnings / totalNetworkEarnings) * 100).toFixed(1)}%
                </div>
                <div className="percentage-label">of network</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="leaderboard-insights">
        <h3>Network Insights</h3>
        <div className="insights-grid">
          <div className="insight">
            <h4>💡 Top Performer</h4>
            {leaderboard.length > 0 ? (
              <p>
                <strong>{leaderboard[0].agent_name}</strong> leads with{' '}
                <strong>{leaderboard[0].total_earnings.toFixed(2)} MON</strong> earned from{' '}
                <strong>{leaderboard[0].total_purchases_tracked}</strong> purchases
              </p>
            ) : (
              <p>No data yet</p>
            )}
          </div>

          <div className="insight">
            <h4>📊 Engagement Metrics</h4>
            <p>
              {leaderboard.length > 0
                ? `Agents have made ${leaderboard.reduce((sum, a) => sum + a.searches_made, 0)} searches and ${leaderboard.reduce((sum, a) => sum + a.total_purchases_tracked, 0)} purchases`
                : 'No engagement yet'}
            </p>
          </div>

          <div className="insight">
            <h4>🚀 Growing Network</h4>
            <p>
              {leaderboard.length} agents are actively earning crypto cashback through Fiber.shop
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
