/**
 * Language pack interface for extensible hyphenation support
 */
export interface LanguagePack {
  /** ISO 639-1 language code */
  id: string;

  /** Display name for UI */
  displayName: string;

  /** Minimum word length to hyphenate */
  minWordLength: number;

  /** Hypher patterns (from hyphenation.xx packages) */
  patterns: {
    patterns: Record<string, string>;
    leftmin: number;
    rightmin: number;
  };

  /**
   * Post-process hyphenation points (e.g., German ck → k-k)
   * @param word Original word
   * @param hyphenated Hyphenated word with \u00AD markers
   * @returns Adjusted hyphenated word
   */
  postProcess?: (word: string, hyphenated: string) => string;

  /**
   * Additional guard patterns specific to this language
   * @param word Word to check
   * @returns true if word should NOT be hyphenated
   */
  shouldSkip?: (word: string) => boolean;
}
