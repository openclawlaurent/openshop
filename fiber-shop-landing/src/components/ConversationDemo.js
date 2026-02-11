import React, { useState, useEffect } from 'react';
import '../styles/ConversationDemo.css';

export default function ConversationDemo() {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showProducts, setShowProducts] = useState(false);
  const [userResponded, setUserResponded] = useState(false);
  const [agentReward, setAgentReward] = useState(0);

  const conversationFlow = [
    {
      type: 'user',
      text: "Hey! It's raining outside and I need new shoes. Can you help me find something good?",
      delay: 0
    },
    {
      type: 'agent',
      text: "Of course! I can help you find the perfect rain shoes. To get you the best recommendations, could you tell me:\n\n1. What's your shoe size?\n2. What color do you prefer?",
      delay: 1200
    }
  ];

  const userResponse = {
    type: 'user',
    text: "I wear size 9 and I'd prefer black or dark blue. Something waterproof would be great!",
    delay: 0
  };

  const agentResponse = {
    type: 'agent',
    text: "Perfect! I found some great waterproof options for you. Here are my top recommendations:",
    delay: 400
  };

  // Typewriter effect
  useEffect(() => {
    if (currentStep < conversationFlow.length) {
      const message = conversationFlow[currentStep];
      const timer = setTimeout(() => {
        let displayedText = '';
        let charIndex = 0;

        const typeInterval = setInterval(() => {
          if (charIndex < message.text.length) {
            displayedText += message.text[charIndex];
            setMessages(prev => {
              const updated = [...prev];
              updated[currentStep] = { ...message, displayedText };
              return updated;
            });
            charIndex++;
          } else {
            clearInterval(typeInterval);
            // Move to next message after a delay
            setTimeout(() => {
              setCurrentStep(prev => prev + 1);
            }, 800);
          }
        }, 10);

        setMessages(prev => [...prev, message]);

        return () => clearInterval(typeInterval);
      }, message.delay);

      return () => clearTimeout(timer);
    } else if (currentStep === conversationFlow.length && !userResponded) {
      // Show user response after agent's question
      const timer = setTimeout(() => {
        let displayedText = '';
        let charIndex = 0;

        const typeInterval = setInterval(() => {
          if (charIndex < userResponse.text.length) {
            displayedText += userResponse.text[charIndex];
            setMessages(prev => {
              const updated = [...prev];
              updated[conversationFlow.length] = { ...userResponse, displayedText };
              return updated;
            });
            charIndex++;
          } else {
            clearInterval(typeInterval);
            setUserResponded(true);
            // Show agent response with products
            setTimeout(() => {
              setMessages(prev => [...prev.slice(0, -1)]);
              // Re-add user message fully
              setMessages(prev => [...prev, { ...userResponse, displayedText: userResponse.text }]);
              // Add agent response
              let agentDisplayText = '';
              let agentCharIndex = 0;
              const agentTypeInterval = setInterval(() => {
                if (agentCharIndex < agentResponse.text.length) {
                  agentDisplayText += agentResponse.text[agentCharIndex];
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[conversationFlow.length + 1] = { ...agentResponse, displayedText: agentDisplayText };
                    return updated;
                  });
                  agentCharIndex++;
                } else {
                  clearInterval(agentTypeInterval);
                  setTimeout(() => setShowProducts(true), 400);
                }
              }, 10);
              setMessages(prev => [...prev, { ...agentResponse, displayedText: '' }]);
            }, 400);
          }
        }, 10);

        return () => clearInterval(typeInterval);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentStep, userResponded]);

  const handlePurchase = (productName, price) => {
    const reward = Math.round(price * 0.05 * 100) / 100; // 5% cashback
    setAgentReward(agentReward + reward);
    
    // Add completion message
    setMessages(prev => [...prev, {
      type: 'system',
      text: `✅ Purchase complete! Your agent earned ${reward} MON in cashback rewards!`,
      displayedText: `✅ Purchase complete! Your agent earned ${reward} MON in cashback rewards!`
    }]);
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h3>🤖 Live Demo: Agent-Powered Shopping</h3>
        <p>See how FiberAgent works in real-time</p>
      </div>

      <div className="conversation-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <div className="message-avatar">
              {msg.type === 'user' && '👤'}
              {msg.type === 'agent' && '🤖'}
              {msg.type === 'system' && '✨'}
            </div>
            <div className="message-content">
              <p className="message-text">{msg.displayedText || msg.text}</p>
            </div>
          </div>
        ))}

        {showProducts && (
          <div className="products-recommendation">
            <div className="product-rec">
              <img src="https://via.placeholder.com/150x120?text=Adidas+Shoes" alt="Adidas Waterproof Runner" />
              <h5>Adidas Waterproof Runner</h5>
              <p className="shop-name">From: Adidas</p>
              <p className="price">$89.99</p>
              <p className="cashback">💰 Agent earns: 4.50 MON</p>
              <button className="buy-link" onClick={() => handlePurchase('Adidas Waterproof Runner', 89.99)}>
                Buy on Adidas.com →
              </button>
              <p className="affiliate-note">Affiliate link tracked to agent</p>
            </div>

            <div className="product-rec">
              <img src="https://via.placeholder.com/150x120?text=Nike+Boots" alt="Nike Storm Boots" />
              <h5>Nike Storm Boots</h5>
              <p className="shop-name">From: Nike</p>
              <p className="price">$129.99</p>
              <p className="cashback">💰 Agent earns: 6.50 MON</p>
              <button className="buy-link" onClick={() => handlePurchase('Nike Storm Boots', 129.99)}>
                Buy on Nike.com →
              </button>
              <p className="affiliate-note">Affiliate link tracked to agent</p>
            </div>

            <div className="product-rec">
              <img src="https://via.placeholder.com/150x120?text=Puma+Shoes" alt="Puma Aqua Comfort" />
              <h5>Puma Aqua Comfort Pro</h5>
              <p className="shop-name">From: Puma</p>
              <p className="price">$149.99</p>
              <p className="cashback">💰 Agent earns: 7.50 MON</p>
              <button className="buy-link" onClick={() => handlePurchase('Puma Aqua Comfort Pro', 149.99)}>
                Buy on Puma.com →
              </button>
              <p className="affiliate-note">Affiliate link tracked to agent</p>
            </div>
          </div>
        )}
      </div>

      {agentReward > 0 && (
        <div className="reward-display">
          <h4>Agent Earnings This Demo</h4>
          <div className="reward-amount">
            <span className="coin-icon">🪙</span>
            <span className="amount">{agentReward.toFixed(2)} MON</span>
          </div>
          <p className="reward-note">Agent can now share with user or keep for themselves</p>
        </div>
      )}
    </div>
  );
}
