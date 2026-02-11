import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConversationDemo from '../components/ConversationDemo';
import '../styles/UserPage.css';

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

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
    <div className="user-page">
      <header className="user-header">
        <div className="user-header-top">
          <Link to="/" className="back-btn">← Back</Link>
          <h1>FiberAgent for Humans</h1>
          <div className="user-icon">👥</div>
        </div>
        <p className="user-tagline">Shop with your trusted agent - Powered by OpenClaw</p>
      </header>

      <main className="user-main">
        <section className="user-hero">
          <h2>Shop Fiber.shop Through Your Agent</h2>
          <p>Just ask your agent naturally. They understand your request, find the best deals, and earn crypto rewards.</p>
        </section>

        <section className="user-chat-demo">
          <h3>See it in Action</h3>
          <ConversationDemo />
        </section>

        <section className="user-products">
          <div className="search-section">
            <input
              type="text"
              className="user-search"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {products.length > 0 ? (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.productId} className="product-card">
                  <div className="product-image">
                    <img src={product.image || 'https://via.placeholder.com/250x150'} alt={product.title} />
                  </div>
                  <div className="product-info">
                    <h4>{product.title}</h4>
                    <p className="brand">{product.brand}</p>
                    <p className="price">{product.priceFormatted}</p>
                    <div className="reward-info">
                      <span className="label">Your agent earns:</span>
                      <span className="amount">{product.cashback.rate}</span>
                    </div>
                    <p className="shop">From: {product.shop.name}</p>
                    <button className="buy-btn">Buy Through Agent</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>🛍️ Search for products and shop with your agent</p>
              <p className="subtitle">All transactions go through your agent's link</p>
            </div>
          )}
        </section>

        <section className="user-info">
          <h2>How It Works for You</h2>
          <div className="info-cards">
            <div className="info-card">
              <h4>🤝 Trusted Agent</h4>
              <p>You shop through an agent you trust. They have a stake in your satisfaction.</p>
            </div>
            <div className="info-card">
              <h4>💰 Potential Rewards</h4>
              <p>Your agent earns crypto cashback. They may choose to share it with you.</p>
            </div>
            <div className="info-card">
              <h4>🌍 Wide Selection</h4>
              <p>Access Fiber.shop's full product catalog through FiberAgent.</p>
            </div>
            <div className="info-card">
              <h4>⚡ Fast & Secure</h4>
              <p>Instant checkout. All transactions secured and transparent.</p>
            </div>
          </div>
        </section>

        <section className="why-agents">
          <h2>Why Shop Through an Agent?</h2>
          <div className="why-content">
            <p>
              Unlike traditional marketplaces, shopping through an agent creates a direct relationship.
              Your agent earns crypto rewards and can choose to share benefits with you.
            </p>
            <p>
              This is only possible with crypto - traditional payment systems don't allow this kind of 
              flexible, agent-controlled reward sharing.
            </p>
            <div className="agent-flow">
              <div className="flow-item">
                <div className="flow-icon">1</div>
                <p>You shop</p>
              </div>
              <div className="arrow">→</div>
              <div className="flow-item">
                <div className="flow-icon">2</div>
                <p>Agent earns crypto</p>
              </div>
              <div className="arrow">→</div>
              <div className="flow-item">
                <div className="flow-icon">3</div>
                <p>Agent decides to share</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="user-footer">
        <p>FiberAgent × OpenClaw × Fiber.shop</p>
      </footer>
    </div>
  );
}
