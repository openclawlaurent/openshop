/**
 * Personalization Engine
 * 
 * Orchestrates the signal → tag → boost pipeline
 * Applies behavioral boosts to products and sorts by relevance
 */

const onChainSignals = require('./onChainSignals');
const behavioralTags = require('./behavioralTags');

class PersonalizationEngine {
  /**
   * Personalize product search results based on wallet behavior
   * @param {Array} products - Products from search (with title, price, cashback)
   * @param {string} wallet - Wallet address
   * @param {string} query - Search query (for category detection)
   * @returns {Object} Personalized results with boosts applied
   */
  async personalizeSearchResults(products, wallet, query) {
    if (!wallet || !products || products.length === 0) {
      return {
        products: products || [],
        personalization: { applied: false },
        tags: [],
        signals: []
      };
    }

    try {
      // Step 1: Detect on-chain signals
      const signalData = await onChainSignals.detectSignals(wallet);
      const signals = signalData.signals;

      // Step 2: Convert signals to behavioral tags
      const tagData = behavioralTags.generateTags(signalData);
      const tags = tagData.tags;

      // Step 3: Infer product category from query
      const productCategory = this._detectCategory(query);

      // Step 4: Apply boosts to each product
      const personalizedProducts = products.map(product => {
        const cashbackRate = parseFloat(product.cashback.rate) / 100 || 0.05; // Parse "5%" to 0.05
        const boostData = behavioralTags.calculateBoostedCashback(
          cashbackRate,
          tags,
          productCategory || 'general'
        );

        return {
          ...product,
          // Enhanced cashback with boost
          cashback: {
            ...product.cashback,
            baseRate: (cashbackRate * 100).toFixed(1) + '%',
            boostedRate: (boostData.boostedCashback * 100).toFixed(1) + '%',
            boostPercentage: (boostData.boostPercentage * 100).toFixed(1) + '%',
            baseAmount: product.cashback.amount,
            boostedAmount: (product.price * boostData.boostedCashback).toFixed(2)
          },
          personalization: {
            hasBoost: boostData.hasBenefit,
            boost: boostData.boostPercentage,
            reason: boostData.explanation,
            matchedTags: boostData.appliedTags.map(t => t.name)
          }
        };
      });

      // Step 5: Sort by: highest boost first, then by cashback amount
      const sortedProducts = personalizedProducts.sort((a, b) => {
        const boostDiff = b.personalization.boost - a.personalization.boost;
        if (boostDiff !== 0) return boostDiff;
        return parseFloat(b.cashback.boostedAmount) - parseFloat(a.cashback.boostedAmount);
      });

      // Calculate aggregate stats
      const avgBoost = personalizedProducts.length > 0
        ? (personalizedProducts.reduce((sum, p) => sum + p.personalization.boost, 0) / personalizedProducts.length * 100).toFixed(1)
        : 0;

      return {
        products: sortedProducts,
        personalization: {
          applied: true,
          avgBoost: avgBoost,
          walletType: onChainSignals.detectWalletType(signals),
          totalSignalStrength: onChainSignals.calculateSignalStrength(signals)
        },
        tags: tags,
        signals: signals,
        query: query,
        category: productCategory
      };
    } catch (err) {
      console.error('Personalization error:', err);
      // Fallback: return unpersonalized results
      return {
        products: products,
        personalization: { applied: false, error: err.message },
        tags: [],
        signals: []
      };
    }
  }

  /**
   * Detect product category from search query
   * @private
   */
  _detectCategory(query) {
    if (!query) return 'general';

    const q = query.toLowerCase();

    // Fitness & Sports
    if (['shoe', 'running', 'gym', 'workout', 'sports', 'fitness', 'athletic'].some(w => q.includes(w))) {
      return 'fitness';
    }

    // Electronics
    if (['laptop', 'phone', 'computer', 'gadget', 'tech', 'electronic'].some(w => q.includes(w))) {
      return 'electronics';
    }

    // Fashion
    if (['clothing', 'dress', 'shirt', 'pants', 'jacket', 'fashion', 'clothes'].some(w => q.includes(w))) {
      return 'fashion';
    }

    // Gaming
    if (['game', 'gaming', 'console', 'keyboard', 'mouse'].some(w => q.includes(w))) {
      return 'gaming';
    }

    // DeFi (implied if searching with token context)
    if (['defi', 'swap', 'dex', 'liquidity', 'farming', 'yield'].some(w => q.includes(w))) {
      return 'defi';
    }

    // NFTs
    if (['nft', 'art', 'collectible'].some(w => q.includes(w))) {
      return 'nfts';
    }

    // Home & Kitchen
    if (['kitchen', 'home', 'furniture', 'appliance'].some(w => q.includes(w))) {
      return 'home';
    }

    return 'general';
  }

  /**
   * Get personalization summary for UI display
   */
  getPersonalizationSummary(personalizationData) {
    const { tags, signals, personalization } = personalizationData;

    return {
      detected: {
        signalCount: signals.length,
        tagCount: tags.length,
        walletType: personalization.walletType,
        signalStrength: (personalization.totalSignalStrength * 100).toFixed(1) + '%'
      },
      boost: {
        avgBoost: personalization.avgBoost + '%',
        applied: personalization.applied,
        maxPossible: '50%'
      },
      signals: signals.map(s => ({
        type: s.type.replace(/_/g, ' '),
        strength: (s.strength * 100).toFixed(0) + '%',
        description: s.description
      })),
      tags: tags.map(t => ({
        name: t.name,
        boost: (t.boost * 100).toFixed(0) + '%',
        reason: t.reason
      }))
    };
  }

  /**
   * Test personalization with example wallet
   */
  async testWithExampleWallet() {
    const exampleProducts = [
      {
        title: 'Blue Adidas Running Shoes',
        price: 99.99,
        cashback: { rate: '5%', amount: 5 }
      },
      {
        title: 'Nike Gym Shorts',
        price: 45.00,
        cashback: { rate: '4%', amount: 1.8 }
      },
      {
        title: 'Puma Athletic Socks',
        price: 19.99,
        cashback: { rate: '3%', amount: 0.6 }
      }
    ];

    const result = await this.personalizeSearchResults(
      exampleProducts,
      '0x1234567890123456789012345678901234567890', // Example wallet
      'running shoes'
    );

    return result;
  }
}

module.exports = new PersonalizationEngine();
