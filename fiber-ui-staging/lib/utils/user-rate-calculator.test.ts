/**
 * @jest-environment node
 */

import {
  calculateUserRateDetails,
  calculateFlatRateDetails,
  calculateRateSplit,
  formatBreakdownMessage,
} from "./user-rate-calculator";
import { BoostTier } from "@/lib/tiers/data-access";
import { Offer } from "@/app/api/offers/route";

// Mock boost tier with default split (45% payout, 45% platform, 10% fee)
const mockBoostTierDefault: BoostTier = {
  id: "tier_1",
  name: "Default Tier",
  description: "Default boost tier",
  platform_token_boost_multiplier: 1.0,
  payout_token_boost_multiplier: 1.0,
  payout_token_split_percentage: 0.45,
  platform_token_split_percentage: 0.45,
  platform_fee_split_percentage: 0.1,
  minimum_platform_token_staked_amount: 0,
  minimum_monthly_average_purchases_amount: 0,
  is_active: true,
};

// Mock boost tier with higher payout split (50% payout, 40% platform, 10% fee)
const mockBoostTierHighPayout: BoostTier = {
  ...mockBoostTierDefault,
  id: "tier_2",
  name: "High Payout Tier",
  payout_token_split_percentage: 0.5,
  platform_token_split_percentage: 0.4,
  platform_fee_split_percentage: 0.1,
};

// Mock boost tier with 2x multipliers (45% payout, 45% platform, 10% fee, 2x boost)
const mockBoostTier2xBoost: BoostTier = {
  ...mockBoostTierDefault,
  id: "tier_3",
  name: "2x Boost Tier",
  platform_token_boost_multiplier: 2.0,
  payout_token_boost_multiplier: 2.0,
  payout_token_split_percentage: 0.45,
  platform_token_split_percentage: 0.45,
  platform_fee_split_percentage: 0.1,
};

// Mock offer with user-facing rate
// Calculates advertised rate as: userRate * 1.1 (approximately)
const mockOfferWithRate = (numericAmount: number): Offer => {
  // Calculate advertised amount: if user gets numericAmount after 10% fee,
  // advertised was approximately numericAmount * 1.1
  const advertisedAmount = Math.round(numericAmount * 1.1 * 10) / 10;

  return {
    id: "offer_1",
    title: "Test Offer",
    merchantName: "Test Merchant",
    rewardLabel: `Up to ${numericAmount}% back`,
    allRates: [
      {
        kind: "PERCENTAGE",
        name: "All purchases",
        amount: numericAmount.toString(),
        numeric_amount: numericAmount,
        advertised_amount: advertisedAmount,
      },
    ],
  };
};

// Mock offer with flat rate
const mockOfferWithFlatRate = (advertisedAmount: number): Offer => {
  return {
    id: "offer_flat",
    title: "Flat Rate Offer",
    merchantName: "Test Merchant",
    rewardLabel: `Up to $${advertisedAmount} back`,
    allRates: [
      {
        kind: "FLAT",
        name: "All purchases",
        amount: (advertisedAmount * 0.9).toFixed(2),
        numeric_amount: advertisedAmount * 0.9,
        advertised_amount: advertisedAmount,
      },
    ],
  };
};

// Mock offer without percentage rates
const mockOfferWithoutPercentageRate: Offer = {
  id: "offer_2",
  title: "Flat Rate Offer",
  merchantName: "Test Merchant",
  rewardLabel: "Up to $5 back",
  allRates: [
    {
      kind: "FLAT",
      name: "All purchases",
      amount: "5",
      numeric_amount: 5,
    },
  ],
};

// Mock offer with no rates
const mockOfferWithoutRates: Offer = {
  id: "offer_3",
  title: "No Rate Offer",
  merchantName: "Test Merchant",
  rewardLabel: "View details",
};

