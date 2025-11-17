/**
 * Exclusion rules service - words that should NEVER be hyphenated
 * Fetches exclusion list from the backend and caches them
 */

export interface ExclusionRule {
  id: number;
  word: string;
}

let exclusionCache: Set<string> = new Set();
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch exclusion rules from the backend
 */
export async function fetchExclusionRules(force: boolean = false): Promise<void> {
  const now = Date.now();

  // Use cached rules if fetched recently (unless forced)
  if (!force && now - lastFetch < CACHE_DURATION) {
    return;
  }

  try {
    const response = await fetch('/api/exclusion-rules');
    if (!response.ok) {
      console.warn('Failed to fetch exclusion rules');
      return;
    }

    const data = await response.json();
    const rules: ExclusionRule[] = data.rules || [];

    // Build cache: Set of lowercase words
    exclusionCache = new Set(rules.map(rule => rule.word.toLowerCase()));

    lastFetch = now;
    console.log(`Loaded ${rules.length} exclusion rules (never hyphenate)`);
  } catch (error) {
    console.error('Error fetching exclusion rules:', error);
  }
}

/**
 * Check if a word should be excluded from hyphenation
 */
export function isExcluded(word: string): boolean {
  return exclusionCache.has(word.toLowerCase());
}

/**
 * Get all excluded words (for debugging/display)
 */
export function getAllExcludedWords(): string[] {
  return Array.from(exclusionCache);
}

/**
 * Clear the cache (force re-fetch on next request)
 */
export function clearCache(): void {
  exclusionCache.clear();
  lastFetch = 0;
}
