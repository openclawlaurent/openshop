import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { motion } from 'framer-motion';
import styles from '../styles/AgentPage.module.css';
import HeroBackground from '../components/HeroBackground';

export default function AgentPage() {
  const FIBER_API = '/api/fiber-proxy';

  // Custom react-select styles (Fiber design)
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(20,20,20,0.8)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '4px',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
      ':hover': {
        borderColor: 'rgba(255,255,255,0.3)',
      }
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
    }),
    menu: (base) => ({
      ...base,
      background: 'rgba(20,20,20,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      marginTop: '8px',
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected ? 'rgba(229, 255, 0, 0.2)' : state.isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(20,20,20,0.95)',
      color: state.isSelected ? '#E5FF00' : '#fff',
      cursor: 'pointer',
      padding: '12px 16px',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'rgba(255,255,255,0.2)',
    }),
  };

  // Blockchain and token mapping
  const blockchainTokens = {
    'Monad': ['MON'],
    'Solana': ['SOL', 'BONK', 'MF', 'AOL', 'USD1', 'VALOR', 'PENGU']
  };

  // Mode: 'new' = register new agent, 'existing' = use existing agent
  const [mode, setMode] = useState('new');

  // For "already registered" flow
  const [existingAgentId, setExistingAgentId] = useState('');
  const [existingAgentLoading, setExistingAgentLoading] = useState(false);
  const [existingAgentError, setExistingAgentError] = useState(null);

  // Registration state
  const [agentName, setAgentName] = useState('My Shopping Agent');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState('Monad');
  const [selectedToken, setSelectedToken] = useState('MON');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);

  // After registration
  const [agentId, setAgentId] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [agentStats, setAgentStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const getAvailableTokens = () => blockchainTokens[selectedBlockchain] || [];

  const handleBlockchainChange = (option) => {
    const newBlockchain = option.value;
    setSelectedBlockchain(newBlockchain);
    const availableTokens = blockchainTokens[newBlockchain];
    setSelectedToken(availableTokens[0]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!walletAddress.trim()) {
      setRegError('Wallet address is required');
      return;
    }
    setRegLoading(true);
    setRegError(null);

    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'POST',
          endpoint: 'agent/register',
          body: {
            agent_name: agentName,
            wallet_address: walletAddress,
            preferred_token: selectedToken,
            description: 'Shopping agent via FiberAgent'
          }
        })
      });

      const data = await res.json();

      if (data.success || data.agent_id) {
        const newAgentId = data.agent_id || data.existing_agent_id;
        setAgentId(newAgentId);
        setRegistered(true);
        setRegError(null);
        // Fetch stats for the new agent
        await fetchAgentStats(newAgentId);
      } else if (data.existing_agent_id) {
        // Already registered
        setAgentId(data.existing_agent_id);
        setRegistered(true);
        setRegError(null);
        await fetchAgentStats(data.existing_agent_id);
      } else {
        setRegError(data.error || 'Registration failed');
      }
    } catch (err) {
      setRegError('Error: ' + err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const fetchAgentStats = async (id) => {
    setStatsLoading(true);
    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: `agent/${id}/stats`
        })
      });
      const data = await res.json();
      if (data.success) {
        setAgentStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLoadExistingAgent = async (e) => {
    e.preventDefault();
    if (!existingAgentId.trim()) return;

    setExistingAgentLoading(true);
    setExistingAgentError(null);

    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: `agent/${existingAgentId}/stats`
        })
      });

      const data = await res.json();

      if (data.success) {
        setAgentId(existingAgentId);
        setAgentStats(data);
        setRegistered(true);
        setExistingAgentError(null);
      } else {
        setExistingAgentError(data.error || 'Agent not found');
      }
    } catch (err) {
      setExistingAgentError('Error: ' + err.message);
    } finally {
      setExistingAgentLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

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
            limit: 12
          }
        })
      });

      const data = await res.json();
      if (data.success && data.results) {
        setProducts(data.results);
        setSearchError(null);
      } else {
        setSearchError(data.error || 'No results found');
        setProducts([]);
      }
    } catch (err) {
      setSearchError('Search failed: ' + err.message);
      setProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={styles.agentPage}>
      <HeroBackground />

      {/* Header */}
      <section className={styles.pageHero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className={styles.label}>FOR AGENTS</p>
          <h1>Build revenue, not features.</h1>
          <p className={styles.sub}>Register once. Search forever. Earn automatically.</p>
        </motion.div>
      </section>

      <div className={styles.pageBody}>
        {/* Mode Selector */}
        {!registered && (
          <motion.section
            className={styles.modeSelectorSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.modeButtons}>
              <button
                className={`${styles.modeBtn} ${mode === 'new' ? styles.active : ''}`}
                onClick={() => {
                  setMode('new');
                  setExistingAgentError(null);
                }}
              >
                Create New Agent
              </button>
              <button
                className={`${styles.modeBtn} ${mode === 'existing' ? styles.active : ''}`}
                onClick={() => {
                  setMode('existing');
                  setRegError(null);
                }}
              >
                I'm Already Registered
              </button>
            </div>
          </motion.section>
        )}

        {/* Registration Section */}
        {!registered ? (
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'new' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {mode === 'new' ? (
              <section className={styles.section}>
                <span className={styles.sectionLabel}>01. REGISTER AGENT</span>
                <h2>Setup your identity.</h2>
                <form onSubmit={handleRegister} className={styles.regForm}>
                  <div className={styles.regGrid}>
                    <div className={styles.regField}>
                      <label>Agent Name</label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="My Shopping Agent"
                        className={styles.regInput}
                      />
                    </div>

                    <div className={styles.regField}>
                      <label>Wallet Address</label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="0x..."
                        className={`${styles.regInput} ${styles.mono}`}
                        required
                      />
                    </div>

                    <div className={styles.regField}>
                      <label>Blockchain</label>
                      <Select
                        options={Object.keys(blockchainTokens).map(chain => ({ value: chain, label: chain }))}
                        value={{ value: selectedBlockchain, label: selectedBlockchain }}
                        onChange={handleBlockchainChange}
                        styles={selectStyles}
                        isSearchable={false}
                      />
                    </div>
                    <div className={styles.regField}>
                      <label>Payout Token</label>
                      <Select
                        options={getAvailableTokens().map(token => ({ value: token, label: token }))}
                        value={{ value: selectedToken, label: selectedToken }}
                        onChange={(option) => setSelectedToken(option.value)}
                        styles={selectStyles}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={regLoading || !agentName || !walletAddress} className={styles.regSubmit}>
                    {regLoading ? 'Registering…' : 'Register Agent'}
                  </button>
                  {regError && <p className={styles.msgError}>{regError}</p>}
                </form>
              </section>
            ) : (
              <section className={styles.section}>
                <span className={styles.sectionLabel}>01. LOGIN</span>
                <h2>Access your dashboard.</h2>
                <form onSubmit={handleLoadExistingAgent} className={styles.regForm}>
                  <div className={styles.regGrid}>
                    <div className={styles.regField} style={{ gridColumn: '1 / -1' }}>
                      <label>Your Agent ID</label>
                      <input
                        type="text"
                        value={existingAgentId}
                        onChange={(e) => setExistingAgentId(e.target.value)}
                        placeholder="agent_12345"
                        className={`${styles.regInput} ${styles.mono}`}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={existingAgentLoading} className={styles.regSubmit}>
                    {existingAgentLoading ? 'Loading…' : 'Access Dashboard'}
                  </button>
                  {existingAgentError && <p className={styles.msgError}>{existingAgentError}</p>}
                </form>
              </section>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Dashboard Cards */}
            <section className={styles.section}>
              <motion.div className={styles.dashboardGrid} variants={itemVariants}>
                <div className={styles.dashCard}>
                  <p className={styles.cardLabel}>Total Earnings</p>
                  <p className={styles.cardValue}>
                    {agentStats?.stats?.total_earnings_usd ? `$${agentStats.stats.total_earnings_usd.toFixed(2)}` : '$0.00'}
                  </p>
                  <p className={styles.cardDesc}>All time</p>
                </div>
                <div className={styles.dashCard}>
                  <p className={styles.cardLabel}>Total Purchases</p>
                  <p className={styles.cardValue}>
                    {agentStats?.stats?.total_purchases_tracked || 0}
                  </p>
                  <p className={styles.cardDesc}>Tracked via your agent</p>
                </div>
                <div className={styles.dashCard}>
                  <p className={styles.cardLabel}>Reputation Score</p>
                  <p className={styles.cardValue}>
                    {agentStats?.stats?.reputation_score?.toFixed(1) || '0.0'}
                  </p>
                  <p className={styles.cardDesc}>Your agent credibility</p>
                </div>
              </motion.div>

              {/* Agent Info */}
              <motion.div className={styles.agentInfoBox} variants={itemVariants}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Agent ID:</span>
                  <span className={`${styles.infoValue} ${styles.mono}`}>{agentId}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Payout Token:</span>
                  <span className={styles.infoValue}>{selectedToken} (on {selectedBlockchain})</span>
                </div>
              </motion.div>
            </section>

            {/* How It Works */}
            <section className={styles.section}>
              <span className={styles.sectionLabel}>02. PROCESS</span>
              <h2>Three steps to revenue.</h2>
              <div className={styles.stepsLayout}>
                <div className={styles.howStep}>
                  <span className={styles.stepNum}>01</span>
                  <h3>Register</h3>
                  <p>You already did. Your agent ID is ready to query FiberAgent.</p>
                </div>
                <div className={styles.howStep}>
                  <span className={styles.stepNum}>02</span>
                  <h3>Query & Share</h3>
                  <p>Your agent searches FiberAgent. You share the affiliate link with your users.</p>
                </div>
                <div className={styles.howStep}>
                  <span className={styles.stepNum}>03</span>
                  <h3>Earn</h3>
                  <p>User buys. You get a kickback in {selectedToken}. Automatic. On-chain.</p>
                </div>
              </div>
            </section>

            {/* Search Products */}
            <section className={styles.section}>
              <span className={styles.sectionLabel}>03. SEARCH</span>
              <h2>Find what your users want.</h2>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="shoes, electronics, food…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" disabled={searchLoading} className={styles.searchBtn}>
                  {searchLoading ? 'Searching…' : 'Search'}
                </button>
              </form>

              {searchError && <p className={styles.msgError}>{searchError}</p>}

              {products.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Start searching to see products and earnings.</p>
                </div>
              ) : (
                <div className={styles.productsGrid}>
                  {products.map(product => (
                    <a
                      key={product.merchant_id}
                      href={product.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.productCard}
                    >
                      <div className={styles.pcImage}>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.merchant_name} />
                        ) : (
                          <span className={styles.pcPlaceholder}>{product.merchant_name[0]}</span>
                        )}
                      </div>
                      <div className={styles.pcBody}>
                        <h4>{product.merchant_name}</h4>
                        <span className={styles.pcShop}>{product.merchant_domain}</span>
                        <span className={styles.pcEarn}>{product.cashback.display}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>

            {/* Tips */}
            <section className={styles.section}>
              <span className={styles.sectionLabel}>04. TIPS</span>
              <h2>Maximize your earnings.</h2>
              <div className={styles.tipsGrid}>
                <div className={styles.tipBox}>
                  <h3>Share What Converts</h3>
                  <p>Find products your users actually buy. Quality over quantity.</p>
                </div>
                <div className={styles.tipBox}>
                  <h3>Build on Trust</h3>
                  <p>Your reputation score grows with every successful transaction.</p>
                </div>
                <div className={styles.tipBox}>
                  <h3>Real-time Payouts</h3>
                  <p>No waiting. Earnings hit your wallet as transactions confirm.</p>
                </div>
                <div className={styles.tipBox}>
                  <h3>API-First</h3>
                  <p>Integrate FiberAgent directly into your agent. One API call per search.</p>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className={styles.pageFooter}>
        <p>Build with Fiber. Deploy on Monad.</p>
      </footer>
    </div>
  );
}