describe("calculateUserRateDetails", () => {
  it("should calculate rate details correctly with 2x boost (19.5% advertised)", () => {
    // Create an offer with exactly 19.5% advertised rate
    const offer: Offer = {
      id: "offer_boost_test",
      title: "2x Boost Test Offer",
      merchantName: "Test Merchant",
      rewardLabel: "Up to 19.5% back",
      allRates: [
        {
          kind: "PERCENTAGE",
          name: "All purchases",
          amount: "19.5",
          numeric_amount: 19.5,
          advertised_amount: 19.5,
        },
      ],
    };

    const result = calculateUserRateDetails(offer, "$SOL", mockBoostTier2xBoost);

    expect(result).toBeDefined();
    expect(result?.partnerTokenLabel).toBe("$SOL");

    // advertisedRate = 19.5%
    expect(result?.userPercentage).toBe(17.55); // 19.5 - (19.5 * 0.1) = 17.55
    expect(result?.partnerTokenPercentage).toBe(8.775); // 19.5 * 0.45 = 8.775
    expect(result?.platformTokenPercentage).toBe(8.775); // 19.5 * 0.45 = 8.775
    expect(result?.partnerTokenBoostedPercentage).toBe(17.55); // 19.5 * 0.45 * 2.0 = 17.55
    expect(result?.platformTokenBoostedPercentage).toBe(17.55); // 19.5 * 0.45 * 2.0 = 17.55

    // Verify splits add up to userPercentage
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      17.55,
    );

    // Verify boosted values equal userPercentage with 2x boost
    expect(result?.partnerTokenBoostedPercentage).toBe(result?.userPercentage);
    expect(result?.platformTokenBoostedPercentage).toBe(result?.userPercentage);
  });

  it("should calculate rate details correctly for default boost tier (45/45/10 split)", () => {
    const offer = mockOfferWithRate(2.6);
    const result = calculateUserRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.partnerTokenLabel).toBe("BONK");
    expect(result?.userPercentage).toBe(2.61); // 2.9 (advertised) - (2.9 * 0.1) = 2.61
    expect(result?.partnerTokenPercentage).toBe(1.305); // 2.9 (advertised) * 0.45 = 1.305
    expect(result?.platformTokenPercentage).toBe(1.305); // 2.9 (advertised) * 0.45 = 1.305
    expect(result?.partnerTokenBoostedPercentage).toBe(1.305); // 2.9 * 0.45 * 1.0 = 1.305
    expect(result?.platformTokenBoostedPercentage).toBe(1.305); // 2.9 * 0.45 * 1.0 = 1.305
    expect(result?.breakdownMessage).toBe("BONK 1.305% and FP 1.305%");
    // Verify splits add up to user percentage
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      2.61,
    );
  });

  it("should calculate rate details correctly for high payout boost tier (50/40/10 split)", () => {
    const offer = mockOfferWithRate(2.6);
    const result = calculateUserRateDetails(offer, "USDC", mockBoostTierHighPayout);

    expect(result).toBeDefined();
    expect(result?.partnerTokenLabel).toBe("USDC");
    expect(result?.userPercentage).toBe(2.61); // 2.9 (advertised) - (2.9 * 0.1) = 2.61
    expect(result?.partnerTokenPercentage).toBe(1.45); // 2.9 (advertised) * 0.50 = 1.45
    expect(result?.platformTokenPercentage).toBe(1.16); // 2.9 (advertised) * 0.40 = 1.16
    expect(result?.partnerTokenBoostedPercentage).toBe(1.45); // 2.9 * 0.50 * 1.0 = 1.45
    expect(result?.platformTokenBoostedPercentage).toBe(1.16); // 2.9 * 0.40 * 1.0 = 1.16
    expect(result?.breakdownMessage).toBe("USDC 1.45% and FP 1.16%");
    // Verify splits add up to user percentage
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      2.61,
    );
  });

  it("should handle different partner token labels", () => {
    const offer = mockOfferWithRate(2.6);
    const resultBONK = calculateUserRateDetails(offer, "BONK", mockBoostTierDefault);
    const resultUSDC = calculateUserRateDetails(offer, "USDC", mockBoostTierDefault);

    expect(resultBONK?.partnerTokenLabel).toBe("BONK");
    expect(resultBONK?.breakdownMessage).toBe("BONK 1.305% and FP 1.305%");

    expect(resultUSDC?.partnerTokenLabel).toBe("USDC");
    expect(resultUSDC?.breakdownMessage).toBe("USDC 1.305% and FP 1.305%");
  });

  it("should return undefined for offers without percentage rates", () => {
    const result = calculateUserRateDetails(
      mockOfferWithoutPercentageRate,
      "BONK",
      mockBoostTierDefault,
    );

    expect(result).toBeUndefined();
  });

  it("should return undefined for offers with no rates", () => {
    const result = calculateUserRateDetails(mockOfferWithoutRates, "BONK", mockBoostTierDefault);

    expect(result).toBeUndefined();
  });

  it("should handle small percentages correctly", () => {
    const offer = mockOfferWithRate(0.5);
    const result = calculateUserRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.userPercentage).toBe(0.54); // 0.6 (advertised) - (0.6 * 0.1) = 0.54
    expect(result?.partnerTokenPercentage).toBe(0.27); // 0.6 (advertised) * 0.45 = 0.27
    expect(result?.platformTokenPercentage).toBe(0.27); // 0.6 (advertised) * 0.45 = 0.27
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      0.54,
    );
  });

  it("should handle large percentages correctly", () => {
    const offer = mockOfferWithRate(10.0);
    const result = calculateUserRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.userPercentage).toBe(9.9); // 11.0 (advertised) - (11.0 * 0.1) = 9.9
    expect(result?.partnerTokenPercentage).toBe(4.95); // 11.0 (advertised) * 0.45 = 4.95
    expect(result?.platformTokenPercentage).toBe(4.95); // 11.0 (advertised) * 0.45 = 4.95
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      9.9,
    );
  });

  it("should floor correctly to nearest thousandth", () => {
    const offer = mockOfferWithRate(2.7);
    const result = calculateUserRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.partnerTokenPercentage).toBe(1.35); // 3.0 (advertised) * 0.45 = 1.35
    expect(result?.platformTokenPercentage).toBe(1.35); // 3.0 (advertised) * 0.45 = 1.35
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      2.7,
    );
  });
});

