import React from 'react';
import '../styles/ArchitectureExplainer.css';

export default function ArchitectureExplainer() {
  return (
    <div className="architecture-container">
      <h2>How FiberAgent Works - The Technical Flow</h2>
      
      <div className="flow-diagram">
        <div className="flow-box user-box">
          <div className="box-title">👤 User</div>
          <div className="box-content">
            <p className="message">"I need blue rain shoes, size 9"</p>
          </div>
        </div>

        <div className="arrow-down">↓</div>

        <div className="flow-box agent-box">
          <div className="box-title">🤖 User's Agent</div>
          <div className="box-content">
            <p className="message">"blue rain shoes, size 9"</p>
            <p className="metadata">Agent Address: 0xab12...cd34</p>
          </div>
        </div>

        <div className="arrow-down">↓</div>

        <div className="flow-box fetch-box">
          <div className="box-title">🛍️ FiberAgent (Us)</div>
          <div className="box-content">
            <p className="message">Query: "blue rain shoes"</p>
            <p className="metadata">Agent: 0xab12...cd34</p>
          </div>
        </div>

        <div className="arrow-down">↓</div>

        <div className="flow-box fiber-box">
          <div className="box-title">💎 Fiber.shop API</div>
          <div className="box-content">
            <p className="message">Returns merchant list with products</p>
            <p className="metadata">Price, cashback rate, merchant info</p>
          </div>
        </div>

        <div className="arrow-down">↓</div>

        <div className="flow-box merchant-box">
          <div className="box-title">🏪 Real Merchant</div>
          <div className="box-content">
            <p className="message">User completes purchase</p>
            <p className="metadata">Direct link to Adidas, Nike, etc.</p>
            <p className="note">⚡ Affiliate link (tracked back to agent)</p>
          </div>
        </div>

        <div className="arrow-down">↓</div>

        <div className="flow-box cashback-box">
          <div className="box-title">💰 Cashback Flow</div>
          <div className="box-content">
            <p className="message">Merchant → Fiber.shop → FiberAgent → Agent</p>
            <p className="metadata">In MON or other crypto</p>
          </div>
        </div>
      </div>

      <div className="key-points">
        <h3>Key Points</h3>
        <div className="points-grid">
          <div className="point">
            <h4>🔗 Affiliate Links</h4>
            <p>Users shop directly on real merchants (Adidas, Nike, etc.), not on Fiber.shop. The link is tracked so the agent gets credit.</p>
          </div>
          <div className="point">
            <h4>📍 Agent Identity</h4>
            <p>Each agent has an address/ID. When they ask FiberAgent for products, we track who requested it for analytics and rewards.</p>
          </div>
          <div className="point">
            <h4>💳 Fiber.shop Role</h4>
            <p>Fiber.shop provides the product catalog and cashback rates. We connect agents to their API and handle the affiliate relationships.</p>
          </div>
          <div className="point">
            <h4>🪙 Crypto Settlement</h4>
            <p>Cashback flows back as crypto (MON, USDC, etc.) to the agent's wallet. Agent decides what to share with users.</p>
          </div>
        </div>
      </div>

      <div className="example-transaction">
        <h3>Example Transaction</h3>
        <div className="transaction-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>User asks agent:</strong> "I need blue Adidas rain shoes"
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Agent asks FiberAgent:</strong> Search for "blue Adidas rain shoes" (Agent ID: 0xab12...cd34)
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>FiberAgent queries Fiber.shop:</strong> Returns 10 products with cashback rates
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>Agent shows products to user:</strong> "Buy from Adidas for $99.99 (I earn 5% cashback)"
            </div>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <strong>User clicks affiliate link:</strong> Goes directly to adidas.com with tracking ID
            </div>
          </div>
          <div className="step">
            <div className="step-number">6</div>
            <div className="step-content">
              <strong>User completes purchase:</strong> Pays $99.99 to Adidas
            </div>
          </div>
          <div className="step">
            <div className="step-number">7</div>
            <div className="step-content">
              <strong>Agent receives reward:</strong> 5 MON (≈$5) credited to their wallet
            </div>
          </div>
          <div className="step">
            <div className="step-number">8</div>
            <div className="step-content">
              <strong>Agent decides:</strong> Keep the 5 MON or send some to user as a thank you
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
