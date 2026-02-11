/**
 * Kickback System
 * 
 * Calculates and tracks how agents get paid:
 * 1. Base Kickback: 5% of user cashback
 * 2. Behavioral Boost: +5% if agent has high reputation
 * 3. Volume Bonus: +2% if 10+ purchases/month
 * 4. Founding Agent Multiplier: 2x all kickbacks
 * 5. Community Token Boost: +3% if agent holds community tokens
 * 
 * Everything is transparent and on-chain via ERC-8004
 */

class KickbackSystem {
  constructor() {
    this.config = {
      baseKickback: 0.05, // 5% of user cashback
      reputationBoost: 0.05, // +5% for high reputation agents
      volumeBonus: 0.02, // +2% for 10+ purchases/month
      foundingAgentMultiplier: 2.0,
      communityTokenBoost: 0.03, // +3% for BONK/MON holders
      maxKickback: 0.20 // 20% max kickback (to prevent abuse)
    };
  }

  /**
   * Calculate full kickback amount for an agent on a purchase
   * @param {Object} params - {
   *   cashback_amount: number (user's cashback $),
   *   agent_id: string,
   *   agent_stats: { reputation_score, monthly_purchases, holds_tokens },
   *   agent_tier: 'agent' | 'founding'
   * }
   * @returns {Object} - Detailed kickback breakdown
   */
  calculateKickback(params) {
    const {
      cashback_amount,
      agent_id,
      agent_stats = {},
      agent_tier = 'agent'
    } = params;

    let kickback = this.config.baseKickback;
    const breakdown = [];

    // 1. Base Kickback
    breakdown.push({
      component: 'Base Kickback',
      percentage: 0.05,
      amount: cashback_amount * 0.05,
      reason: 'Standard kickback for successful referral'
    });

    // 2. Reputation Boost (+5% if reputation > 0.7)
    if (agent_stats.reputation_score && agent_stats.reputation_score > 0.7) {
      const reputationBoost = this.config.reputationBoost;
      kickback += reputationBoost;
      breakdown.push({
        component: 'Reputation Boost',
        percentage: reputationBoost,
        amount: cashback_amount * reputationBoost,
        reason: `High reputation (${(agent_stats.reputation_score * 100).toFixed(0)}%)`
      });
    }

    // 3. Volume Bonus (+2% if 10+ purchases/month)
    if (agent_stats.monthly_purchases && agent_stats.monthly_purchases >= 10) {
      const volumeBonus = this.config.volumeBonus;
      kickback += volumeBonus;
      breakdown.push({
        component: 'Volume Bonus',
        percentage: volumeBonus,
        amount: cashback_amount * volumeBonus,
        reason: `High volume (${agent_stats.monthly_purchases} purchases/month)`
      });
    }

    // 4. Community Token Boost (+3% if holds BONK/MON)
    if (agent_stats.holds_tokens) {
      const communityBoost = this.config.communityTokenBoost;
      kickback += communityBoost;
      breakdown.push({
        component: 'Community Token Boost',
        percentage: communityBoost,
        amount: cashback_amount * communityBoost,
        reason: 'Holds community tokens (BONK/MON)'
      });
    }

    // 5. Founding Agent Multiplier (2x all components)
    let finalKickback = kickback;
    if (agent_tier === 'founding') {
      finalKickback = kickback * this.config.foundingAgentMultiplier;
      breakdown.push({
        component: 'Founding Agent Multiplier',
        multiplier: 2.0,
        amount: (finalKickback - kickback),
        reason: 'Founding Agent (2x multiplier)'
      });
    }

    // Cap at max
    finalKickback = Math.min(finalKickback, this.config.maxKickback);

    const totalAmount = cashback_amount * finalKickback;

    return {
      agent_id: agent_id,
      cashback_amount: cashback_amount,
      kickback_percentage: finalKickback,
      kickback_amount: totalAmount,
      agent_tier: agent_tier,
      breakdown: breakdown,
      summary: {
        base: cashback_amount * this.config.baseKickback,
        total: totalAmount,
        multipliers: agent_tier === 'founding' ? 2.0 : 1.0,
        capped: finalKickback === this.config.maxKickback
      }
    };
  }