describe("calculateRateSplit", () => {
  it("should calculate split correctly with default percentages (45/45/10)", () => {
    const result = calculateRateSplit(2.6, 0.45, 0.45, 0.1);

    expect(result.partnerTokenAmount).toBe(1.2); // 2.6 * 0.45 = 1.17, rounded to 1.2
    expect(result.platformAmount).toBe(1.2); // 2.6 * 0.45 = 1.17, rounded to 1.2
    expect(result.platformFeeAmount).toBe(0.3); // 2.6 * 0.10 = 0.26, rounded to 0.3
  });

  it("should calculate split correctly with high payout percentages (50/40/10)", () => {
    const result = calculateRateSplit(2.6, 0.5, 0.4, 0.1);

    expect(result.partnerTokenAmount).toBe(1.3); // 2.6 * 0.50 = 1.3
    expect(result.platformAmount).toBe(1.0); // 2.6 * 0.40 = 1.04, rounded to 1.0
    expect(result.platformFeeAmount).toBe(0.3); // 2.6 * 0.10 = 0.26, rounded to 0.3
  });

  it("should handle zero split percentages", () => {
    const result = calculateRateSplit(2.6, 0, 0, 1.0);

    expect(result.partnerTokenAmount).toBe(0);
    expect(result.platformAmount).toBe(0);
    expect(result.platformFeeAmount).toBe(2.6); // 2.6 * 1.0 = 2.6
  });

  it("should handle equal three-way split (33/33/33)", () => {
    const result = calculateRateSplit(3.0, 0.33, 0.33, 0.34);

    expect(result.partnerTokenAmount).toBe(1.0); // 3.0 * 0.33 = 0.99, rounded to 1.0
    expect(result.platformAmount).toBe(1.0); // 3.0 * 0.33 = 0.99, rounded to 1.0
    expect(result.platformFeeAmount).toBe(1.0); // 3.0 * 0.34 = 1.02, rounded to 1.0
  });

  it("should round correctly with edge cases", () => {
    const result = calculateRateSplit(2.9, 0.45, 0.45, 0.1);

    expect(result.partnerTokenAmount).toBe(1.3); // 2.9 * 0.45 = 1.305, rounded to 1.3
    expect(result.platformAmount).toBe(1.3); // 2.9 * 0.45 = 1.305, rounded to 1.3
    expect(result.platformFeeAmount).toBe(0.3); // 2.9 * 0.10 = 0.29, rounded to 0.3
  });

  it("should verify splits add up correctly (accounting for rounding)", () => {
    const userPercentage = 2.6;
    const result = calculateRateSplit(userPercentage, 0.45, 0.45, 0.1);

    // Due to rounding, sum might not be exactly equal, but should be close
    const sum = result.partnerTokenAmount + result.platformAmount + result.platformFeeAmount;
    expect(sum).toBeCloseTo(userPercentage, 0); // Within 0.5%
  });
});

