/**
 * Custom hyphenation rules service
 * Fetches custom rules from the backend and caches them
 */

export interface CustomRule {
  id: number;
  word: string;
  hyphenated: string;
}

let customRulesCache: Record<string, string> = {};
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch custom hyphenation rules from the backend
 */
export async function fetchCustomRules(): Promise<void> {
  const now = Date.now();

  // Use cached rules if fetched recently
  if (now - lastFetch < CACHE_DURATION) {
    return;
  }

  try {
    const response = await fetch('/api/custom-rules');
    if (!response.ok) {
      console.warn('Failed to fetch custom rules');
      return;
    }

    const data = await response.json();
    const rules: CustomRule[] = data.rules || [];

    // Build cache: lowercase word → hyphenated form
    customRulesCache = {};
    rules.forEach((rule) => {
      customRulesCache[rule.word.toLowerCase()] = rule.hyphenated;
    });

    lastFetch = now;
    console.log(`Loaded ${rules.length} custom hyphenation rules`);
  } catch (error) {
    console.error('Error fetching custom rules:', error);
  }
}

/**
 * Get hyphenated form for a word if it has a custom rule
 * Returns null if no custom rule exists
 */
export function getCustomHyphenation(word: string): string | null {
  const lowerWord = word.toLowerCase();
  return customRulesCache[lowerWord] || null;
}

/**
 * Check if a word has a custom rule
 */
export function hasCustomRule(word: string): boolean {
  return word.toLowerCase() in customRulesCache;
}

/**
 * Get all custom rules (for debugging/display)
 */
export function getAllCustomRules(): Record<string, string> {
  return { ...customRulesCache };
}

/**
 * Clear the cache (force re-fetch on next request)
 */
export function clearCache(): void {
  customRulesCache = {};
  lastFetch = 0;
}
