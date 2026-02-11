/**
 * Query Staking System
 * 
 * Economics layer for FiberAgent:
 * - Agents stake MON before searching
 * - If search leads to purchase: stake returned + kickback (5-10%)
 * - If no purchase: stake stays in reserve pool (future use)
 * 
 * Aligns incentives: Agents are confident they'll find good deals
 * 
 * PERSISTENCE: Now uses SQLite database (agent_stakes, agent_balances tables)
 */

const crypto = require('crypto');

class QueryStakingSystem {
  constructor(db = null) {
    this.db = db; // Database connection (optional for backward compatibility)
    this.stakingConfig = {
      minStakePerQuery: 0.1, // 0.1 MON minimum
      maxStakePerQuery: 100, // 100 MON maximum
      kickbackPercentage: {
        base: 0.05, // 5% of cashback
        foundingAgent: 0.10 // 10% for Founding Agents
      },
      stakeReserveAddress: '0xstake_reserve_pool',
      unstakeLockupDays: 7 // Unstake after 7 days if no purchase
    };

    this.stakes = {}; // Fallback in-memory stake tracking
  }

  // Set database connection (called after DB is initialized)
  setDatabase(db) {
    this.db = db;
  }

  /**
   * Agent stakes MON before searching
   * @param {Object} params - { agent_id, amount, query, product_id_intent }
   * @returns {Object} - Stake receipt with ID and expiry
   */
  async createStake(params) {
    const { agent_id, amount, query, product_id_intent, memo } = params;

    // Validate
    if (!agent_id || !amount || amount < this.stakingConfig.minStakePerQuery) {
      return {
        success: false,
        error: `Minimum stake: ${this.stakingConfig.minStakePerQuery} MON`
      };
    }

    if (amount > this.stakingConfig.maxStakePerQuery) {
      return {
        success: false,
        error: `Maximum stake: ${this.stakingConfig.maxStakePerQuery} MON`
      };
    }

    // Check for duplicate stake on same query
    if (this.db) {
      return new Promise((resolve) => {
        this.db.get(
          'SELECT stake_id FROM agent_stakes WHERE agent_id = ? AND query = ? AND status = ?',
          [agent_id, query, 'active'],
          (err, row) => {
            if (err) {
              resolve({
                success: false,
                error: `Database error: ${err.message}`
              });
              return;
            }
            if (row) {
              resolve({
                success: false,
                error: 'Active stake already exists for this query. Update or refund first.'
              });
              return;
            }

            // Create new stake
            const stakeId = `stake_${crypto.randomBytes(16).toString('hex')}`;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + this.stakingConfig.unstakeLockupDays);

            this.db.run(
              `INSERT INTO agent_stakes 
               (stake_id, agent_id, query, amount_staked, product_id_intent, status, created_at, expires_at, memo)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [stakeId, agent_id, query, amount, product_id_intent, 'active', new Date().toISOString(), expiryDate.toISOString(), memo || null],
              (err) => {
                if (err) {
                  resolve({
                    success: false,
                    error: `Failed to create stake: ${err.message}`
                  });
                  return;
                }

                resolve({
                  success: true,
                  stake: {
                    stake_id: stakeId,
                    agent_id: agent_id,
                    amount_staked: amount,
                    query: query,
                    product_id_intent: product_id_intent,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    expires_at: expiryDate.toISOString(),
                    kickback_multiplier: 1.0
                  },
                  message: `Staked ${amount} MON on "${query}". If purchase happens, you'll get stake back + ${(this.stakingConfig.kickbackPercentage.base * 100).toFixed(0)}% kickback.`
                });
              }
            );
          }
        );
      });
    } else {
      // Fallback to in-memory (backward compatibility)
      const stakeId = `stake_${agent_id}_${Date.now()}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.stakingConfig.unstakeLockupDays);

      const stake = {
        id: stakeId,
        agent_id: agent_id,
        amount: amount,
        query: query,
        product_id_intent: product_id_intent,
        status: 'active',
        created_at: new Date(),
        expires_at: expiryDate,
        purchase_id: null,
        kickback_amount: null,
        transaction_hash: `0xmock${stakeId.substring(0, 30)}`
      };

      this.stakes[stakeId] = stake;

      return {
        success: true,
        stake: stake,
        message: `Staked ${amount} MON. If purchase happens, you'll get stake back + ${(this.stakingConfig.kickbackPercentage.base * 100).toFixed(0)}% kickback.`
      };
    }
  }

  /**
   * Process purchase tied to a stake
   * @param {Object} params - { stake_id, purchase_amount, cashback_amount, agent_tier }
   * @returns {Object} - Stake resolution with kickback
   */
  async processPurchaseWithStake(params) {
    const { stake_id, purchase_amount, cashback_amount, agent_tier = 'agent' } = params;

    const stake = this.stakes[stake_id];
    if (!stake) {
      return {
        success: false,
        error: 'Stake not found'
      };
    }

    if (stake.status !== 'active') {
      return {
        success: false,
        error: `Stake already ${stake.status}`
      };
    }

    // Calculate kickback
    const kickbackPercentage = agent_tier === 'founding' 
      ? this.stakingConfig.kickbackPercentage.foundingAgent
      : this.stakingConfig.kickbackPercentage.base;

    const kickbackAmount = cashback_amount * kickbackPercentage;

    // Return stake + add kickback
    const totalReturn = stake.amount + kickbackAmount;

    stake.status = 'purchased';
    stake.purchase_amount = purchase_amount;
    stake.cashback_amount = cashback_amount;
    stake.kickback_percentage = kickbackPercentage;
    stake.kickback_amount = kickbackAmount;
    stake.total_return = totalReturn;
    stake.purchase_timestamp = new Date();

    return {
      success: true,
      stake: stake,
      settlement: {
        stakeReturned: stake.amount,
        kickbackAmount: kickbackAmount,
        totalAmount: totalReturn,
        currency: 'MON',
        message: `Purchase confirmed! Stake ${stake.amount} MON returned + ${kickbackAmount.toFixed(6)} MON kickback.`
      }
    };
  }

  /**
   * Refund stake if no purchase within lockup period
   * @param {string} stake_id
   * @returns {Object} - Refund result
   */
  async refundStake(stake_id) {
    const stake = this.stakes[stake_id];
    if (!stake) {
      return {
        success: false,
        error: 'Stake not found'
      };
    }

    if (stake.status !== 'active') {
      return {
        success: false,
        error: `Stake already ${stake.status}`
      };
    }

    const now = new Date();
    if (now < stake.expires_at) {
      return {
        success: false,
        error: `Lockup period active until ${stake.expires_at.toISOString()}. Cannot refund yet.`
      };
    }

    stake.status = 'refunded';
    stake.refunded_at = new Date();

    return {
      success: true,
      stake: stake,
      message: `Stake of ${stake.amount} MON refunded to wallet.`
    };
  }

  /**
   * Get agent's current stakes
   * @param {string} agent_id
   * @returns {Object} - Active, purchased, and refunded stakes
   */
  async getAgentStakes(agent_id) {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.all(
          'SELECT * FROM agent_stakes WHERE agent_id = ? ORDER BY created_at DESC',
          [agent_id],
          (err, stakes) => {
            if (err) {
              resolve({
                agent_id: agent_id,
                error: err.message,
                stakes: { active: [], purchased: [], refunded: [] }
              });
              return;
            }

            const active = stakes.filter(s => s.status === 'active');
            const purchased = stakes.filter(s => s.status === 'claimed' || s.status === 'purchased');
            const refunded = stakes.filter(s => s.status === 'refunded' || s.status === 'withdrawn');

            resolve({
              agent_id: agent_id,
              total_staked: active.reduce((sum, s) => sum + s.amount_staked, 0),
              total_purchased: purchased.length,
              total_kickback: purchased.reduce((sum, s) => sum + (s.claimed_earnings || 0), 0),
              stakes: {
                active: active,
                purchased: purchased,
                refunded: refunded
              }
            });
          }
        );
      });
    } else {
      // Fallback to in-memory
      const agentStakes = Object.values(this.stakes).filter(s => s.agent_id === agent_id);
      return {
        agent_id: agent_id,
        total_staked: agentStakes
          .filter(s => s.status === 'active')
          .reduce((sum, s) => sum + s.amount, 0),
        total_purchased: agentStakes
          .filter(s => s.status === 'purchased')
          .length,
        total_kickback: agentStakes
          .filter(s => s.status === 'purchased')
          .reduce((sum, s) => sum + (s.kickback_amount || 0), 0),
        stakes: {
          active: agentStakes.filter(s => s.status === 'active'),
          purchased: agentStakes.filter(s => s.status === 'purchased'),
          refunded: agentStakes.filter(s => s.status === 'refunded')
        }
      };
    }
  }

  /**
   * Get staking statistics
   * @returns {Object} - Network-wide staking metrics
   */
  async getStakingStats() {
    if (this.db) {
      return new Promise((resolve) => {
        // Get active stakes
        this.db.all('SELECT * FROM agent_stakes WHERE status = ?', ['active'], (err, activeStakes) => {
          if (err) {
            resolve({
              error: err.message,
              total_stakes: 0,
              active_stakes: 0
            });
            return;
          }

          // Get purchased stakes
          this.db.all('SELECT * FROM agent_stakes WHERE status IN (?, ?)', ['claimed', 'purchased'], (err, purchasedStakes) => {
            if (err) purchasedStakes = [];

            const totalAmount = activeStakes.reduce((sum, s) => sum + s.amount_staked, 0);
            const totalKickback = purchasedStakes.reduce((sum, s) => sum + (s.claimed_earnings || 0), 0);
            const allStakes = (activeStakes || []).concat(purchasedStakes || []);

            resolve({
              total_stakes: allStakes.length,
              active_stakes: (activeStakes || []).length,
              purchased_stakes: (purchasedStakes || []).length,
              total_amount_staked: totalAmount,
              total_kickback_distributed: totalKickback,
              purchase_conversion_rate: allStakes.length > 0 ? (purchasedStakes || []).length / allStakes.length : 0,
              average_stake_amount: activeStakes.length > 0 ? totalAmount / activeStakes.length : 0,
              average_kickback: purchasedStakes.length > 0 ? totalKickback / purchasedStakes.length : 0
            });
          });
        });
      });
    } else {
      // Fallback to in-memory
      const allStakes = Object.values(this.stakes);
      const activeStakes = allStakes.filter(s => s.status === 'active');
      const purchasedStakes = allStakes.filter(s => s.status === 'purchased');

      return {
        total_stakes: allStakes.length,
        active_stakes: activeStakes.length,
        purchased_stakes: purchasedStakes.length,
        total_amount_staked: activeStakes.reduce((sum, s) => sum + s.amount, 0),
        total_kickback_distributed: purchasedStakes.reduce((sum, s) => sum + (s.kickback_amount || 0), 0),
        purchase_conversion_rate: purchasedStakes.length / Math.max(allStakes.length, 1),
        average_stake_amount: activeStakes.length > 0
          ? activeStakes.reduce((sum, s) => sum + s.amount, 0) / activeStakes.length
          : 0,
        average_kickback: purchasedStakes.length > 0
          ? purchasedStakes.reduce((sum, s) => sum + (s.kickback_amount || 0), 0) / purchasedStakes.length
          : 0
      };
    }
  }

  /**
   * Identify Founding Agents (early stakers)
   * Founding Agents get 2x kickback (10% instead of 5%)
   */
  promoteFoundingAgents() {
    const agentStakeCounts = {};
    Object.values(this.stakes).forEach(stake => {
      agentStakeCounts[stake.agent_id] = (agentStakeCounts[stake.agent_id] || 0) + 1;
    });

    // Founding Agents: first 10 agents with 3+ stakes
    const foundingAgents = Object.entries(agentStakeCounts)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([agent_id, _]) => agent_id);

    return {
      foundingAgents: foundingAgents,
      count: foundingAgents.length,
      benefits: [
        '2x kickback (10% vs 5%)',
        'Early reputation boost',
        'Potential revenue share (future)'
      ]
    };
  }

  /**
   * Propose query (stake intention before searching)
   * Helps Fiber plan inventory + gauge demand
   */
  proposeQuery(params) {
    const { agent_id, query, estimated_budget } = params;

    return {
      proposal_id: `proposal_${Date.now()}`,
      agent_id: agent_id,
      query: query,
      estimated_budget: estimated_budget,
      status: 'proposed',
      created_at: new Date(),
      message: `Query proposed: "${query}" with budget $${estimated_budget}. Refine your stake based on search results.`
    };
  }
}

module.exports = new QueryStakingSystem();
