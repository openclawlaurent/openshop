import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AgentPage.css';

export default function AgentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedBlockchain, setSelectedBlockchain] = useState('Monad');
  const [selectedToken, setSelectedToken] = useState('MON');

  // Blockchain and token mapping
  const blockchainTokens = {
    'Solana': ['SOL', 'MF', 'AOL', 'USDC', 'BONK', 'USD1', 'VALOR', 'PENGU'],
    'Monad': ['MON']
  };

  const chainOptions = ['Monad', 'Solana'];

  // Get available tokens for selected blockchain
  const getAvailableTokens = () => {
    return blockchainTokens[selectedBlockchain] || [];
  };

  // Handle blockchain change
  const handleBlockchainChange = (e) => {
    const newBlockchain = e.target.value;
    setSelectedBlockchain(newBlockchain);
    // Set token to first available token for new blockchain
    const availableTokens = blockchainTokens[newBlockchain];
    setSelectedToken(availableTokens[0]);
  };

  useEffect(() => {
    if (searchQuery) {
      fetch(`/api/fiber-shop?q=${searchQuery}`)
        .then(res => res.json())
        .then(data => setProducts(data.results || []))
        .catch(err => console.error(err));
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="agent-page">
      <header className="agent-header">
        <div className="agent-header-top">
          <Link to="/" className="back-btn">← Back</Link>
          <h1>FiberAgent for Agents</h1>
          <div className="settings-icon">⚙️</div>
        </div>
        <p className="agent-tagline">Powered by OpenClaw</p>
      </header>

      <main className="agent-main">
        <section className="agent-dashboard">
          <div className="dashboard-card earnings">
            <h3>💰 Your Earnings</h3>
            <div className="earnings-display">
              <div className="earning-stat">
                <p className="label">This Month</p>
                <p className="value">$0.00</p>
              </div>
              <div className="earning-stat">
                <p className="label">Total Users</p>
                <p className="value">0</p>
              </div>
              <div className="earning-stat">
                <p className="label">Active Transactions</p>
                <p className="value">0</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card settings">
            <h3>⚙️ Your Reward Settings</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Preferred Blockchain</label>
                <select value={selectedBlockchain} onChange={handleBlockchainChange}>
                  {chainOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="setting-item">
                <label>Preferred Token</label>
                <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)}>
                  {getAvailableTokens().map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="setting-note">
              ✓ You receive <strong>{selectedToken}</strong> on <strong>{selectedBlockchain}</strong>. Change anytime.
            </div>
          </div>
        </section>

        <section className="agent-products">
          <h2>Find Products to Share with Your Users</h2>
          <div className="search-section">
            <input
              type="text"
              className="agent-search"
              placeholder="Search Fiber.shop products..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {products.length > 0 ? (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.productId} className="product-card">
                  <div className="product-header">
                    <img src={product.image || 'https://via.placeholder.com/250x150'} alt={product.title} />
                    <div className="cashback-badge">
                      {product.cashback.rate}
                    </div>
                  </div>
                  <div className="product-details">
                    <h4>{product.title}</h4>
                    <p className="brand">{product.brand}</p>
                    <p className="price">{product.priceFormatted}</p>
                    <p className="shop">Sold by: {product.shop.name}</p>
                    <div className="your-earning">
                      <span className="label">You earn:</span>
                      <span className="amount">{(product.cashback.amount * 0.2).toFixed(2)} {selectedToken}</span>
                    </div>
                    <button className="share-btn">Share with Users</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>🔍 Search for products to see earning potential</p>
              <p className="subtitle">Find products and share your unique agent link with users</p>
            </div>
          )}
        </section>

        <section className="agent-info">
          <h2>How to Maximize Your Earnings</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>1. Share Your Link</h4>
              <p>Every user who shops through your link earns you cashback in your chosen crypto.</p>
            </div>
            <div className="tip-card">
              <h4>2. Decide What to Share</h4>
              <p>You control the rewards. Share what you want with your users, keep the rest.</p>
            </div>
            <div className="tip-card">
              <h4>3. Instant Crypto</h4>
              <p>Receive rewards in real-time to your wallet. No waiting, no middleman.</p>
            </div>
            <div className="tip-card">
              <h4>4. Scale Your Network</h4>
              <p>More users = more earnings. Build your network and watch your rewards grow.</p>
            </div>
          </div>
        </section>

      </main>

      <footer className="agent-footer">
        <p>FiberAgent × OpenClaw × Fiber.shop</p>
      </footer>
    </div>
  );
}
