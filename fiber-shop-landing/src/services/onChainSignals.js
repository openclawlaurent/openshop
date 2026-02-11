/**
 * On-Chain Signal Detection Service
 * 
 * Analyzes wallet behavior to detect signals:
 * - Token holdings (MON, BONK, PENGU, etc.)
 * - NFT ownership patterns
 * - DeFi activity (trading volume, yield farming)
 * - Transaction patterns
 * 
 * Currently: Mock signals (deterministic based on wallet address)
 * Future: Real Monad RPC integration
 */

class OnChainSignalDetector {
  constructor() {
    this.signals = {
      MON_HOLDER: 'mon_holder',
      BONK_HOLDER: 'bonk_holder',
      PENGU_HOLDER: 'pengu_holder',
      NFT_COLLECTOR: 'nft_collector',
      DEFI_TRADER: 'defi_trader',
      POWER_USER: 'power_user',
      STAKER: 'staker',
      LP_PROVIDER: 'lp_provider',
      FREQUENT_TRADER: 'frequent_trader'
    };
  }

  /**
   * Detect signals from wallet address
   * @param {string} walletAddress - Monad/Solana wallet address
   * @returns {Promise<Array>} Array of signal objects with strength 0-1.0
   */
  async detectSignals(walletAddress) {
    if (!walletAddress) {
      return {
        signals: [],
        summary: 'Unknown wallet',
        totalStrength: 0
      };
    }

    // Generate deterministic signals based on wallet address hash
    const hash = this._hashWallet(walletAddress);
    const signals = [];

    // MON Holder Signal (25% chance, strength 0.3-0.9)
    if (hash % 4 === 0) {
      const balance = ((hash % 1000) + 100) / 10; // 10-110 MON
      signals.push({
        type: this.signals.MON_HOLDER,
        description: 'Monad token holder',
        strength: Math.min(balance / 100, 1.0), // 0-1.0 scale
        metadata: {
          balance: balance,
          chain: 'monad'
        },
        recency: 'recent' // within 24h
      });
    }

    // BONK Holder Signal (35% chance, strength 0.2-0.8)
    if (hash % 3 === 1) {
      const balance = ((hash % 5000) + 1000) / 10; // 100-600 BONK
      signals.push({
        type: this.signals.BONK_HOLDER,
        description: 'BONK token holder (Solana)',
        strength: 0.2 + ((hash % 600) / 1000), // 0.2-0.8
        metadata: {
          balance: balance,
          chain: 'solana'
        },
        recency: 'recent'
      });
    }

    // Pudgy Penguins NFT Signal (15% chance, strength 0.6-1.0)
    if (hash % 7 === 2) {
      const count = ((hash % 5) + 1); // 1-5 NFTs
      signals.push({
        type: this.signals.PENGU_HOLDER,
        description: 'Pudgy Penguin NFT holder',
        strength: 0.6 + (count * 0.08), // 0.68-1.0
        metadata: {
          count: count,
          floorPrice: 8.5, // SOL
          chain: 'solana'
        },
        recency: 'recent'
      });
    }

    // NFT Collector Signal (30% chance, strength 0.5-1.0)
    if (hash % 3 === 0) {
      const nftCount = ((hash % 20) + 5); // 5-25 NFTs
      signals.push({
        type: this.signals.NFT_COLLECTOR,
        description: 'Active NFT collector',
        strength: Math.min(nftCount / 30, 1.0), // 0-1.0
        metadata: {
          totalNFTs: nftCount,
          collections: Math.ceil(nftCount / 4)
        },
        recency: 'recent'
      });
    }

    // DeFi Trader Signal (40% chance, strength 0.3-0.9)
    if (hash % 2 === 1) {
      const monthlyVolume = ((hash % 50) + 10) * 1000; // $10k-$60k/month
      signals.push({
        type: this.signals.DEFI_TRADER,
        description: 'Active DeFi trader',
        strength: Math.min(monthlyVolume / 100000, 0.9), // 0.1-0.9
        metadata: {
          monthlyVolume: monthlyVolume,
          tradesLast30d: Math.ceil(monthlyVolume / 2000),
          chains: ['monad', 'solana']
        },
        recency: 'recent'
      });
    }

    // Staker Signal (20% chance, strength 0.4-0.8)
    if (hash % 5 === 0) {
      const stakedAmount = ((hash % 200) + 50) * 10; // 500-2500 MON
      signals.push({
        type: this.signals.STAKER,
        description: 'Token staker / yield farmer',
        strength: 0.4 + ((hash % 400) / 1000), // 0.4-0.8
        metadata: {
          stakedAmount: stakedAmount,
          apy: (5 + (hash % 15)).toFixed(1), // 5-20% APY
          duration: Math.ceil((hash % 12) + 1), // 1-12 months
          chain: 'monad'
        },
        recency: 'recent'
      });
    }

    // Power User Signal (10% chance, strength 0.7-1.0)
    if (hash % 10 === 0) {
      const txCount = ((hash % 500) + 100); // 100-600 transactions
      signals.push({
        type: this.signals.POWER_USER,
        description: 'Power user (100+ transactions)',
        strength: Math.min(txCount / 500, 1.0), // 0.2-1.0
        metadata: {
          totalTransactions: txCount,
          firstTxDate: new Date(Date.now() - (hash % (365 * 24 * 60 * 60 * 1000))).toISOString()
        },
        recency: 'recent'
      });
    }

    // LP Provider Signal (15% chance, strength 0.5-0.85)
    if (hash % 6 === 2) {
      const lpValue = ((hash % 100) + 20) * 100; // $2000-$12000
      signals.push({
        type: this.signals.LP_PROVIDER,
        description: 'Liquidity provider',
        strength: Math.min(lpValue / 15000, 0.85), // 0.13-0.85
        metadata: {
          totalLiquidity: lpValue,
          poolCount: Math.ceil(lpValue / 3000),
          dex: ['Orca', 'Marinade'][hash % 2]
        },
        recency: 'recent'
      });
    }

    return {
      signals: signals,
      summary: `${signals.length} signals detected`,
      totalStrength: signals.reduce((sum, s) => sum + s.strength, 0) / Math.max(signals.length, 1),
      wallet: walletAddress
    };
  }

