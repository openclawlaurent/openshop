/**
 * Behavioral Tags Service
 * 
 * Converts on-chain signals into behavioral tags
 * Tags determine which product categories get cashback boosts
 * 
 * Example:
 * - Signal: DEFI_TRADER with high volume
 * - Tag: "defi_active" (strength 0.8)
 * - Boost: 25% extra cashback on DeFi products
 */

class BehavioralTagsEngine {
  constructor() {
    // Define all behavioral tags with their boost percentages
    this.tags = {
      // Fitness & Sports
      fitness_enthusiast: {
        name: 'Fitness Enthusiast',
        boost: 0.40, // 40% cashback boost
        category: 'fitness',
        signalRequirements: ['power_user', 'frequent_activity'],
        description: 'Active in fitness/sports products'
      },
      gym_member: {
        name: 'Gym Member',
        boost: 0.30,
        category: 'fitness',
        signalRequirements: ['frequent_activity'],
        description: 'Likely gym/fitness equipment buyer'
      },

      // Crypto & DeFi
      defi_active: {
        name: 'DeFi Active',
        boost: 0.35,
        category: 'defi',
        signalRequirements: ['DEFI_TRADER', 'LP_PROVIDER'],
        description: 'Active in DeFi, trades frequently'
      },
      defi_investor: {
        name: 'DeFi Investor',
        boost: 0.25,
        category: 'defi',
        signalRequirements: ['STAKER'],
        description: 'Long-term DeFi investor, yield farming'
      },
      bonk_holder: {
        name: 'BONK Holder',
        boost: 0.50, // Max boost for community token
        category: 'bonk',
        signalRequirements: ['BONK_HOLDER'],
        description: 'Holds BONK tokens, part of community'
      },
      mon_believer: {
        name: 'MON Believer',
        boost: 0.40,
        category: 'monad',
        signalRequirements: ['MON_HOLDER'],
        description: 'MON token holder, bullish on Monad'
      },
      pengu_collector: {
        name: 'Pengu Collector',
        boost: 0.35,
        category: 'nfts',
        signalRequirements: ['PENGU_HOLDER'],
        description: 'Owns Pudgy Penguins NFTs'
      },

      // Shopping & Lifestyle
      retail_power_buyer: {
        name: 'Retail Power Buyer',
        boost: 0.30,
        category: 'shopping',
        signalRequirements: ['POWER_USER', 'frequent_activity'],
        description: 'High-frequency retail shopper'
      },
      electronics_lover: {
        name: 'Electronics Lover',
        boost: 0.35,
        category: 'electronics',
        signalRequirements: ['tech_interest'],
        description: 'Interested in tech and gadgets'
      },
      fashionista: {
        name: 'Fashionista',
        boost: 0.25,
        category: 'fashion',
        signalRequirements: ['retail_activity'],
        description: 'Active in fashion purchases'
      },

      // Gaming & NFTs
      gamer: {
        name: 'Gamer',
        boost: 0.30,
        category: 'gaming',
        signalRequirements: ['gaming_interest'],
        description: 'Gaming hardware and NFT games'
      },
      nft_collector: {
        name: 'NFT Collector',
        boost: 0.35,
        category: 'nfts',
        signalRequirements: ['NFT_COLLECTOR'],
        description: 'Actively collects NFTs'
      },

      // Financial
      investor: {
        name: 'Investor',
        boost: 0.25,
        category: 'investments',
        signalRequirements: ['STAKER', 'LP_PROVIDER'],
        description: 'Active investor in protocols'
      },
      hodler: {
        name: 'Hodler',
        boost: 0.20,
        category: 'crypto',
        signalRequirements: ['MON_HOLDER'],
        description: 'Long-term token holder'
      },

      // Loyalty & Activity
      power_user: {
        name: 'Power User',
        boost: 0.20,
        category: 'general',
        signalRequirements: ['POWER_USER'],
        description: 'Highly active wallet, 100+ transactions'
      },
      loyal_customer: {
        name: 'Loyal Customer',
        boost: 0.15,
        category: 'general',
        signalRequirements: ['repeat_activity'],
        description: 'Consistent buyer over time'
      }
    };
  }

