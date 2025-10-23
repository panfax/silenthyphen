import type { LanguagePack } from '../LanguagePack';
import dePatterns from 'hyphenation.de';

/**
 * German language pack with custom rules
 */
export const germanLanguagePack: LanguagePack = {
  id: 'de',
  displayName: 'Deutsch',
  minWordLength: 5,
  patterns: dePatterns,

  /**
   * German-specific post-processing
   * - Company/Product names: Always hyphenate at specific points
   * - Convert c-k to k-k (Zucker → Zuk-ker)
   * - Avoid splitting digraphs (ch, sch, ph, qu)
   */
  postProcess: (word: string, hyphenated: string): string => {
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

    // Replace c-k with k-k (German ck rule)
    let result = hyphenated.replace(/c\u00ADk/gi, 'k\u00ADk');

    // Remove hyphens that would split common digraphs
    // Note: Hypher patterns should already handle this, but double-check
    result = result.replace(/c\u00ADh/gi, 'ch');
    result = result.replace(/s\u00ADch/gi, 'sch');
    result = result.replace(/p\u00ADh/gi, 'ph');
    result = result.replace(/q\u00ADu/gi, 'qu');

    return result;
  },

  /**
   * German-specific skip rules
   */
  shouldSkip: (word: string): boolean => {
    // Skip very short words
    if (word.length < 5) return true;

    // Skip words that are just numbers
    if (/^\d+$/.test(word)) return true;

    return false;
  },
};
