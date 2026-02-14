import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/DemoPage.module.css';
import HeroBackground from '../components/HeroBackground';

export default function DemoPage() {
  const FIBER_API = '/api/fiber-proxy';

  const generateTestWallet = () => {
    const hex = '0123456789abcdef';
    let addr = '0xtest';
    for (let i = 0; i < 36; i++) addr += hex[Math.floor(Math.random() * 16)];
    return addr;
  };

  const [agentId, setAgentId] = useState(null);
  const [agentName, setAgentName] = useState('My Shopping Agent');
  const [walletAddress, setWalletAddress] = useState(() => generateTestWallet());
  const [regResponse, setRegResponse] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);

  const [searchKeywords, setSearchKeywords] = useState('shoes');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'POST',
          endpoint: 'agent/register',
          body: { agent_name: agentName, wallet_address: walletAddress, description: 'Shopping agent via FiberAgent' }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.existing_agent_id) {
          setAgentId(data.existing_agent_id);
          setRegResponse({ agent_id: data.existing_agent_id, agent_name: agentName, status: 'active (existing)' });
        } else {
          setRegError(data.error || 'Registration failed');
        }
      } else {
        setRegResponse(data);
        setAgentId(data.agent_id);
      }
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!agentId) { setSearchError('Register first'); return; }
    
    // Clear previous results immediately
    setSearchResults(null);
    setSearchLoading(true);
    setSearchError(null);
    
    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/search',
          queryParams: { keywords: searchKeywords, agent_id: agentId, limit: 8 }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) setSearchError(data.error || 'Search failed');
      else setSearchResults(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className={styles.demo}>
      <HeroBackground />

      {/* Header */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className={styles.label}>LIVE DEMO</p>
          <h1>Try FiberAgent.</h1>
          <p className={styles.sub}>Register an agent, search 50,000+ merchants, see real cashback rates.</p>
        </motion.div>
      </section>

      <div className={styles.demoBody}>
        {/* Step 1 */}
        <motion.section
          className={styles.panel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={styles.panelHead}>
            <span className={styles.stepBadge}>01</span>
            <h2>Register your agent</h2>
          </div>
          <form onSubmit={handleRegister} className={styles.regForm}>
            <div className={styles.field}>
              <label>Agent Name</label>
              <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="My Shopping Agent" />
            </div>

            <div className={styles.field}>
              <label>Wallet Address (Optional)</label>
              <input 
                value={walletAddress} 
                onChange={e => setWalletAddress(e.target.value)} 
                placeholder="0xtest..." 
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>

            <button type="submit" disabled={regLoading} className={styles.btnSubmit}>
              {regLoading ? 'Registering…' : 'Register Agent'}
            </button>
            {regError && <p className={styles.msgError}>{regError}</p>}
            {regResponse && (
              <div className={styles.msgSuccess}>
                <p><strong>Agent ID</strong> {regResponse.agent_id}</p>
                <p><strong>Status</strong> {regResponse.status || 'active'}</p>
              </div>
            )}
          </form>
        </motion.section>

        {/* Step 2 */}
        <motion.section
          className={styles.panel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className={styles.panelHead}>
            <span className={styles.stepBadge}>02</span>
            <h2>Search products</h2>
          </div>

          <div style={{ position: 'relative' }}>
            {!agentId && (
              <div className={styles.authOverlay}>
                <span className={styles.authMsg}>🔒 Complete Step 1 to Unlock</span>
              </div>
            )}

            <form onSubmit={handleSearch} className={styles.searchForm} style={{ opacity: agentId ? 1 : 0.3, pointerEvents: agentId ? 'auto' : 'none' }}>
              <input value={searchKeywords} onChange={e => setSearchKeywords(e.target.value)} placeholder="shoes, electronics, fitness…" />
              <button type="submit" disabled={searchLoading} className={styles.btnSubmit}>
                {searchLoading ? 'Searching…' : 'Search'}
              </button>
            </form>
          </div>

          {searchError && <p className={styles.msgError}>{searchError}</p>}
        </motion.section>

        {/* Results */}
        {searchResults && searchResults.results && (
          <motion.section
            className={styles.resultsSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className={styles.resultsCount}>{searchResults.results_count} merchants found for "{searchResults.query}"</p>
            <div className={styles.resultsGrid}>
              {searchResults.results.map((m) => (
                <a key={m.merchant_id} href={m.affiliate_link} target="_blank" rel="noopener noreferrer" className={styles.merchantCard}>
                  <div className={styles.mcImage}>
                    {m.image_url ? <img src={m.image_url} alt={m.merchant_name} /> : <span className={styles.mcPlaceholder}>{m.merchant_name[0]}</span>}
                  </div>
                  <div className={styles.mcBody}>
                    <h3>{m.merchant_name}</h3>
                    <span className={styles.mcDomain}>{m.merchant_domain}</span>
                    <span className={styles.mcCashback}>{m.cashback.display} cashback</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
