/**
 * @jest-environment node
 */

import {
  buildRewardLabel,
  transformMerchantRecord,
  transformProductRecord,
  transformCollectionRecord,
  transformUnifiedResultToLegacyOffer,
} from "./search-result-mapper";
import {
  AlgoliaMerchantRecord,
  AlgoliaProductRecord,
  AlgoliaCollectionRecord,
  AlgoliaUnifiedRecord,
} from "@/types/algolia";

describe("Search Result Mapper", () => {
  describe("buildRewardLabel", () => {
    it("should build percentage reward label correctly", () => {
      // 2.5% advertised = 2.25% after platform fee: floor((2.5 × 0.9) * 100) / 100 = 2.25
      expect(buildRewardLabel("PERCENTAGE", 2.5)).toBe("Up to 2.25% back");
      // 10% advertised = 9% after platform fee: floor((10 × 0.9) * 100) / 100 = 9
      expect(buildRewardLabel("PERCENTAGE", 10)).toBe("Up to 9% back");
      expect(buildRewardLabel("PERCENTAGE", 0)).toBe("Up to 0% back");
    });

    it("should build flat reward label correctly", () => {
      // $5 advertised = $4.50 after platform fee: floor((5 × 0.9) * 100) / 100 = 4.50
      expect(buildRewardLabel("FLAT", 5.0)).toBe("Up to $4.50 back");
      // $2.50 advertised = $2.25 after platform fee
      expect(buildRewardLabel("FLAT", 2.5)).toBe("Up to $2.25 back");
      // $10 advertised = $9.00 after platform fee
      expect(buildRewardLabel("FLAT", 10)).toBe("Up to $9.00 back");
    });

    it("should handle unknown rate types", () => {
      // Unknown types default to percentage calculation
      // 5% advertised = 4.5% after platform fee: floor((5 × 0.9) * 100) / 100 = 4.5
      expect(buildRewardLabel("UNKNOWN", 5)).toBe("Up to 4.5% back");
      // 2.5% advertised = 2.25% after platform fee
      expect(buildRewardLabel("CUSTOM", 2.5)).toBe("Up to 2.25% back");
    });

    it("should return fallback for missing or undefined values", () => {
      expect(buildRewardLabel(undefined, 5)).toBe("View details");
      expect(buildRewardLabel("PERCENTAGE", undefined)).toBe("View details");
      expect(buildRewardLabel(undefined, undefined)).toBe("View details");
      expect(buildRewardLabel("", 5)).toBe("View details");
    });

    it("should use custom fallback", () => {
      expect(buildRewardLabel(undefined, 5, "No reward")).toBe("No reward");
      expect(buildRewardLabel("PERCENTAGE", undefined, "Check details")).toBe("Check details");
    });
  });

  describe("transformMerchantRecord", () => {
    const baseMerchant: AlgoliaMerchantRecord = {
      type: "merchant",
      objectID: "merchant_123",
      merchantName: "Test Merchant",
      wildfireMerchantId: 123,
      domain: "testmerchant.com",
      logoUrl: "https://example.com/logo.png",
      maxRateAmount: 5.0,
      maxRateType: "percentage",
      activeDomainId: 456,
      allRates: [
        {
          name: "5% Online Purchase",
          kind: "PERCENTAGE",
          amount: 5.0,
          type: "percentage",
          currency: "USD",
        },
      ],
    };

    it("should transform merchant record correctly", () => {
      const result = transformMerchantRecord(baseMerchant);

      expect(result).toEqual({
        id: "merchant_123",
        image: "https://example.com/logo.png",
        title: "Test Merchant",
        merchantName: "Test Merchant",
        rewardLabel: "Up to 4.5% back", // 5% advertised = 4.5% after platform fee
        href: undefined, // No wildfire device ID provided
        trackingId: 456, // Uses wildfireMerchantId
        queryID: undefined,
        allRates: [
          {
            name: "Online Purchase", // Cleaned up name
            kind: "PERCENTAGE",
            amount: "4.5", // User-facing rate after platform fee deduction
            numeric_amount: 4.5,
            advertised_amount: 5, // Original advertised amount
          },
        ],
        type: "merchant",
        merchantUrl: undefined,
        description: undefined,
      });
    });

    it("should generate affiliate link when wildfireDeviceId is provided", () => {
      const result = transformMerchantRecord(baseMerchant, "device123");

      expect(result.href).toBe("/r/w?c=456&d=device123");
    });

    it("should use wildfireMerchantId for tracking", () => {
      const merchantWithoutActiveDomain = {
        ...baseMerchant,
        activeDomainId: undefined,
      };
      const result = transformMerchantRecord(merchantWithoutActiveDomain, "device123");

      expect(result.trackingId).toBe(123);
      expect(result.href).toBe("/r/w?c=123&d=device123");
    });

    it("should handle missing maxRate gracefully", () => {
      const merchantWithoutRate: AlgoliaMerchantRecord = {
        ...baseMerchant,
        maxRateAmount: 0,
        maxRateType: "",
      };
      const result = transformMerchantRecord(merchantWithoutRate);

      // 0% is still a valid rate, shows "Up to 0% back" (trailing zeros removed)
      expect(result.rewardLabel).toBe("Up to 0% back");
    });

    it("should include URL parameter when merchantUrl is available", () => {
      const merchantWithUrl = {
        ...baseMerchant,
        merchantUrl: "https://example.com/store",
      };
      const result = transformMerchantRecord(merchantWithUrl, "device123");

      expect(result.href).toBe("/r/w?c=456&d=device123&url=https%3A%2F%2Fexample.com%2Fstore");
    });

    it("should not include URL parameter when merchantUrl is missing", () => {
      const result = transformMerchantRecord(baseMerchant, "device123");

      expect(result.href).toBe("/r/w?c=456&d=device123");
    });
  });

  describe("transformProductRecord", () => {
    const baseProduct: AlgoliaProductRecord = {
      type: "product",
      objectID: "product_456",
      productTitle: "Test Product",
      merchantId: 789,
      wildfireMerchantId: 789,
      merchantName: "Test Merchant",
      imageUrl: "https://example.com/product.png",
      maxRateAmount: 2.6,
      maxRateType: "percentage",
      sourceUrl: "https://merchant.com/products/test-product",
      productId: "prod_123",
    };

    it("should transform product record correctly", () => {
      const result = transformProductRecord(baseProduct);

      expect(result).toEqual({
        id: "product_456",
        image: "https://example.com/product.png",
        title: "Test Product",
        merchantName: "Test Merchant",
        rewardLabel: "Up to 2.34% back", // 2.6% advertised = 2.34% after platform fee
        href: undefined, // No wildfire device ID provided
        trackingId: 789,
        queryID: undefined,
        allRates: undefined, // Products may not have detailed rates
        type: "product",
        sourceUrl: "https://merchant.com/products/test-product",
        price: undefined,
        priceFormatted: undefined,
        color: undefined,
        size: undefined,
        brand: undefined,
        rating: undefined,
        reviewCount: undefined,
        description: undefined,
      });
    });

    it("should generate affiliate link with URL parameter when wildfireDeviceId is provided", () => {
      const result = transformProductRecord(baseProduct, "device123");

      const expectedUrl = encodeURIComponent("https://merchant.com/products/test-product");
      expect(result.href).toBe(`/r/w?c=789&d=device123&url=${expectedUrl}`);
    });

    it("should not include URL parameter when sourceUrl is missing", () => {
      const productWithoutSourceUrl = {
        ...baseProduct,
        sourceUrl: undefined,
      };
      const result = transformProductRecord(productWithoutSourceUrl, "device123");

      expect(result.href).toBe("/r/w?c=789&d=device123");
    });

    it("should not include URL parameter when sourceUrl is missing", () => {
      const productWithoutSourceUrl = {
        ...baseProduct,
        sourceUrl: undefined,
        productId: undefined,
      };
      const result = transformProductRecord(productWithoutSourceUrl, "device123");

      expect(result.href).toBe("/r/w?c=789&d=device123");
    });

    it("should handle FLAT rate correctly", () => {
      const productWithFlatRate = {
        ...baseProduct,
        maxRateAmount: 10.0,
        maxRateType: "fixed" as const,
      };
      const result = transformProductRecord(productWithFlatRate);

      // $10 advertised = $9.00 after 10% platform fee (10 × 0.9 = 9)
      expect(result.rewardLabel).toBe("Up to $9.00 back");
    });

    it("should handle missing maxRate gracefully", () => {
      const productWithoutRate: AlgoliaProductRecord = {
        ...baseProduct,
        maxRateAmount: 0,
        maxRateType: "",
      };
      const result = transformProductRecord(productWithoutRate);

      // 0% is still a valid rate, shows "Up to 0% back" (trailing zeros removed)
      expect(result.rewardLabel).toBe("Up to 0% back");
    });
  });

  describe("transformCollectionRecord", () => {
    const baseCollection: AlgoliaCollectionRecord = {
      type: "collection",
      objectID: "collection_789",
      collectionName: "Test Collection",
      collectionId: 999,
      collectionSlug: "test-collection",
      imageUrl: "https://example.com/collection.png",
      productCount: 25,
      sourceUrl: "https://merchant.com/collections/test-collection",
    };

    it("should transform collection record correctly", () => {
      const result = transformCollectionRecord(baseCollection);

      expect(result).toEqual({
        id: "collection_789",
        image: "https://example.com/collection.png",
        title: "Test Collection",
        rewardLabel: "25 products",
        href: undefined, // No wildfire device ID provided
        trackingId: 999,
        allRates: [], // Collections don't have rates
        type: "collection",
        sourceUrl: "https://merchant.com/collections/test-collection",
      });
    });

    it("should generate affiliate link with URL parameter when wildfireDeviceId is provided", () => {
      const result = transformCollectionRecord(baseCollection, "device123");

      const expectedUrl = encodeURIComponent("https://merchant.com/collections/test-collection");
      expect(result.href).toBe(`/r/w?c=999&d=device123&url=${expectedUrl}`);
    });

    it("should not include URL parameter when sourceUrl is missing", () => {
      const collectionWithoutSourceUrl = {
        ...baseCollection,
        sourceUrl: undefined,
      };
      const result = transformCollectionRecord(collectionWithoutSourceUrl, "device123");

      expect(result.href).toBe("/r/w?c=999&d=device123");
    });

    it("should handle missing productCount gracefully", () => {
      const collectionWithoutCount = {
        ...baseCollection,
        productCount: undefined,
      };
      const result = transformCollectionRecord(collectionWithoutCount);

      expect(result.rewardLabel).toBe("0 products");
    });
  });

  describe("transformUnifiedResultToLegacyOffer", () => {
    it("should route merchant records correctly", () => {
      const merchant: AlgoliaMerchantRecord = {
        type: "merchant",
        objectID: "merchant_123",
        merchantName: "Test Merchant",
        wildfireMerchantId: 123,
        domain: "testmerchant.com",
        maxRateAmount: 5.0,
        maxRateType: "percentage",
      };

      const result = transformUnifiedResultToLegacyOffer(merchant);
      expect(result.type).toBe("merchant");
      expect(result.title).toBe("Test Merchant");
      expect(result.rewardLabel).toBe("Up to 4.5% back"); // 5% advertised = 4.5% after platform fee
    });

    it("should route product records correctly", () => {
      const product: AlgoliaProductRecord = {
        type: "product",
        objectID: "product_456",
        productTitle: "Test Product",
        merchantId: 789,
        wildfireMerchantId: 789,
        merchantName: "Test Merchant",
        maxRateAmount: 2.6,
        maxRateType: "percentage",
      };

      const result = transformUnifiedResultToLegacyOffer(product);
      expect(result.type).toBe("product");
      expect(result.title).toBe("Test Product");
      expect(result.rewardLabel).toBe("Up to 2.34% back"); // 2.6% advertised = 2.34% after platform fee
    });

    it("should route collection records correctly", () => {
      const collection: AlgoliaCollectionRecord = {
        type: "collection",
        objectID: "collection_789",
        collectionName: "Test Collection",
        collectionId: 999,
        collectionSlug: "test-collection",
        productCount: 15,
      };

      const result = transformUnifiedResultToLegacyOffer(collection);
      expect(result.type).toBe("collection");
      expect(result.title).toBe("Test Collection");
      expect(result.rewardLabel).toBe("15 products");
    });

    it("should handle unknown record types gracefully", () => {
      const unknown = {
        type: "unknown" as const,
        objectID: "unknown_123",
      } as unknown as AlgoliaUnifiedRecord;

      const result = transformUnifiedResultToLegacyOffer(unknown);
      expect(result).toEqual({
        id: "unknown_123",
        title: "unknown_123",
        rewardLabel: "No reward info",
        type: "unknown",
      });
    });

    it("should handle records without objectID", () => {
      const malformed = {
        type: "unknown" as const,
      } as unknown as AlgoliaUnifiedRecord;

      const result = transformUnifiedResultToLegacyOffer(malformed);
      expect(result).toEqual({
        id: "unknown",
        title: "Unknown",
        rewardLabel: "No reward info",
        type: "unknown",
      });
    });
  });

  describe("Edge Cases and Data Integrity", () => {
    it("should handle the exact case that was causing undefined issues", () => {
      // This is the exact data structure from the logs that was causing problems
      const problematicProduct: AlgoliaProductRecord = {
        type: "product",
        objectID: "product_aHR0cHM6Ly93_1758906890329",
        merchantId: 7810,
        wildfireMerchantId: 7810,
        merchantName: "Allbirds",
        productTitle: "Men's Wool Cruiser Slip On",
        maxRateAmount: 2.6,
        maxRateType: "percentage",
        imageUrl:
          "https://www.allbirds.com/cdn/shop/files/A11636_25Q3_Wool-Cruiser-Slip-On-Dark-Grey-Light-Grey-Sole_PDP_LEFT__1.png?v=1754513141&width=1024",
        sourceUrl: "https://www.allbirds.com/products/mens-wool-cruiser-slip-on",
        // Note: This record has maxRate and maxRateType but NOT priceFormatted or cashbackRate
        // The old server code was incorrectly trying to access those non-existent fields
      };

      const result = transformUnifiedResultToLegacyOffer(problematicProduct);

      // Should now correctly generate the reward label instead of "undefined • undefined back"
      expect(result.rewardLabel).toBe("Up to 2.34% back"); // 2.6% advertised = 2.34% after platform fee
      expect(result.title).toBe("Men's Wool Cruiser Slip On");
      expect(result.trackingId).toBe(7810);
    });

    it("should be consistent between client and server transformations", () => {
      const testRecord: AlgoliaProductRecord = {
        type: "product",
        objectID: "test_product",
        productTitle: "Consistency Test Product",
        merchantId: 100,
        wildfireMerchantId: 100,
        merchantName: "Test Merchant",
        maxRateAmount: 7.5,
        maxRateType: "fixed",
      };

      const result = transformUnifiedResultToLegacyOffer(testRecord);

      // This should produce the same result whether called from client or server
      expect(result).toEqual({
        id: "test_product",
        image: undefined,
        title: "Consistency Test Product",
        merchantName: "Test Merchant",
        merchantLogoUrl: undefined,
        rewardLabel: "Up to $6.75 back", // $7.50 × 0.9 = $6.75 after platform fee
        href: undefined,
        trackingId: 100,
        queryID: undefined,
        allRates: undefined,
        type: "product",
        sourceUrl: undefined,
        price: undefined,
        priceFormatted: undefined,
        color: undefined,
        size: undefined,
        brand: undefined,
        rating: undefined,
        reviewCount: undefined,
        description: undefined,
      });
    });
  });
});
