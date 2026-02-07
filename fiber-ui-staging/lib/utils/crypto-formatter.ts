/**
 * Formats a crypto amount with smart decimal handling:
 * - Removes trailing zeros
 * - Shows more precision for small amounts
 * - Shows less precision for large amounts
 * - Adds thousand separators for amounts >= 1000
 *
 * Amount Range | Max Decimals | Example Input | Output
 * -------------|--------------|---------------|--------
 * < 0.01       | 6 decimals   | 0.01800       | "0.018"
 * 0.01 - 1     | 4 decimals   | 0.1234        | "0.1234"
 * 1 - 100      | 2 decimals   | 50.456789     | "50.46"
 * >= 100       | 0 decimals   | 123.456789    | "123"
 * >= 1000      | 0 decimals   | 7375.97       | "7,376"
 */
export function formatCryptoAmount(amount: number, token: string): string {
  if (amount === 0) return `0 ${token}`;

  const absAmount = Math.abs(amount);

  // Determine max decimals based on magnitude
  let maxDecimals: number;
  if (absAmount < 0.01) {
    maxDecimals = 6; // Very small amounts
  } else if (absAmount < 1) {
    maxDecimals = 4; // Small amounts (0.01 - 1)
  } else if (absAmount < 100) {
    maxDecimals = 2; // Medium amounts (1 - 100)
  } else {
    maxDecimals = 0; // Large amounts (>= 100)
  }

  // Format with max decimals, then remove trailing zeros
  const formatted = amount.toFixed(maxDecimals);
  const withoutTrailingZeros = formatted.replace(/\.?0+$/, "");

  // Add thousand separators for amounts >= 1000
  if (absAmount >= 1000) {
    const parts = withoutTrailingZeros.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${parts.join(".")} ${token}`;
  }

  return `${withoutTrailingZeros} ${token}`;
}
