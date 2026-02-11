import React, { useState, useEffect } from 'react';
import '../styles/AgentApiDemo.css';

export default function AgentApiDemo() {
  const [selectedTab, setSelectedTab] = useState('register');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [agentId, setAgentId] = useState(null);
  const [walletAddress, setWalletAddress] = useState('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
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
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'POST',
          endpoint: 'agent/register',
          body: {
            agent_name: 'FiberAgent Demo Agent',
            wallet_address: walletAddress,
            description: 'Demo shopping agent discovering products via FiberAgent'
          }
        })
      });
      const data = await res.json();
      setResponse(data);
      if (data.success) {
        setAgentId(data.agent_id);
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
            wallet: walletAddress,
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
            <input 
              type="text" 
              value={walletAddress} 
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Monad wallet address"
              className="wallet-input"
            />
            <p className="hint">Where your cashback will be paid (in 1-90 days)</p>
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
          </div>

          {selectedTab === 'register' && (
            <div className="control-section">
              <h3>Step 1: Register Your Agent</h3>
              <p>Register your agent to start earning MON coin rewards.</p>
              <button 
                className="action-btn"
                onClick={handleRegisterAgent}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Agent'}
              </button>
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
                    <code>{selectedProduct.affiliate_link}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedProduct.affiliate_link);
                        alert('Affiliate link copied!');
                      }}
                    >
                      📋 Copy Link
                    </button>
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