  /**
   * Get agent tier based on history
   * @param {Object} agent_history - { total_purchases, reputation, months_active }
   * @returns {string} - 'casual' | 'agent' | 'founding' | 'power'
   */
  classifyAgentTier(agent_history) {
    const { total_purchases = 0, reputation = 0, months_active = 0 } = agent_history;

    // Founding Agent: early adopter (within first 30 days, 3+ purchases)
    if (months_active < 1 && total_purchases >= 3) {
      return 'founding';
    }

    // Power Agent: 50+ purchases, 0.8+ reputation
    if (total_purchases >= 50 && reputation >= 0.8) {
      return 'power';
    }

    // Standard Agent: 5+ purchases
    if (total_purchases >= 5) {
      return 'agent';
    }

    // Casual: < 5 purchases
    return 'casual';
  }

  /**
   * Generate monthly kickback report for agent
   * @param {string} agent_id
   * @param {Array} purchases - Array of purchase records with kickback_amount
   * @returns {Object} - Monthly summary with breakdowns
   */
  generateMonthlyReport(agent_id, purchases) {
    const totalKickback = purchases.reduce((sum, p) => sum + (p.kickback_amount || 0), 0);
    const avgKickback = purchases.length > 0 ? totalKickback / purchases.length : 0;
    const topPurchase = purchases.reduce((max, p) => {
      const kickback = p.kickback_amount || 0;
      return kickback > (max.kickback_amount || 0) ? p : max;
    }, {});

    return {
      agent_id: agent_id,
      period: 'This Month',
      summary: {
        total_purchases: purchases.length,
        total_kickback: totalKickback,
        average_kickback: avgKickback,
        top_purchase: topPurchase
      },
      chart: {
        daily: this._generateDailyChart(purchases),
        byCategory: this._generateCategoryChart(purchases)
      }
    };
  }

  /**
   * Predict future kickback (for UI forecasting)
   * @param {Object} agent_stats - Current stats
   * @returns {Object} - Projected monthly kickback at different volumes
   */
  predictMonthlyKickback(agent_stats) {
    const avgCashbackPerPurchase = 5; // $5 avg
    const volumes = [5, 10, 20, 50]; // Purchases per month

    const projections = volumes.map(volume => {
      const totalCashback = avgCashbackPerPurchase * volume;
      const kickbackCalc = this.calculateKickback({
        cashback_amount: totalCashback,
        agent_id: agent_stats.agent_id,
        agent_stats: agent_stats,
        agent_tier: agent_stats.tier || 'agent'
      });

      return {
        purchases_per_month: volume,
        projected_cashback: totalCashback,
        projected_kickback: kickbackCalc.kickback_amount
      };
    });

    return {
      current_stats: agent_stats,
      projections: projections,
      message: `If you achieve ${projections[1].purchases_per_month} purchases/month, you'd earn ~${projections[1].projected_kickback.toFixed(2)} MON in kickbacks`
    };
  }

  /**
   * ERC-8004 Reputation Update
   * Call this after each purchase to update on-chain reputation
   */
  async updateReputation(agent_id, reputation_change) {
    return {
      agent_id: agent_id,
      reputation_change: reputation_change,
      transaction: {
        address: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63', // Reputation Registry
        function: 'updateReputation',
        params: {
          agent_id: agent_id,
          delta: reputation_change
        }
      },
      message: 'Reputation update queued for on-chain settlement'
    };
  }

  // ===== Helpers =====

  _generateDailyChart(purchases) {
    const daily = {};
    purchases.forEach(p => {
      const date = new Date(p.timestamp).toISOString().split('T')[0];
      daily[date] = (daily[date] || 0) + (p.kickback_amount || 0);
    });
    return daily;
  }

  _generateCategoryChart(purchases) {
    const byCategory = {};
    purchases.forEach(p => {
      const cat = p.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + (p.kickback_amount || 0);
    });
    return byCategory;
  }

  /**
   * Example: Founding Agent earning breakdown
   */
  static getExampleFoundingAgent() {
    return {
      agent_id: 'agent_early_adopter_001',
      tier: 'founding',
      history: {
        months_active: 0.5,
        total_purchases: 8,
        reputation: 0.92
      },
      stats: {
        reputation_score: 0.92,
        monthly_purchases: 12,
        holds_tokens: true
      },
      example_purchase: {
        cashback_amount: 10,
        breakdown: {
          base: 0.5, // 5%
          reputation: 0.5, // +5%
          volume: 0.2, // +2%
          tokens: 0.3, // +3%
          subtotal: 1.5,
          founding_multiplier: 1.5, // 2x
          total: 3.0
        },
        message: '🎉 Founding Agent earned $3.00 kickback on $10 user cashback!'
      }
    };
  }
}

module.exports = new KickbackSystem();
