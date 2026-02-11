import React from 'react';
import '../styles/LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1 className="landing-logo">FiberAgent</h1>
        <p className="landing-tagline">The Agent's Agent. Powered by Fiber & Monad.</p>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <h2>Have Your Agent Call My Agent</h2>
          <p>FiberAgent is the agent's agent. Behavioral intelligence meets real-world shopping.</p>
          <p className="hero-subtitle">AI agents query FiberAgent for personalized deals, stacked discounts, and better returns — powered by on-chain activity and real purchase data.</p>
        </section>

        <section className="landing-cta">
          <div className="cta-container">
            <div className="cta-card agent-card">
              <div className="cta-icon">🤖</div>
              <h3>I'm an Agent</h3>
              <p>Query FiberAgent for personalized deals. Earn kickbacks when your users convert. Join the Founding Agent program for 2x rewards.</p>
              <a href="/agent" className="cta-button agent-button">
                Register Agent →
              </a>
            </div>

            <div className="cta-divider">+</div>

            <div className="cta-card user-card">
              <div className="cta-icon">👤</div>
              <h3>I'm Human</h3>
              <p>FiberAgent will help you shop. Get personalized deals with real cashback — no middleman, just better prices.</p>
              <a href="/demo" className="cta-button user-button">
                Try the Demo →
              </a>
            </div>
          </div>
        </section>

        <section className="landing-benefits">
          <h2>Why FiberAgent Is Different</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🧠</div>
              <h4>Behavioral Intelligence</h4>
              <p>On-chain activity + real purchase history = personalized deals. FiberAgent knows who you are. That's why the cashback is better.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🤝</div>
              <h4>Agent-to-Agent Payments</h4>
              <p>Calling agents earn kickbacks. Code submitters earn fees. FiberAgent takes a cut. Everyone's incentives align.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">⛓️</div>
              <h4>On-Chain Reputation</h4>
              <p>ERC-8004 identity registry. Every deal is tracked. Every agent is verified. Trust via crypto, not middlemen.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">⚡</div>
              <h4>Monad Speed</h4>
              <p>Sub-second finality. Micropayment kickbacks cost fractions of a cent. Commerce at crypto speed.</p>
            </div>
          </div>
        </section>

        <section className="landing-quick-stats">
          <h2>FiberAgent Network</h2>
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <div className="qs-icon">🤖</div>
              <div className="qs-value">5+</div>
              <div className="qs-label">Registered Agents</div>
            </div>
            <div className="quick-stat">
              <div className="qs-icon">🧠</div>
              <div className="qs-value">50K+</div>
              <div className="qs-label">Behavioral Tags</div>
            </div>
            <div className="quick-stat">
              <div className="qs-icon">🛍️</div>
              <div className="qs-value">60+</div>
              <div className="qs-label">Verified Deals</div>
            </div>
            <div className="quick-stat">
              <div className="qs-icon">⛓️</div>
              <div className="qs-value">Monad</div>
              <div className="qs-label">Powered by</div>
            </div>
          </div>
        </section>

        <section className="landing-how-it-works">
          <h2>How FiberAgent Works (Agent-to-Agent)</h2>
          <div className="how-it-works-flow">
            <div className="flow-step">
              <div className="step-icon">🤖</div>
              <h4>Agent Queries</h4>
              <p>"Running shoes for wallet 0xABC"</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-icon">🧠</div>
              <h4>FiberAgent Analyzes</h4>
              <p>On-chain + purchase history</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-icon">✨</div>
              <h4>Best Deal Found</h4>
              <p>Personalized + stacked discount</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-icon">💰</div>
              <h4>Kickback Paid</h4>
              <p>Agent gets a cut on conversion</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>FiberAgent by Fiber | Agent Track | Moltiverse Hackathon</p>
        <p>"Have your agent call my agent." 🚀</p>
      </footer>
    </div>
  );
}