describe("formatBreakdownMessage", () => {
  it("should format breakdown message correctly", () => {
    const message = formatBreakdownMessage("BONK", 1.2, 1.2);
    expect(message).toBe("BONK 1.2% and FP 1.2%");
  });

  it("should handle different token labels", () => {
    const messageBONK = formatBreakdownMessage("BONK", 1.3, 1.0);
    const messageUSDC = formatBreakdownMessage("USDC", 1.3, 1.0);

    expect(messageBONK).toBe("BONK 1.3% and FP 1.0%");
    expect(messageUSDC).toBe("USDC 1.3% and FP 1.0%");
  });

  it("should format small percentages with one decimal", () => {
    const message = formatBreakdownMessage("BONK", 0.2, 0.2);
    expect(message).toBe("BONK 0.2% and FP 0.2%");
  });

  it("should format large percentages with one decimal", () => {
    const message = formatBreakdownMessage("BONK", 4.5, 4.5);
    expect(message).toBe("BONK 4.5% and FP 4.5%");
  });

  it("should always show one decimal place even for whole numbers", () => {
    const message = formatBreakdownMessage("BONK", 1.0, 2.0);
    expect(message).toBe("BONK 1.0% and FP 2.0%");
  });
});

describe("Integration: Real-world scenarios", () => {
  it("should handle typical 2.9% offer with BONK token", () => {
    // 2.9% advertised -> 2.61% after platform fee
    const offer = mockOfferWithRate(2.6);
    const result = calculateUserRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.breakdownMessage).toBe("BONK 1.305% and FP 1.305%");
    expect(result?.userPercentage).toBe(2.61);
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      2.61,
    );
  });

  it("should handle typical 5% offer with USDC token", () => {
    // 5% advertised -> 4.5% after platform fee
    const offer = mockOfferWithRate(4.5);
    const result = calculateUserRateDetails(offer, "USDC", mockBoostTierDefault);

    expect(result).toBeDefined();
    // advertised = 4.5 * 1.1 = 4.95 ≈ 5.0, user = 5.0 - (5.0 * 0.1) = 4.5
    expect(result?.userPercentage).toBe(4.5);
    expect(result?.partnerTokenPercentage).toBe(2.25); // 5.0 (advertised) * 0.45 = 2.25
    expect(result?.platformTokenPercentage).toBe(2.25); // 5.0 (advertised) * 0.45 = 2.25
    expect(result?.breakdownMessage).toBe("USDC 2.25% and FP 2.25%");
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      4.5,
    );
  });

  it("should handle edge case of 0.1% minimum rate", () => {
    const offer = mockOfferWithRate(0.1);
    const result = calculateUserRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    // advertised = 0.1 * 1.1 = 0.11 ≈ 0.1, user = 0.1 - (0.1 * 0.1) = 0.09
    expect(result?.userPercentage).toBe(0.09);
    expect(result?.partnerTokenPercentage).toBe(0.045); // 0.1 (advertised) * 0.45 = 0.045
    expect(result?.platformTokenPercentage).toBe(0.045); // 0.1 (advertised) * 0.45 = 0.045
    expect((result?.partnerTokenPercentage ?? 0) + (result?.platformTokenPercentage ?? 0)).toBe(
      0.09,
    );
  });
});

