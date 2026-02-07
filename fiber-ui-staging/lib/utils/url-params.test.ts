import { encodeEmailParam, decodeEmailParam } from "./url-params";

describe("url-params", () => {
  describe("encodeEmailParam", () => {
    it("encodes email addresses", () => {
      const email = "user@example.com";
      const encoded = encodeEmailParam(email);

      expect(encoded).toBeTruthy();
      expect(encoded).not.toBe(email);
      expect(encoded).not.toContain("@");
    });

    it("returns empty string for empty input", () => {
      expect(encodeEmailParam("")).toBe("");
    });

    it("produces different output than plain base64", () => {
      const email = "test@test.com";
      const encoded = encodeEmailParam(email);
      const plainBase64 = Buffer.from(email).toString("base64");

      expect(encoded).not.toBe(plainBase64);
    });
  });

  describe("decodeEmailParam", () => {
    it("decodes encoded email addresses", () => {
      const email = "user@example.com";
      const encoded = encodeEmailParam(email);
      const decoded = decodeEmailParam(encoded);

      expect(decoded).toBe(email);
    });

    it("returns empty string for empty input", () => {
      expect(decodeEmailParam("")).toBe("");
    });

    it("returns empty string for invalid input", () => {
      const decoded = decodeEmailParam("invalid-string-123");
      expect(decoded).toBe("");
    });

    it("handles multiple email formats", () => {
      const emails = [
        "simple@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "user_name123@test-domain.org",
      ];

      emails.forEach((email) => {
        const encoded = encodeEmailParam(email);
        const decoded = decodeEmailParam(encoded);
        expect(decoded).toBe(email);
      });
    });
  });

  describe("round-trip encoding", () => {
    it("preserves email through encode/decode cycle", () => {
      const testEmails = [
        "test@example.com",
        "john.doe@company.org",
        "user+filter@gmail.com",
        "admin@sub.domain.com",
      ];

      testEmails.forEach((email) => {
        const encoded = encodeEmailParam(email);
        const decoded = decodeEmailParam(encoded);
        expect(decoded).toBe(email);
      });
    });
  });
});
