/**
 * Tier color scheme type
 */
export type TierColorScheme = {
  bg: string;
  text: string;
  border: string;
};

/**
 * Get color scheme for a tier based on its name
 * Maps tier names (bronze, silver, gold, etc.) to their respective color schemes
 */
export function getTierColor(tierName: string): TierColorScheme {
  const lowerName = tierName.toLowerCase();

  // Starter tier
  if (lowerName.includes("starter") || lowerName.includes("start")) {
    return {
      bg: "bg-green-500/10",
      text: "text-green-700 dark:text-green-400",
      border: "border-l-green-500",
    };
  }

  // Alpha tier
  if (lowerName.includes("alpha")) {
    return {
      bg: "bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-l-purple-500",
    };
  }

  // Bronze tier
  if (lowerName.includes("bronze") || lowerName.includes("bronce")) {
    return {
      bg: "bg-orange-900/10",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-l-orange-500",
    };
  }

  // Silver tier
  if (lowerName.includes("silver") || lowerName.includes("plata")) {
    return {
      bg: "bg-gray-400/10",
      text: "text-gray-600 dark:text-gray-300",
      border: "border-l-gray-400",
    };
  }

  // Gold tier
  if (lowerName.includes("gold") || lowerName.includes("oro")) {
    return {
      bg: "bg-yellow-500/10",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-l-yellow-500",
    };
  }

  // Platinum tier
  if (lowerName.includes("platinum") || lowerName.includes("platino")) {
    return {
      bg: "bg-cyan-500/10",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-l-cyan-400",
    };
  }

  // Black/Diamond tier
  if (lowerName.includes("black") || lowerName.includes("diamond") || lowerName.includes("negro")) {
    return {
      bg: "bg-slate-900/10",
      text: "text-slate-900 dark:text-slate-100",
      border: "border-l-slate-700",
    };
  }

  // Default fallback
  return {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-l-blue-500",
  };
}