describe("calculateFlatRateDetails", () => {
  it("should calculate flat rate details correctly for $325 advertised", () => {
    const offer = mockOfferWithFlatRate(325);
    const result = calculateFlatRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.rateType).toBe("FLAT");
    expect(result?.userAmount).toBe(292.5); // $325 × 0.9 (user-facing amount)
    expect(result?.partnerTokenAmount).toBe(146.25); // $325 × 0.45 (from advertised amount)
    expect(result?.platformTokenAmount).toBe(146.25); // $325 × 0.45
    expect(result?.partnerTokenLabel).toBe("BONK");
    expect(result?.breakdownMessage).toBe("BONK $146.25 and FP $146.25");

    // Percentage fields should be 0 for flat rates
    expect(result?.partnerTokenPercentage).toBe(0);
    expect(result?.platformTokenPercentage).toBe(0);
    expect(result?.userPercentage).toBe(0);
  });

  it("should apply 2x boost multiplier correctly for flat rates", () => {
    const offer = mockOfferWithFlatRate(325);
    const result = calculateFlatRateDetails(offer, "BONK", mockBoostTier2xBoost);

    expect(result).toBeDefined();
    expect(result?.rateType).toBe("FLAT");
    expect(result?.userAmount).toBe(292.5); // $325 × 0.9
    expect(result?.partnerTokenAmount).toBe(146.25); // $325 × 0.45 (from advertised amount)
    expect(result?.platformTokenAmount).toBe(146.25);

    // Boosted amounts with 2x multiplier
    // $325 × 0.45 × 2.0 = $292.50
    expect(result?.partnerTokenBoostedAmount).toBe(292.5);
    expect(result?.platformTokenBoostedAmount).toBe(292.5);
    expect(result?.partnerTokenBoostMultiplier).toBe(2.0);
    expect(result?.platformTokenBoostMultiplier).toBe(2.0);
  });

  it("should calculate flat rate details correctly for $100 advertised", () => {
    const offer = mockOfferWithFlatRate(100);
    const result = calculateFlatRateDetails(offer, "USDC", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.rateType).toBe("FLAT");
    expect(result?.userAmount).toBe(90); // $100 × 0.9
    expect(result?.partnerTokenAmount).toBe(45); // $100 × 0.45 (from advertised)
    expect(result?.platformTokenAmount).toBe(45);
    expect(result?.partnerTokenLabel).toBe("USDC");
  });

  it("should calculate flat rate details correctly for $50 advertised with high payout tier", () => {
    const offer = mockOfferWithFlatRate(50);
    const result = calculateFlatRateDetails(offer, "BONK", mockBoostTierHighPayout);

    expect(result).toBeDefined();
    expect(result?.rateType).toBe("FLAT");
    expect(result?.userAmount).toBe(45); // $50 × 0.9
    expect(result?.partnerTokenAmount).toBe(25); // $50 × 0.50 (from advertised)
    expect(result?.platformTokenAmount).toBe(20); // $50 × 0.40
    expect(result?.breakdownMessage).toBe("BONK $25.00 and FP $20.00");
  });

  it("should return undefined for offers without flat rates", () => {
    const offer = mockOfferWithRate(5.0); // Percentage offer
    const result = calculateFlatRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeUndefined();
  });

  it("should return undefined for offers without advertised_amount", () => {
    const offer = mockOfferWithoutPercentageRate; // Has flat rate but no advertised_amount
    const result = calculateFlatRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeUndefined();
  });

  it("should round down to cents correctly", () => {
    // Test case where splits result in fractions of cents
    const offer = mockOfferWithFlatRate(333.33);
    const result = calculateFlatRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.userAmount).toBe(299.99); // $333.33 × 0.9 = 299.997 → 299.99
    expect(result?.partnerTokenAmount).toBe(149.99); // $333.33 × 0.45 = 149.9985 → 149.99
    expect(result?.platformTokenAmount).toBe(149.99);
  });

  it("should handle small flat amounts correctly", () => {
    const offer = mockOfferWithFlatRate(5);
    const result = calculateFlatRateDetails(offer, "BONK", mockBoostTierDefault);

    expect(result).toBeDefined();
    expect(result?.userAmount).toBe(4.5); // $5 × 0.9
    expect(result?.partnerTokenAmount).toBe(2.25); // $5 × 0.45 (from advertised)
    expect(result?.platformTokenAmount).toBe(2.25);
  });
});
