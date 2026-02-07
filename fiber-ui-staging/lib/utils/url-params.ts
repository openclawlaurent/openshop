/**
 * Utilities for encoding/decoding sensitive URL parameters
 * Uses base64 encoding with simple obfuscation to mask email addresses
 */

/**
 * Encodes an email address for use in URL parameters
 * Uses base64 encoding with character rotation for obfuscation
 * @param email - The email address to encode
 * @returns Encoded string safe for URL parameters
 */
export function encodeEmailParam(email: string): string {
  if (!email) return "";

  // Convert to base64
  const base64 = Buffer.from(email).toString("base64");

  // Simple character rotation for obfuscation (rot13-like)
  const obfuscated = base64
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      // Rotate uppercase letters
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + 13) % 26) + 65);
      }
      // Rotate lowercase letters
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + 13) % 26) + 97);
      }
      // Keep numbers and special chars as-is
      return char;
    })
    .join("");

  return obfuscated;
}

/**
 * Decodes an email address from a URL parameter
 * Reverses the obfuscation and base64 encoding
 * @param encoded - The encoded parameter value
 * @returns Decoded email address or empty string if invalid
 */
export function decodeEmailParam(encoded: string): string {
  if (!encoded) return "";

  try {
    // Reverse the character rotation
    const deobfuscated = encoded
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        // Reverse rotate uppercase letters
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 - 13 + 26) % 26) + 65);
        }
        // Reverse rotate lowercase letters
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 - 13 + 26) % 26) + 97);
        }
        // Keep numbers and special chars as-is
        return char;
      })
      .join("");

    // Decode from base64
    const decoded = Buffer.from(deobfuscated, "base64").toString("utf-8");

    // Basic email validation
    if (!decoded.includes("@")) {
      console.warn("Decoded value is not a valid email");
      return "";
    }

    return decoded;
  } catch (error) {
    console.error("Failed to decode email parameter:", error);
    return "";
  }
}
