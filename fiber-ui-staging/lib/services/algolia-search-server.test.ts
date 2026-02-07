/**
 * Unit tests for server-side wild.link URL generation with Algolia v2 index schemas
 * Tests the server-side transformation function and URL generation methods
 */

import { algoliaSearchServer, transformUnifiedResultToOfferServer } from "./algolia-search-server";
import type {
  AlgoliaMerchantRecord,
  AlgoliaProductRecord,
  AlgoliaCollectionRecord,
} from "@/types/algolia";

describe("Server-side Wild.link URL Generation", () => {
  const testDeviceId = "server_device_67890";

  describe("AlgoliaSearchServer.getMerchantTrackingUrl", () => {
    test("should generate correct wild.link URL with activeDomainId", () => {
      const mockMerchant: AlgoliaMerchantRecord = {
        objectID: "server_merchant_1",
        type: "merchant",
        wildfireMerchantId: 10001,
        merchantName: "Server Electronics",
        domain: "serverelectronics.com",
        maxRateAmount: 4,
        maxRateType: "percentage",
        activeDomainId: 20001,
      };

      const url = algoliaSearchServer.getMerchantTrackingUrl(mockMerchant, testDeviceId);
      expect(url).toBe(`/r/w?c=20001&d=${testDeviceId}`);
    });

    test("should fallback to merchantId when activeDomainId is missing", () => {
      const mockMerchant: AlgoliaMerchantRecord = {
        objectID: "server_merchant_2",
        type: "merchant",
        wildfireMerchantId: 10002,
        merchantName: "Server Store",
        domain: "serverstore.com",
        maxRateAmount: 5,
        maxRateType: "percentage",
        // activeDomainId is intentionally omitted
      };

      const url = algoliaSearchServer.getMerchantTrackingUrl(mockMerchant, testDeviceId);
      expect(url).toBe(`/r/w?c=10002&d=${testDeviceId}`);
    });

    test("should return empty string when no valid tracking ID", () => {
      const mockMerchant: AlgoliaMerchantRecord = {
        objectID: "server_merchant_3",
        type: "merchant",
        wildfireMerchantId: 0, // Invalid merchant ID
        merchantName: "No ID Store",
        domain: "noid.com",
        maxRateAmount: 2,
        maxRateType: "percentage",
        // activeDomainId is omitted
      };

      const url = algoliaSearchServer.getMerchantTrackingUrl(mockMerchant, testDeviceId);
      expect(url).toBe("");
    });
  });

  describe("transformUnifiedResultToOfferServer", () => {
    describe("Merchant transformation (server-side)", () => {
      test("should transform merchant with activeDomainId correctly", () => {
        const mockMerchant: AlgoliaMerchantRecord = {
          objectID: "server_merchant_transform_1",
          type: "merchant",
          wildfireMerchantId: 30001,
          merchantName: "Server Transform Store",
          domain: "servertransform.com",
          maxRateAmount: 6,
          maxRateType: "percentage",
          logoUrl: "https://example.com/server-logo.png",
          activeDomainId: 40001,
          allRates: [
            {
              name: "6% Default Rate",
              rate: "PERCENTAGE",
              amount: 6,
              type: "percentage",
              currency: "USD",
            },
          ],
        };

        const result = transformUnifiedResultToOfferServer(mockMerchant);

        expect(result.id).toBe("server_merchant_transform_1");
        expect(result.title).toBe("Server Transform Store");
        expect(result.image).toBe("https://example.com/server-logo.png");
        expect(result.trackingId).toBe(40001);
        expect(result.href).toBeUndefined(); // Server doesn't generate href
        expect(result.type).toBe("merchant");
        expect(result.rewardLabel).toBe("Up to 5.4% back"); // 6% advertised = 5.4% after platform fee
      });

      test("should handle PERCENTAGE rate format on server", () => {
        const mockMerchant: AlgoliaMerchantRecord = {
          objectID: "server_merchant_percentage",
          type: "merchant",
          wildfireMerchantId: 30002,
          merchantName: "Percentage Store",
          domain: "percentage.com",
          maxRateAmount: 7.5,
          maxRateType: "percentage",
          activeDomainId: 40002,
        };

        const result = transformUnifiedResultToOfferServer(mockMerchant);
        expect(result.rewardLabel).toBe("Up to 6.75% back"); // 7.5% × 0.9 = 6.75
      });

      test("should handle FLAT rate format on server", () => {
        const mockMerchant: AlgoliaMerchantRecord = {
          objectID: "server_merchant_flat",
          type: "merchant",
          wildfireMerchantId: 30003,
          merchantName: "Flat Rate Store",
          domain: "flatrate.com",
          maxRateAmount: 15,
          maxRateType: "fixed",
          activeDomainId: 40003,
        };

        const result = transformUnifiedResultToOfferServer(mockMerchant);
        expect(result.rewardLabel).toBe("Up to $13.50 back"); // $15 × 0.9 = $13.50 after platform fee
      });

      test("should clean rate names correctly", () => {
        const mockMerchant: AlgoliaMerchantRecord = {
          objectID: "server_merchant_clean_rates",
          type: "merchant",
          wildfireMerchantId: 30004,
          merchantName: "Clean Rates Store",
          domain: "cleanrates.com",
          maxRateAmount: 5,
          maxRateType: "percentage",
          activeDomainId: 40004,
          allRates: [
            {
              name: "5% Premium Members",
              rate: "PERCENTAGE",
              amount: 5,
              type: "percentage",
              currency: "USD",
            },
            {
              name: "$10 New Customers",
              rate: "FLAT",
              amount: 10,
              type: "flat",
              currency: "USD",
            },
          ],
        };

        const result = transformUnifiedResultToOfferServer(mockMerchant);

        expect(result.allRates).toHaveLength(2);
        // Rates are sorted by amount descending since kind is lowercase and doesn't match "PERCENTAGE"
        expect(result.allRates?.[0].name).toBe("$10 New Customers");
        expect(result.allRates?.[1].name).toBe("Premium Members"); // "5% " is removed
      });
    });

    describe("Product transformation (server-side)", () => {
      test("should transform product correctly on server", () => {
        const mockProduct: AlgoliaProductRecord = {
          objectID: "server_product_1",
          type: "product",
          productId: "PROD-SERVER-1",
          productTitle: "Server Product Title",
          merchantId: 50001,
          wildfireMerchantId: 50001,
          merchantName: "Server Product Store",
          price: 199.99,
          inStock: true,
          maxRateAmount: 4,
          maxRateType: "percentage",
        };

        const result = transformUnifiedResultToOfferServer(mockProduct);

        expect(result.id).toBe("server_product_1");
        expect(result.title).toBe("Server Product Title"); // Server uses actual productTitle
        expect(result.rewardLabel).toBe("Up to 3.6% back"); // 4% advertised = 3.6% after platform fee
        expect(result.href).toBeUndefined();
        expect(result.trackingId).toBe(50001);
        expect(result.type).toBe("product");
      });
    });

    describe("Collection transformation (server-side)", () => {
      test("should transform collection correctly on server", () => {
        const mockCollection: AlgoliaCollectionRecord = {
          objectID: "server_collection_1",
          type: "collection",
          collectionId: 789,
          collectionName: "Server Collection",
          collectionSlug: "server-collection",
          productCount: 250,
        };

        const result = transformUnifiedResultToOfferServer(mockCollection);

        expect(result.id).toBe("server_collection_1");
        expect(result.title).toBe("Server Collection"); // Server uses actual collectionName
        expect(result.rewardLabel).toBe("250 products");
        expect(result.href).toBeUndefined();
        expect(result.trackingId).toBe(789);
        expect(result.type).toBe("collection");
      });
    });

    describe("Edge cases (server-side)", () => {
      test("should handle merchant without activeDomainId or merchantId", () => {
        const mockMerchant: AlgoliaMerchantRecord = {
          objectID: "server_merchant_no_ids",
          type: "merchant",
          wildfireMerchantId: 0,
          merchantName: "No IDs Store",
          domain: "noids.com",
          maxRateAmount: 1,
          maxRateType: "percentage",
        };

        const result = transformUnifiedResultToOfferServer(mockMerchant);

        expect(result.trackingId).toBe(0);
        expect(result.href).toBeUndefined();
      });

      test("should handle unknown record type on server", () => {
        const unknownRecord = {
          objectID: "unknown_server_record",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: "unknown" as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        const result = transformUnifiedResultToOfferServer(unknownRecord);

        expect(result.title).toBe("unknown_server_record");
        expect(result.rewardLabel).toBe("No reward info");
        expect(result.trackingId).toBeUndefined();
        expect(result.type).toBe("unknown");
      });
    });
  });

  describe("Server-side URL format consistency", () => {
    test("should generate consistent URL formats across different merchants", () => {
      const testMerchants = [
        { merchantId: 1, wildfireMerchantId: 1, activeDomainId: 100, deviceId: "dev1" },
        {
          merchantId: 999999,
          wildfireMerchantId: 999999,
          activeDomainId: 888888,
          deviceId: "device_test_123",
        },
        {
          merchantId: 12345,
          wildfireMerchantId: 12345,
          activeDomainId: undefined,
          deviceId: "test-device-456",
        },
      ];

      testMerchants.forEach(({ merchantId, activeDomainId, deviceId }) => {
        const mockMerchant: AlgoliaMerchantRecord = {
          objectID: `merchant_${merchantId}`,
          type: "merchant",
          wildfireMerchantId: merchantId,
          merchantName: `Test Merchant ${merchantId}`,
          domain: `test${merchantId}.com`,
          maxRateAmount: 3,
          maxRateType: "percentage",
          activeDomainId,
        };

        const url = algoliaSearchServer.getMerchantTrackingUrl(mockMerchant, deviceId);
        const expectedTrackingId = activeDomainId || merchantId;
        const expectedUrl = `/r/w?c=${expectedTrackingId}&d=${deviceId}`;

        expect(url).toBe(expectedUrl);

        // Verify URL pattern (updated for /r/w proxy URLs)
        const urlPattern = /^\/r\/w\?c=\d+&d=[\w\-_]+$/;
        expect(url).toMatch(urlPattern);
      });
    });
  });
});
