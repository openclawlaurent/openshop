import React, { useState, useEffect } from 'react';
import '../styles/ComprehensiveStats.css';

export default function ComprehensiveStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  const API_URL = `http://${window.location.hostname}:5000`;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (!stats) {
    return <div className="stats-loading">Loading statistics...</div>;
  }

  const { overview, api_activity, top_agents, top_searches, recent_searches } = stats;

  return (
    <div className="comprehensive-stats">
      <div className="stats-header">
        <h2>📊 Comprehensive FiberAgent Network Statistics</h2>
        <p>Real-time metrics of all agent activity and network performance</p>
        
        <div className="stats-controls">
          <button 
            className="refresh-btn"
            onClick={fetchStats}
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

      <div className="tabs-navigation">
        <button 
          className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          📈 Overview
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'activity' ? 'active' : ''}`}
          onClick={() => setSelectedTab('activity')}
        >
          🔌 API Activity
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'agents' ? 'active' : ''}`}
          onClick={() => setSelectedTab('agents')}
        >
          🤖 Top Agents
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'searches' ? 'active' : ''}`}
          onClick={() => setSelectedTab('searches')}
        >
          🔍 Search Queries
        </button>
      </div>

      {selectedTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-grid">
            <div className="stat-card total">
              <div className="icon">📡</div>
              <h4>Total API Calls</h4>
              <div className="value">{overview.total_api_calls}</div>
              <p className="label">All endpoints combined</p>
            </div>

            <div className="stat-card agents">
              <div className="icon">🤖</div>
              <h4>Active Agents</h4>
              <div className="value">{overview.active_agents}</div>
              <p className="label">{overview.total_agents_registered} registered</p>
            </div>

            <div className="stat-card searches">
              <div className="icon">🔍</div>
              <h4>Total Searches</h4>
              <div className="value">{overview.total_searches}</div>
              <p className="label">Product queries made</p>
            </div>

            <div className="stat-card purchases">
              <div className="icon">🛍️</div>
              <h4>Purchases Tracked</h4>
              <div className="value">{overview.total_purchases_tracked}</div>
              <p className="label">Completed transactions</p>
            </div>

            <div className="stat-card earnings">
              <div className="icon">💰</div>
              <h4>Network Earnings</h4>
              <div className="value">{overview.total_network_earnings}</div>
              <p className="label">Total {overview.network_currency} distributed</p>
            </div>

            <div className="stat-card details">
              <div className="icon">📊</div>
              <h4>Product Requests</h4>
              <div className="value">{overview.total_product_details_requests}</div>
              <p className="label">Detail view requests</p>
            </div>
          </div>

          <div className="network-health">
            <h3>Network Health</h3>
            <div className="health-metrics">
              <div className="metric">
                <span className="label">Average Earnings per Agent:</span>
                <span className="value">
                  {overview.active_agents > 0 
                    ? (overview.total_network_earnings / overview.active_agents).toFixed(2)
                    : '0.00'
                  } MON
                </span>
              </div>
              <div className="metric">
                <span className="label">Average Searches per Agent:</span>
                <span className="value">
                  {overview.active_agents > 0 
                    ? (overview.total_searches / overview.active_agents).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
              <div className="metric">
                <span className="label">Conversion Rate:</span>
                <span className="value">
                  {overview.total_searches > 0
                    ? ((overview.total_purchases_tracked / overview.total_searches) * 100).toFixed(1)
                    : '0.0'
                  }%
                </span>
              </div>
              <div className="metric">
                <span className="label">Average Transaction Value:</span>
                <span className="value">
                  {overview.total_purchases_tracked > 0
                    ? (overview.total_network_earnings / overview.total_purchases_tracked).toFixed(2)
                    : '0.00'
                  } MON
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'activity' && (
        <div className="tab-content">
          <h3>API Endpoint Activity</h3>
          <div className="activity-grid">
            <div className="activity-card">
              <div className="endpoint">POST /api/agent/register</div>
              <div className="count">{api_activity.register}</div>
              <p>Agent registrations</p>
            </div>
            <div className="activity-card">
              <div className="endpoint">POST /api/agent/search</div>
              <div className="count">{api_activity.search}</div>
              <p>Product searches</p>
            </div>
            <div className="activity-card">
              <div className="endpoint">POST /api/agent/product-details</div>
              <div className="count">{api_activity.product_details}</div>
              <p>Detail requests</p>
            </div>
            <div className="activity-card">
              <div className="endpoint">POST /api/agent/track-purchase</div>
              <div className="count">{api_activity.track_purchase}</div>
              <p>Purchases tracked</p>
            </div>
            <div className="activity-card">
              <div className="endpoint">GET /api/agent/earnings</div>
              <div className="count">{api_activity.get_earnings}</div>
              <p>Earnings queries</p>
            </div>
          </div>

          <div className="activity-insights">
            <h3>API Usage Insights</h3>
            <ul>
              <li>📍 Most used endpoint: <strong>Search</strong> ({api_activity.search} calls)</li>
              <li>💡 Agents actively registering and making purchases</li>
              <li>🔗 High engagement with product details API</li>
              <li>✅ Consistent conversion from search to purchase tracking</li>
            </ul>
          </div>
        </div>
      )}

      {selectedTab === 'agents' && (
        <div className="tab-content">
          <h3>Top 10 Performing Agents</h3>
          <div className="agents-leaderboard">
            {top_agents.map((agent, idx) => (
              <div key={agent.agent_id} className="agent-row">
                <div className="rank">#{idx + 1}</div>
                <div className="agent-info">
                  <div className="agent-name">{agent.agent_name}</div>
                  <div className="agent-id">{agent.agent_id}</div>
                </div>
                <div className="metrics">
                  <div className="metric">
                    <span className="label">Earnings:</span>
                    <span className="value">{agent.total_earnings.toFixed(2)} MON</span>
                  </div>
                  <div className="metric">
                    <span className="label">Purchases:</span>
                    <span className="value">{agent.total_purchases_tracked}</span>
                  </div>
                  <div className="metric">
                    <span className="label">API Calls:</span>
                    <span className="value">{agent.api_calls_made}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Searches:</span>
                    <span className="value">{agent.searches_made}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'searches' && (
        <div className="tab-content">
          <div className="searches-section">
            <h3>Top Search Queries</h3>
            <div className="top-searches">
              {top_searches.map((search, idx) => (
                <div key={idx} className="search-item">
                  <div className="rank">{idx + 1}</div>
                  <div className="query">{search.query}</div>
                  <div className="count">{search.count} searches</div>
                </div>
              ))}
            </div>
          </div>

          <div className="searches-section">
            <h3>Recent Search Activity</h3>
            <div className="recent-searches">
              {recent_searches.map((search, idx) => (
                <div key={idx} className="recent-item">
                  <div className="time">
                    {new Date(search.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="query">"{search.query}"</div>
                  <div className="agent-id">{search.agent_id}</div>
                  <div className="results">{search.results_count} results</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