  /**
   * Convert signals to behavioral tags
   * @param {Object} signalData - Output from onChainSignals.detectSignals()
   * @returns {Object} Tags with scores and boost percentages
   */
  generateTags(signalData) {
    const { signals, wallet } = signalData;
    const appliedTags = [];

    if (!signals || signals.length === 0) {
      return {
        tags: [],
        totalBoost: 0,
        primaryTag: null,
        description: 'No behavioral data'
      };
    }

    // Map signals to tags
    const signalTypes = signals.map(s => s.type);
    const signalStrengths = {};
    signals.forEach(s => {
      signalStrengths[s.type] = s.strength;
    });

    // Rule 1: DeFi Trader → defi_active tag
    if (signalTypes.includes('defi_trader') && signalStrengths['defi_trader'] > 0.5) {
      appliedTags.push({
        tag: 'defi_active',
        name: this.tags.defi_active.name,
        strength: signalStrengths['defi_trader'],
        boost: this.tags.defi_active.boost,
        reason: 'Active DeFi trading detected'
      });
    }

    // Rule 2: BONK Holder → bonk_holder tag
    if (signalTypes.includes('bonk_holder') && signalStrengths['bonk_holder'] > 0.2) {
      appliedTags.push({
        tag: 'bonk_holder',
        name: this.tags.bonk_holder.name,
        strength: signalStrengths['bonk_holder'],
        boost: this.tags.bonk_holder.boost,
        reason: 'BONK token holder detected'
      });
    }

    // Rule 3: MON Holder → mon_believer tag
    if (signalTypes.includes('mon_holder') && signalStrengths['mon_holder'] > 0.3) {
      appliedTags.push({
        tag: 'mon_believer',
        name: this.tags.mon_believer.name,
        strength: signalStrengths['mon_holder'],
        boost: this.tags.mon_believer.boost,
        reason: 'MON token holder detected'
      });
    }

    // Rule 4: Pengu NFT → pengu_collector tag
    if (signalTypes.includes('pengu_holder') && signalStrengths['pengu_holder'] > 0.5) {
      appliedTags.push({
        tag: 'pengu_collector',
        name: this.tags.pengu_collector.name,
        strength: signalStrengths['pengu_holder'],
        boost: this.tags.pengu_collector.boost,
        reason: 'Pudgy Penguin NFT holder detected'
      });
    }

    // Rule 5: NFT Collector → nft_collector tag
    if (signalTypes.includes('nft_collector') && signalStrengths['nft_collector'] > 0.5) {
      appliedTags.push({
        tag: 'nft_collector',
        name: this.tags.nft_collector.name,
        strength: signalStrengths['nft_collector'],
        boost: this.tags.nft_collector.boost,
        reason: 'Active NFT collector'
      });
    }

    // Rule 6: Staker → investor tag
    if (signalTypes.includes('staker') && signalStrengths['staker'] > 0.3) {
      appliedTags.push({
        tag: 'investor',
        name: this.tags.investor.name,
        strength: signalStrengths['staker'],
        boost: this.tags.investor.boost,
        reason: 'Yield farming / staking activity detected'
      });
    }

    // Rule 7: Power User → power_user tag
    if (signalTypes.includes('power_user') && signalStrengths['power_user'] > 0.5) {
      appliedTags.push({
        tag: 'power_user',
        name: this.tags.power_user.name,
        strength: signalStrengths['power_user'],
        boost: this.tags.power_user.boost,
        reason: 'High transaction volume detected'
      });
    }

    // Rule 8: LP Provider → defi_active tag
    if (signalTypes.includes('lp_provider') && signalStrengths['lp_provider'] > 0.4) {
      appliedTags.push({
        tag: 'defi_active',
        name: this.tags.defi_active.name,
        strength: signalStrengths['lp_provider'],
        boost: this.tags.defi_active.boost,
        reason: 'Liquidity provider activity detected'
      });
    }

    // Sort by boost amount (highest first)
    appliedTags.sort((a, b) => b.boost - a.boost);

    // Calculate combined boost
    const totalBoost = this._calculateCombinedBoost(appliedTags);
    const primaryTag = appliedTags.length > 0 ? appliedTags[0] : null;

    return {
      tags: appliedTags,
      totalBoost: totalBoost,
      primaryTag: primaryTag,
      description: appliedTags.length > 0
        ? `${appliedTags.length} behavioral tags detected: ${appliedTags.map(t => t.name).join(', ')}`
        : 'No specific behavioral tags matched',
      wallet: wallet
    };
  }

  /**
   * Apply behavioral boost to cashback rate
   * @param {number} baseCashback - Base cashback percentage (e.g., 0.05 for 5%)
   * @param {Array} tags - Array of applied tags
   * @param {string} productCategory - Product category (e.g., 'fitness', 'defi')
   * @returns {Object} Boosted cashback info
   */
  calculateBoostedCashback(baseCashback, tags, productCategory) {
    let boost = 0;
    let appliedTags = [];

    // Only apply boosts for matching category tags
    tags.forEach(tag => {
      if (this.tags[tag.tag] && 
          (this.tags[tag.tag].category === productCategory || 
           this.tags[tag.tag].category === 'general')) {
        boost += tag.boost * tag.strength; // Weight by signal strength
        appliedTags.push({
          name: tag.name,
          boost: tag.boost,
          contribution: (tag.boost * tag.strength).toFixed(3)
        });
      }
    });

    // Cap max boost at 0.50 (50%)
    boost = Math.min(boost, 0.50);

    const boostedCashback = baseCashback * (1 + boost);

    return {
      baseCashback: baseCashback,
      boostPercentage: boost,
      boostedCashback: boostedCashback,
      appliedTags: appliedTags,
      hasBenefit: boost > 0,
      explanation: appliedTags.length > 0
        ? `${(boost * 100).toFixed(1)}% boost from: ${appliedTags.map(t => t.name).join(', ')}`
        : 'No behavioral boost applied'
    };
  }

  /**
   * Calculate combined boost from multiple tags
   * @private
   */
  _calculateCombinedBoost(tags) {
    if (tags.length === 0) return 0;
    
    // Combine boosts, with diminishing returns (not simply additive)
    // Formula: boost1 + boost2*(1-boost1) + boost3*(1-boost1)*(1-boost2)...
    let combined = 0;
    let diminishingFactor = 1;

    tags.forEach(tag => {
      const contribution = tag.boost * tag.strength * diminishingFactor;
      combined += contribution;
      diminishingFactor *= (1 - tag.boost);
    });

    return Math.min(combined, 0.50); // Cap at 50%
  }

  /**
   * Get tag info
   */
  getTagInfo(tagName) {
    return this.tags[tagName] || null;
  }

  /**
   * List all available tags
   */
  getAllTags() {
    return Object.entries(this.tags).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }
}

module.exports = new BehavioralTagsEngine();
