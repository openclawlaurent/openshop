import React, { useState } from 'react';
import '../styles/DemoPage.css';

export default function DemoPage() {
  // Use Vercel API proxy to bypass CORS restrictions
  // TODO: Once Fiber fixes CORS headers, switch back to direct API calls
  const FIBER_API = '/api/fiber-proxy';

  // Generate random EVM test wallet (0x + 40 hex chars = valid format)
  // Fiber auto-detects: EVM (0x..., 42 chars) → defaults to MON
  const generateTestWallet = () => {
    const hexChars = '0123456789abcdef';
    let address = '0x';
    // Generate 40 random hex characters (EVM format)
    for (let i = 0; i < 40; i++) {
      address += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
    }
    return address; // Returns: 0x[40 hex chars] = 42 chars total
  };

  // Agent Registration State
  const [agentId, setAgentId] = useState(null);
  const [agentName, setAgentName] = useState('My Shopping Agent');
  const [walletAddress, setWalletAddress] = useState(() => generateTestWallet());
  const [registrationResponse, setRegistrationResponse] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  // Product Search State
  const [searchKeywords, setSearchKeywords] = useState('shoes');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Agent Info State
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentInfo, setAgentInfo] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Register Agent with Fiber (via proxy)
  const handleRegisterAgent = async (e) => {
    e.preventDefault();
    setRegistrationLoading(true);
    setRegistrationError(null);

    try {
      const response = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'POST',
          endpoint: 'agent/register',
          body: {
            agent_name: agentName,
            wallet_address: walletAddress,
            description: 'Shopping agent discovering products via FiberAgent'
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setRegistrationError(data.error || 'Registration failed');
      } else {
        setRegistrationResponse(data);
        setAgentId(data.agent_id);
        setSelectedAgent(data.agent_id);
        setSearchResults(null);
      }
    } catch (err) {
      setRegistrationError('Error: ' + err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Search Products via Fiber (via proxy)
  const handleSearchProducts = async (e) => {
    e.preventDefault();
    
    if (!selectedAgent) {
      setSearchError('Please register an agent first');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/search',
          queryParams: {
            keywords: searchKeywords,
            agent_id: selectedAgent,
            wallet: walletAddress,
            limit: 10
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setSearchError(data.error || 'Search failed');
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      setSearchError('Error: ' + err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get Agent Info from Fiber (via proxy)
  const handleGetAgentInfo = async () => {
    if (!selectedAgent) {
      setSearchError('Please select an agent');
      return;
    }

    setAgentLoading(true);

    try {
      const response = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: `agent/earnings/${selectedAgent}`
        })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAgentInfo(data);
      }
    } catch (err) {
      console.error('Error fetching agent info:', err);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="demo-page">
      <div className="demo-container">
        {/* Header */}
        <div className="demo-header">
          <h1>🚀 FiberAgent Agent Demo</h1>
          <p>Register an agent, search for products, see results in real-time</p>
        </div>

        <div className="demo-content">
          {/* Left Column: Agent Registration */}
          <div className="demo-section registration-section">
            <h2>Step 1: Register Your Agent</h2>
            <form onSubmit={handleRegisterAgent}>
              <div className="form-group">
                <label>Agent ID</label>
                <input
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="agent_claude"
                />
                <small>Unique identifier for your agent</small>
              </div>

              <div className="form-group">
                <label>Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="My Shopping Agent"
                />
              </div>

              <div className="form-group">
                <label>Wallet Address (Monad)</label>
                <div style={{display: 'flex', gap: '10px', marginBottom: '5px'}}>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    style={{flex: 1}}
                  />
                  <button
                    type="button"
                    onClick={() => setWalletAddress(generateTestWallet())}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                    title="Generate a new random test wallet"
                  >
                    🔄 New Test
                  </button>
                </div>
                <small>🧪 Test wallet (randomly generated). Use your real wallet for production.</small>
              </div>

              <button type="submit" disabled={registrationLoading} className="btn btn-primary">
                {registrationLoading ? '⏳ Registering...' : '✅ Register Agent'}
              </button>

              {registrationError && (
                <div className="error-message">{registrationError}</div>
              )}

              {registrationResponse && (
                <div className="success-message">
                  <strong>✅ Agent Registered!</strong>
                  <div className="agent-summary">
                    <p><strong>Agent ID:</strong> {registrationResponse.agent_id}</p>
                    <p><strong>Name:</strong> {registrationResponse.agent_name}</p>
                    <p><strong>Wallet:</strong> {registrationResponse.wallet_address}</p>
                    <p><strong>Status:</strong> {registrationResponse.status}</p>
                    <p><strong>Registered:</strong> {new Date(registrationResponse.registered_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Search & Results */}
          <div className="demo-section search-section">
            <h2>Step 2: Search for Products</h2>
            
            {!registrationResponse && (
              <div className="placeholder-message">
                👆 Register an agent first to search
              </div>
            )}

            {registrationResponse && (
              <>
                <form onSubmit={handleSearchProducts}>
                  <div className="form-group">
                    <label>Search for products</label>
                    <input
                      type="text"
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                      placeholder="e.g., shoes, nike, boots"
                    />
                  </div>

                  <button type="submit" disabled={searchLoading} className="btn btn-primary">
                    {searchLoading ? '⏳ Searching...' : '🔍 Search Products'}
                  </button>

                  <button
                    type="button"
                    onClick={handleGetAgentInfo}
                    disabled={agentLoading}
                    className="btn btn-secondary"
                  >
                    {agentLoading ? '⏳ Loading...' : '📊 Get Agent Stats'}
                  </button>

                  {searchError && (
                    <div className="error-message">{searchError}</div>
                  )}
                </form>

                {/* Search Results */}
                {searchResults && (
                  <div className="search-results">
                    <h3>
                      🏪 Found {searchResults.results_count} merchants for "{searchResults.query}"
                    </h3>

                    {searchResults.results.length === 0 ? (
                      <p className="no-results">No merchants found. Try a different search.</p>
                    ) : (
                      <div className="products-grid">
                        {searchResults.results.map((merchant) => (
                          <div key={merchant.merchant_id} className="product-card">
                            <div className="product-image">
                              {merchant.image_url && <img src={merchant.image_url} alt={merchant.merchant_name} />}
                            </div>
                            <div className="product-info">
                              <h4>{merchant.merchant_name}</h4>
                              <p className="merchant">🌐 {merchant.merchant_domain}</p>
                              <p className="description">{merchant.description}</p>
                              <div className="product-details">
                                <div className="cashback">
                                  <span className="label">💰 Cashback Rate:</span>
                                  <span className="amount">{merchant.cashback.display}</span>
                                </div>
                              </div>
                              <a
                                href={merchant.affiliate_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-small"
                              >
                                Shop & Earn 🔗
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Agent Stats */}
                {agentInfo && (
                  <div className="agent-stats">
                    <h3>📊 Agent Statistics</h3>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <span className="stat-label">Total Earnings</span>
                        <span className="stat-value">${agentInfo.total_earnings_usd.toFixed(2)} USD</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-label">Pending Payout</span>
                        <span className="stat-value">${agentInfo.pending_payout_usd.toFixed(2)}</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-label">Purchases Tracked</span>
                        <span className="stat-value">{agentInfo.total_purchases_tracked}</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-label">Reputation Score</span>
                        <span className="stat-value">{agentInfo.reputation_score}</span>
                      </div>
                    </div>
                    <div className="timeline-note">
                      <strong>⏱️ Timeline:</strong> Fiber Points appear in 1-5 days. Crypto payout takes up to 90 days.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer: What's Next */}
        <div className="demo-footer">
          <h3>🎯 How It Works</h3>
          <div className="flow-diagram">
            <div className="flow-step">
              <span className="step-number">1</span>
              <span className="step-text">Agent registers with wallet address</span>
            </div>
            <div className="arrow">→</div>
            <div className="flow-step">
              <span className="step-number">2</span>
              <span className="step-text">Agent searches for products</span>
            </div>
            <div className="arrow">→</div>
            <div className="flow-step">
              <span className="step-number">3</span>
              <span className="step-text">FiberAgent returns personalized results</span>
            </div>
            <div className="arrow">→</div>
            <div className="flow-step">
              <span className="step-number">4</span>
              <span className="step-text">User buys, agent earns MON cashback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
