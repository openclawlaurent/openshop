import React, { useState } from 'react';
import '../styles/AgentDiscovery.css';

export default function AgentDiscovery() {
  const [selectedTab, setSelectedTab] = useState('discovery');
  const [showCurl, setShowCurl] = useState(false);

  const agentInfo = {
    id: 'fiberagent-agent-001',
    name: 'FiberAgent',
    description: 'Agent-powered commerce connector - access Fiber.shop products with crypto rewards',
    version: '1.0.0',
    capabilities: [
      'product_search',
      'agent_rewards',
      'affiliate_links',
      'crypto_settlement'
    ],
    endpoints: [
      {
        method: 'POST',
        path: '/api/agent/search',
        description: 'Search for products',
        example: {
          query: 'blue rain shoes',
          agent_id: 'some-agent-address',
          size: 10
        }
      },
      {
        method: 'POST',
        path: '/api/agent/product-details',
        description: 'Get detailed product info',
        example: {
          product_id: 'prod_123',
          agent_id: 'some-agent-address'
        }
      },
      {
        method: 'POST',
        path: '/api/agent/track-purchase',
        description: 'Track a purchase and register reward',
        example: {
          product_id: 'prod_123',
          agent_id: 'some-agent-address',
          purchase_amount: 99.99
        }
      }
    ]
  };

  const discoveryMethods = [
    {
      title: 'Moltiverse Agent Registry',
      icon: '📋',
      description: 'FiberAgent is registered in the Moltiverse agent registry. Other agents can discover us by querying the registry with capabilities filter.',
      code: `GET /moltiverse/registry?capabilities=commerce,rewards\n\nResponse:\n{\n  "agents": [\n    {\n      "id": "fiberagent-agent-001",\n      "name": "FiberAgent",\n      "url": "https://api.staging.fiber.shop/v1",\n      "capabilities": ["product_search", "affiliate_links", "cashback"]\n    }\n  ]\n}`
    },
    {
      title: 'Direct Agent Call',
      icon: '🔗',
      description: 'If an agent knows about FiberAgent, they can call us directly at our API endpoint.',
      code: `GET /v1/agent/search?keywords=blue+rain+shoes&agent_id=calling-agent&wallet=wallet_address\nHost: api.staging.fiber.shop\n\nResponse:\n{\n  "success": true,\n  "results": [\n    {\n      "merchant_name": "Nike",\n      "cashback": "3.25%",\n      "affiliate_link": "https://wild.link/..."\n    }\n  ]\n}`
    },
    {
      title: 'Agent Marketplace',
      icon: '🛍️',
      description: 'Agents can browse the Moltiverse marketplace where FiberAgent is listed with our capabilities and reviews.',
      code: `Agent Profile:\nName: FiberAgent\nType: Commerce\nRating: ⭐⭐⭐⭐⭐\nUsers: 1000+\nAPI Base: https://api.staging.fiber.shop/v1\nEndpoints: /agent/register, /agent/search, /agent/stats/*`
    }
  ];

  const integrationSteps = [
    {
      number: 1,
      title: 'Discover FiberAgent',
      description: 'Query Moltiverse registry for commerce agents'
    },
    {
      number: 2,
      title: 'Connect to API',
      description: 'Get our API endpoint and authentication token'
    },
    {
      number: 3,
      title: 'Search Products',
      description: 'Send product queries with your agent ID'
    },
    {
      number: 4,
      title: 'Display to Users',
      description: 'Show Fiber.shop products to your users'
    },
    {
      number: 5,
      title: 'Track Purchases',
      description: 'Send purchase data so we track your rewards'
    },
    {
      number: 6,
      title: 'Receive Crypto',
      description: 'Get MON rewards in your wallet'
    }
  ];

  return (
    <div className="agent-discovery-container">
      <h2>How Other Agents Find & Use FiberAgent</h2>

      <div className="tabs">
        <button 
          className={`tab ${selectedTab === 'discovery' ? 'active' : ''}`}
          onClick={() => setSelectedTab('discovery')}
        >
          🔍 Discovery Methods
        </button>
        <button 
          className={`tab ${selectedTab === 'api' ? 'active' : ''}`}
          onClick={() => setSelectedTab('api')}
        >
          📡 API Reference
        </button>
        <button 
          className={`tab ${selectedTab === 'integration' ? 'active' : ''}`}
          onClick={() => setSelectedTab('integration')}
        >
          🔧 Integration Steps
        </button>
      </div>

      {selectedTab === 'discovery' && (
        <div className="tab-content">
          <p className="intro-text">
            Agents discover FiberAgent through multiple channels in the Moltiverse ecosystem:
          </p>
          <div className="discovery-grid">
            {discoveryMethods.map((method, idx) => (
              <div key={idx} className="discovery-card">
                <div className="discovery-icon">{method.icon}</div>
                <h3>{method.title}</h3>
                <p className="description">{method.description}</p>
                <button 
                  className="code-toggle"
                  onClick={() => setShowCurl(showCurl === idx ? -1 : idx)}
                >
                  {showCurl === idx ? 'Hide' : 'Show'} Example
                </button>
                {showCurl === idx && (
                  <div className="code-block">
                    <pre><code>{method.code}</code></pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'api' && (
        <div className="tab-content">
          <div className="agent-info-box">
            <h3>FiberAgent Agent Info</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Agent ID:</span>
                <span className="value">{agentInfo.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">{agentInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Version:</span>
                <span className="value">{agentInfo.version}</span>
              </div>
            </div>
            <p className="description">{agentInfo.description}</p>
          </div>

          <div className="capabilities-box">
            <h3>Capabilities</h3>
            <div className="capabilities-list">
              {agentInfo.capabilities.map((cap, idx) => (
                <div key={idx} className="capability">
                  <span className="icon">✓</span>
                  <span className="name">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="endpoints-box">
            <h3>API Endpoints</h3>
            {agentInfo.endpoints.map((ep, idx) => (
              <div key={idx} className="endpoint">
                <div className="endpoint-header">
                  <span className="method">{ep.method}</span>
                  <span className="path">{ep.path}</span>
                </div>
                <p className="endpoint-desc">{ep.description}</p>
                <div className="endpoint-example">
                  <strong>Example Request:</strong>
                  <pre><code>{JSON.stringify(ep.example, null, 2)}</code></pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'integration' && (
        <div className="tab-content">
          <p className="intro-text">
            Follow these steps to integrate FiberAgent into your agent:
          </p>
          <div className="integration-steps">
            {integrationSteps.map((step) => (
              <div key={step.number} className="integration-step">
                <div className="step-circle">{step.number}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="code-example">
            <h3>Example: Agent Calling FiberAgent</h3>
            <pre><code>{`// Agent receives user request
const userQuery = "I need blue rain shoes";
const agentId = "my-agent-id-123";

// Call FiberAgent API
const response = await fetch('http://fetch.local/api/agent/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    query: userQuery,
    agent_id: agentId,
    size: 10
  })
});

const products = await response.json();

// Display products to user
console.log(\`Found \${products.length} products:\`);
products.forEach(p => {
  console.log(\`- \${p.title} from \${p.shop.name} (\${p.cashback.rate})\`);
});\n\n// When user clicks buy
async function trackPurchase(productId, amount) {
  await fetch('http://fetch.local/api/agent/track-purchase', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
    body: JSON.stringify({
      product_id: productId,
      agent_id: agentId,
      purchase_amount: amount
    })
  });
}`}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
}
