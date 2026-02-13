import React, { useState, useEffect } from 'react';
import '../styles/AgentApiDemo.css';

export default function AgentApiDemo() {
  // Generate EVM test wallet: 0xtest + 36 random hex (= 42 chars, valid EVM format)
  // Fiber auto-detects: EVM (0x..., 42 chars) → defaults to MON
  const generateTestWallet = () => {
    const hexChars = '0123456789abcdef';
    let address = '0xtest';
    // Generate 36 more random hex characters (0xtest = 6 chars, total 42 for EVM)
    for (let i = 0; i < 36; i++) {
      address += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
    }
    return address; // Returns: 0xtest[36 random hex] = 42 chars total
  };

  const [selectedTab, setSelectedTab] = useState('register');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [agentId, setAgentId] = useState(null);
  const [walletAddress, setWalletAddress] = useState(() => generateTestWallet());
  const [preferredToken, setPreferredToken] = useState(''); // Optional: MON, BONK, etc.
  const [currentToken, setCurrentToken] = useState(null);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [searchQuery, setSearchQuery] = useState('running shoes');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Use Vercel API proxy to bypass CORS restrictions
  // TODO: Once Fiber fixes CORS headers, switch back to direct API calls
  const FIBER_API = '/api/fiber-proxy';

  // 1. Register Agent with Fiber (via proxy)
  const handleRegisterAgent = async () => {
    setLoading(true);
    try {
      const body = {
        agent_name: 'FiberAgent Demo Agent',
        wallet_address: walletAddress,
        description: 'Demo shopping agent discovering products via FiberAgent'
      };
      
      // Add preferred token if specified
      if (preferredToken) {
        body.preferred_token = preferredToken;
      }

      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'POST',
          endpoint: 'agent/register',
          body
        })
      });
      const data = await res.json();
      
      // Handle 409 Conflict (already registered)
      if (res.status === 409) {
        setResponse({ 
          warning: 'Agent already registered',
          existing_agent_id: data.existing_agent_id,
          message: 'This wallet is already registered. Using existing agent ID.'
        });
        setAgentId(data.existing_agent_id);
        // Fetch token info
        await handleGetTokenInfo(data.existing_agent_id);
      } else if (data.success) {
        setResponse(data);
        setAgentId(data.agent_id);
        setCurrentToken(data.preferred_token);
        // Fetch available tokens
        await handleGetTokenInfo(data.agent_id);
      } else {
        setResponse(data);
      }
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  // 2. Search Products via Fiber (via proxy)
  const handleSearchProducts = async () => {
    if (!agentId) {
      setResponse({ error: 'Please register agent first' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/search',
          queryParams: {
            keywords: searchQuery,
            agent_id: agentId,
            // wallet parameter is now optional (uses registered wallet)
            limit: 5
          }
        })
      });
      const data = await res.json();
      setSearchResults(data.results || []);
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  // Get current and available tokens
  const handleGetTokenInfo = async (agentIdToUse) => {
    if (!agentIdToUse) {
      setResponse({ error: 'Please register agent first' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: `agent/${agentIdToUse}/token`
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentToken(data.current_token);
        setAvailableTokens(data.available_tokens || []);
      }
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  // Change payout token
  const handleChangeToken = async (newToken) => {
    if (!agentId) {
      setResponse({ error: 'Please register agent first' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'PUT',
          endpoint: `agent/${agentId}/token`,
          body: {
            token_symbol: newToken
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentToken(data.current_token);
        setResponse({ success: true, message: `Token changed to ${newToken}` });
      } else {
        setResponse(data);
      }
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  // 3. Select Product from Search Results
  const handleSelectProduct = (product) => {
    // Use affiliate_link directly from Fiber API
    setSelectedProduct(product);
    setResponse({ 
      info: 'Product selected. Share the affiliate link with your users.',
      affiliate_link: product.affiliate_link,
      cashback: product.cashback
    });
  };

  // 4. Note: Fiber API handles purchase tracking automatically via Wildfire
  // No manual track-purchase endpoint needed - purchases tracked via affiliate links

  // 5. Get Agent Earnings from Fiber (via proxy)
  const handleGetEarnings = async () => {
    if (!agentId) {
      setResponse({ error: 'Please register agent first' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: `agent/earnings/${agentId}`
        })
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="agent-api-demo">
      <h2>🤖 Live Agent-to-Agent API Demo</h2>
      <p className="intro">See how other agents call FiberAgent to offer products and earn crypto rewards</p>

      <div className="demo-layout">
        <div className="demo-controls">
          <div className="agent-info">
            <h3>Your Agent ID</h3>
            <input 
              type="text" 
              value={agentId} 
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="Agent ID"
              className="agent-id-input"
            />
            <p className="hint">Unique identifier for your agent</p>
          </div>

          <div className="agent-wallet">
            <h3>Your Wallet</h3>
            <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
              <input 
                type="text" 
                value={walletAddress} 
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Monad wallet address"
                className="wallet-input"
              />
              <button
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
                title="Generate a new wallet address"
              >
                🔄 Generate
              </button>
            </div>
            <p className="hint">EVM wallet address. Click "New Test" to generate a unique address.</p>
          </div>

          <div className="tabs">
            <button 
              className={`tab ${selectedTab === 'register' ? 'active' : ''}`}
              onClick={() => setSelectedTab('register')}
            >
              1️⃣ Register
            </button>
            <button 
              className={`tab ${selectedTab === 'search' ? 'active' : ''}`}
              onClick={() => setSelectedTab('search')}
            >
              2️⃣ Search
            </button>
            <button 
              className={`tab ${selectedTab === 'details' ? 'active' : ''}`}
              onClick={() => setSelectedTab('details')}
            >
              3️⃣ Share Link
            </button>
            <button 
              className={`tab ${selectedTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setSelectedTab('earnings')}
            >
              4️⃣ Earnings
            </button>
            <button 
              className={`tab ${selectedTab === 'tokens' ? 'active' : ''}`}
              onClick={() => setSelectedTab('tokens')}
            >
              💰 Token
            </button>
          </div>

          {selectedTab === 'register' && (
            <div className="control-section">
              <h3>Step 1: Register Your Agent</h3>
              <p>Register your agent to start earning crypto rewards.</p>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>
                  <strong>Preferred Payout Token (optional):</strong>
                </label>
                <select
                  value={preferredToken}
                  onChange={(e) => setPreferredToken(e.target.value)}
                  className="search-input"
                  style={{padding: '10px'}}
                >
                  <option value="">Auto-detect (MON for EVM, BONK for Solana)</option>
                  <option value="MON">MON (Monad)</option>
                  <option value="BONK">BONK (Solana)</option>
                </select>
                <p className="hint">Choose which token to receive earnings in. Defaults based on wallet type if not specified.</p>
              </div>

              <button 
                className="action-btn"
                onClick={handleRegisterAgent}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Agent'}
              </button>

              {currentToken && (
                <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '6px'}}>
                  <p><strong>✅ Current Payout Token:</strong> {currentToken}</p>
                  {availableTokens.length > 0 && (
                    <div style={{marginTop: '10px'}}>
                      <p><strong>Change to:</strong></p>
                      {availableTokens.map(token => (
                        <button
                          key={token}
                          onClick={() => handleChangeToken(token)}
                          style={{
                            marginRight: '10px',
                            padding: '8px 12px',
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '5px'
                          }}
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'search' && (
            <div className="control-section">
              <h3>Step 2: Search Products</h3>
              {!agentId && <p className="warning">⚠️ Register your agent first</p>}
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products... (e.g., running shoes)"
                className="search-input"
                disabled={!agentId}
              />
              <button 
                className="action-btn"
                onClick={handleSearchProducts}
                disabled={loading || !agentId}
              >
                {loading ? 'Searching...' : '🔍 Search Products'}
              </button>
              {searchResults.length > 0 && (
                <div className="search-results">
                  <p className="result-count">Found {searchResults.length} merchant(s)</p>
                  {searchResults.map(product => (
                    <div 
                      key={product.merchant_id} 
                      className="search-result-item"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="result-title">🏪 {product.merchant_name}</div>
                      <div className="result-cashback">💰 Cashback: {product.cashback.display}</div>
                      <p className="hint">Click to select and get affiliate link</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'details' && (
            <div className="control-section">
              <h3>Step 3: Share Affiliate Link</h3>
              <p>Select a product from search results to get the affiliate link to share with your users.</p>
              {selectedProduct && (
                <div className="product-details">
                  <h4>{selectedProduct.title}</h4>
                  <p><strong>Merchant:</strong> {selectedProduct.merchant_name}</p>
                  <p><strong>Cashback Rate:</strong> {selectedProduct.cashback.display}</p>
                  <div className="affiliate-link">
                    <p><strong>Affiliate Link:</strong></p>
                    {(() => {
                      // Add agent tracking to affiliate link
                      let trackedLink = selectedProduct.affiliate_link;
                      const separator = trackedLink.includes('?') ? '&' : '?';
                      trackedLink += `${separator}agent=${agentId}`;
                      
                      return (
                        <>
                          <a 
                            href={trackedLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="affiliate-button"
                            style={{
                              display: 'inline-block',
                              padding: '10px 16px',
                              backgroundColor: '#00d084',
                              color: '#fff',
                              textDecoration: 'none',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              marginRight: '10px'
                            }}
                          >
                            🛍️ Open Store
                          </a>
                          <button 
                            className="copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(trackedLink);
                              alert('Tracked affiliate link copied!');
                            }}
                          >
                            📋 Copy Link
                          </button>
                          <p style={{fontSize: '0.75rem', marginTop: '10px', color: '#999', wordBreak: 'break-all'}}>
                            {trackedLink}
                          </p>
                          <details style={{marginTop: '15px', fontSize: '0.85rem'}}>
                            <summary style={{cursor: 'pointer', color: '#666'}}>Direct merchant link (no tracking)</summary>
                            <p style={{marginTop: '10px'}}>
                              <a 
                                href={`https://${selectedProduct.merchant_domain}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{color: '#0066cc', wordBreak: 'break-all'}}
                              >
                                https://{selectedProduct.merchant_domain}
                              </a>
                            </p>
                          </details>
                        </>
                      );
                    })()}
                  </div>
                  <p className="highlight">⏰ Timeline: 1-5 days for Fiber Points → 90 days for crypto</p>
                </div>
              )}
              {!selectedProduct && (
                <p className="placeholder">Select a product from search results above</p>
              )}
            </div>
          )}

          {selectedTab === 'earnings' && (
            <div className="control-section">
              <h3>Step 4: Check Earnings</h3>
              <p>See your earnings in real-time.</p>
              {!agentId && <p className="warning">⚠️ Register your agent first</p>}
              <button 
                className="action-btn"
                onClick={handleGetEarnings}
                disabled={loading || !agentId}
              >
                {loading ? '⏳ Loading...' : '💰 Check Earnings'}
              </button>
              
              <div className="timeline-info">
                <h4>⏱️ Payment Timeline</h4>
                <div className="timeline">
                  <div className="timeline-step">
                    <span className="day">Days 1-5</span>
                    <p>Fiber Points credited</p>
                  </div>
                  <span className="arrow">→</span>
                  <div className="timeline-step">
                    <span className="day">Days 1-90</span>
                    <p>Merchant confirms via Wildfire</p>
                  </div>
                  <span className="arrow">→</span>
                  <div className="timeline-step">
                    <span className="day">Day 90 (max)</span>
                    <p>Crypto sent to wallet</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'tokens' && (
            <div className="control-section">
              <h3>💰 Manage Payout Token</h3>
              <p>View and change which token you want to receive earnings in.</p>
              {!agentId && <p className="warning">⚠️ Register your agent first</p>}
              <button 
                className="action-btn"
                onClick={() => handleGetTokenInfo(agentId)}
                disabled={loading || !agentId}
              >
                {loading ? '⏳ Loading...' : '🔄 Refresh Token Info'}
              </button>
              
              {currentToken && (
                <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px'}}>
                  <h4>Current Payout Token</h4>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#00d084', marginBottom: '15px'}}>
                    {currentToken}
                  </p>
                  
                  {availableTokens.length > 0 && (
                    <div>
                      <p><strong>Switch to:</strong></p>
                      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        {availableTokens.map(token => (
                          token !== currentToken && (
                            <button
                              key={token}
                              onClick={() => handleChangeToken(token)}
                              style={{
                                padding: '10px 16px',
                                backgroundColor: '#fff',
                                border: '2px solid #ddd',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.borderColor = '#00d084';
                                e.target.style.color = '#00d084';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.borderColor = '#ddd';
                                e.target.style.color = '#000';
                              }}
                            >
                              {token}
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="demo-response">
          <h3>API Response</h3>
          <div className="response-box">
            {response ? (
              <pre><code>{JSON.stringify(response, null, 2)}</code></pre>
            ) : (
              <p className="placeholder">API responses will appear here</p>
            )}
          </div>
        </div>
      </div>

      <div className="flow-explanation">
        <h3>Agent-to-Agent Shopping Flow</h3>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-icon">1</div>
            <h4>Register</h4>
            <p>Agent registers with wallet</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">2</div>
            <h4>Search</h4>
            <p>Query FiberAgent for products</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">3</div>
            <h4>Share</h4>
            <p>Share affiliate link with users</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">4</div>
            <h4>Track</h4>
            <p>User buys via affiliate link</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">5</div>
            <h4>Earn</h4>
            <p>Crypto paid in 1-90 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
