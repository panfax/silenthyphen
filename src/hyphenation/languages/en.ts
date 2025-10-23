import type { LanguagePack } from '../LanguagePack';
import enPatterns from 'hyphenation.en-us';

/**
 * English (US) language pack
 */
export const englishLanguagePack: LanguagePack = {
  id: 'en',
  displayName: 'English',
  minWordLength: 6,
  patterns: enPatterns,

  /**
   * English-specific post-processing
   * - LogicLine: Always hyphenate as Logic-Line (company name)
   */
  postProcess: (word: string, _hyphenated: string): string => {
    // Special case: LogicLine (company name) - always hyphenate as Logic-Line
    if (/^logicline$/i.test(word)) {
      return 'Logic\u00ADLine';
    }

    // No other post-processing for English
    return _hyphenated;
  },

  /**
   * English-specific skip rules
   */
  shouldSkip: (word: string): boolean => {
    // Skip very short words
    if (word.length < 6) return true;

    // Skip words that are just numbers
    if (/^\d+$/.test(word)) return true;

    return false;
  },
};