  /**
   * Detect wallet type based on dominant signals
   * @param {Array} signals - Array of signal objects
   * @returns {string} Wallet type classification
   */
  detectWalletType(signals) {
    if (signals.length === 0) return 'inactive';

    const signalTypes = signals.map(s => s.type);
    const defiCount = signalTypes.filter(s => 
      [this.signals.DEFI_TRADER, this.signals.LP_PROVIDER, this.signals.STAKER].includes(s)
    ).length;
    const nftCount = signalTypes.filter(s => 
      [this.signals.NFT_COLLECTOR, this.signals.PENGU_HOLDER].includes(s)
    ).length;
    const holdingCount = signalTypes.filter(s => 
      [this.signals.MON_HOLDER, this.signals.BONK_HOLDER].includes(s)
    ).length;

    if (defiCount >= 2) return 'defi_active';
    if (nftCount >= 2) return 'nft_collector';
    if (holdingCount >= 2 && defiCount >= 1) return 'power_user';
    if (holdingCount >= 1) return 'holder';
    if (defiCount >= 1) return 'defi_trader';
    
    return 'casual';
  }

  /**
   * Calculate overall signal strength (0-1.0)
   * @param {Array} signals
   * @returns {number}
   */
  calculateSignalStrength(signals) {
    if (signals.length === 0) return 0;
    const avgStrength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;
    const bonusForCount = Math.min(signals.length / 10, 0.3); // Up to 0.3 bonus for multiple signals
    return Math.min(avgStrength + bonusForCount, 1.0);
  }

  /**
   * Get FP (Fiber Points) decay over time
   * @param {string} lastUpdateDate - ISO date string
   * @returns {number} Decay multiplier (0-1.0)
   */
  calculateFPDecay(lastUpdateDate) {
    const lastUpdate = new Date(lastUpdateDate);
    const now = new Date();
    const daysAgo = (now - lastUpdate) / (1000 * 60 * 60 * 24);

    // Halve every ~60 days (FP decay function)
    const decayFactor = Math.pow(0.5, daysAgo / 60);
    return Math.max(decayFactor, 0.1); // Never go below 10%
  }

  /**
   * Hash wallet address to deterministic number
   * @private
   */
  _hashWallet(walletAddress) {
    let hash = 0;
    for (let i = 0; i < walletAddress.length; i++) {
      const char = walletAddress.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get example wallet for testing
   */
  static getExampleWallet() {
    return {
      address: '0x1234567890123456789012345678901234567890',
      signals: [
        'MON holder (50 MON)',
        'BONK holder (500 BONK)',
        'NFT collector (5 Pudgy Penguins)',
        'DeFi trader (monthly volume: $25k)',
        'Power user (250+ transactions)'
      ]
    };
  }
}

module.exports = new OnChainSignalDetector();
