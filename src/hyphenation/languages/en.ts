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
   * - Company/Product names: Always hyphenate at specific points
   */
  postProcess: (word: string, _hyphenated: string): string => {
    // Special cases: Company and product names with fixed hyphenation
    const specialCases: Record<string, string> = {
      'logicline': 'Logic\u00ADLine',
      'frontrack': 'Front\u00ADRack',
      'combirack': 'Combi\u00ADRack',
      'powerrack': 'Power\u00ADRack',
      'heckrack': 'Heck\u00ADRack',
      'ecocover': 'Eco\u00ADCover',
      'basiccover': 'Basic\u00ADCover',
      'combicover': 'Combi\u00ADCover',
      'basicbox': 'Basic\u00ADBox',
      'combibox': 'Combi\u00ADBox',
      'toolbox': 'Tool\u00ADBox',
      'roadbox': 'Road\u00ADBox',
      'longbox': 'Long\u00ADBox',
    };

    const lowerWord = word.toLowerCase();
    if (specialCases[lowerWord]) {
      return specialCases[lowerWord];
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
