import Hypher from 'hypher';
import type { LanguagePack } from './LanguagePack';
import { tokenize, detokenize, shouldProtect, hasExistingHyphen } from './guards';
import { parseHtml, reconstructHtml, isHtml } from './sanitize';
import { getCustomHyphenation } from '../lib/customRules';
import { isExcluded } from '../lib/exclusionRules';

/**
 * Output encoding type
 */
export type OutputEncoding = 'html' | 'unicode';

/**
 * Hyphenation options
 */
export interface HyphenationOptions {
  /** Language pack to use */
  languagePack: LanguagePack;

  /** Output encoding: 'html' for ­, 'unicode' for U+00AD */
  encoding: OutputEncoding;

  /** Whether to treat input as HTML (preserve tags/entities) */
  htmlMode: boolean;
}

/**
 * Hyphenation result
 */
export interface HyphenationResult {
  /** Processed text with soft hyphens */
  output: string;

  /** Original input text */
  input: string;

  /** Language ID used */
  language: string;

  /** HTML mode enabled */
  htmlMode: boolean;

  /** Encoding type used */
  encoding: OutputEncoding;

  /** Number of words processed */
  wordsProcessed: number;

  /** Number of soft hyphens inserted */
  hyphensInserted: number;

  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * Hyphenate a single word using Hypher patterns
 */
function hyphenateWord(
  word: string,
  languagePack: LanguagePack,
  hypher: Hypher
): string {
  // Skip if word should be protected
  if (shouldProtect(word)) {
    return word;
  }

  // Skip if language-specific rules say so
  if (languagePack.shouldSkip?.(word)) {
    return word;
  }

  // Separate leading/trailing punctuation
  const leadingMatch = word.match(/^[^\w\u00C0-\u017F]+/);
  const trailingMatch = word.match(/[^\w\u00C0-\u017F]+$/);

  const leading = leadingMatch ? leadingMatch[0] : '';
  const trailing = trailingMatch ? trailingMatch[0] : '';
  const coreWord = word.slice(leading.length, word.length - trailing.length);

  // Check exclusion list first (never hyphenate these words)
  if (isExcluded(coreWord)) {
    return word;
  }

  // Handle compound words (e.g., "TÜV-Zertifikate")
  // Hyphenate each part separately, but skip excluded parts
  if (coreWord.includes('-')) {
    const parts = coreWord.split('-');
    const hyphenatedParts = parts.map(part => {
      // If this part is excluded, keep it as-is
      if (isExcluded(part)) {
        return part;
      }
      // Otherwise, hyphenate this part recursively
      return hyphenateWord(part, languagePack, hypher);
    });
    return leading + hyphenatedParts.join('-') + trailing;
  }

  // Check for custom hyphenation rule (highest priority for custom breaks)
  const customHyphenation = getCustomHyphenation(coreWord);
  if (customHyphenation) {
    return leading + customHyphenation + trailing;
  }

  // Skip if core word is too short
  if (coreWord.length < languagePack.minWordLength) {
    return word;
  }

  // Hyphenate using Hypher (only the core word)
  const syllables = hypher.hyphenate(coreWord);

  // If no hyphenation points found, return original
  if (syllables.length <= 1) {
    return word;
  }

  // Join with soft hyphen (U+00AD)
  let hyphenated = syllables.join('\u00AD');

  // Apply language-specific post-processing
  if (languagePack.postProcess) {
    hyphenated = languagePack.postProcess(coreWord, hyphenated);
  }

  // If word has existing hyphens, be more conservative
  // Remove soft hyphens adjacent to hard hyphens
  if (hasExistingHyphen(coreWord)) {
    hyphenated = hyphenated.replace(/-\u00AD/g, '-');
    hyphenated = hyphenated.replace(/\u00AD-/g, '-');
  }

  // Reconstruct with punctuation
  return leading + hyphenated + trailing;
}

/**
 * Convert soft hyphen encoding
 */
function encodeHyphen(text: string, encoding: OutputEncoding): string {
  if (encoding === 'html') {
    return text.replace(/\u00AD/g, '&shy;');
  }
  return text; // Already Unicode
}

/**
 * Hyphenate plain text
 */
function hyphenatePlainText(
  text: string,
  options: HyphenationOptions,
  hypher: Hypher
): { output: string; wordsProcessed: number; hyphensInserted: number } {
  // Tokenize text
  const tokens = tokenize(text);

  let wordsProcessed = 0;
  let hyphensInserted = 0;

  // Process each token
  const processedTokens = tokens.map((token) => {
    if (token.type === 'text') {
      const hyphenated = hyphenateWord(token.value, options.languagePack, hypher);

      if (hyphenated !== token.value) {
        wordsProcessed++;
        // Count soft hyphens added
        const hyphenCount = (hyphenated.match(/\u00AD/g) || []).length;
        hyphensInserted += hyphenCount;
      }

      return { ...token, value: hyphenated };
    }
    return token;
  });

  // Reconstruct text
  const output = detokenize(processedTokens);

  return { output, wordsProcessed, hyphensInserted };
}

/**
 * Hyphenate HTML while preserving tags and entities
 */
function hyphenateHtml(
  html: string,
  options: HyphenationOptions,
  hypher: Hypher
): { output: string; wordsProcessed: number; hyphensInserted: number } {
  // Parse HTML into tokens
  const htmlTokens = parseHtml(html);

  let wordsProcessed = 0;
  let hyphensInserted = 0;

  // Process text tokens, but skip content inside <a> tags
  const processedTokens = htmlTokens.map((token) => {
    if (token.type === 'text') {
      // Tokenize text content
      const textTokens = tokenize(token.value);

      // Hyphenate text tokens
      const hyphenatedTokens = textTokens.map((textToken) => {
        if (textToken.type === 'text') {
          const hyphenated = hyphenateWord(
            textToken.value,
            options.languagePack,
            hypher
          );

          if (hyphenated !== textToken.value) {
            wordsProcessed++;
            const hyphenCount = (hyphenated.match(/\u00AD/g) || []).length;
            hyphensInserted += hyphenCount;
          }

          return { ...textToken, value: hyphenated };
        }
        return textToken;
      });

      // Reconstruct text
      const hyphenatedText = detokenize(hyphenatedTokens);

      return { ...token, value: hyphenatedText };
    }
    // Skip tokens (e.g., content inside <a> tags) are preserved as-is
    return token;
  });

  // Reconstruct HTML
  const output = reconstructHtml(processedTokens);

  return { output, wordsProcessed, hyphensInserted };
}

/**
 * Main hyphenation function
 */
export function hyphenate(text: string, options: HyphenationOptions): HyphenationResult {
  const startTime = performance.now();

  // Create Hypher instance
  const hypher = new Hypher(options.languagePack.patterns);

  let output: string;
  let wordsProcessed: number;
  let hyphensInserted: number;

  // Process based on mode
  if (options.htmlMode && isHtml(text)) {
    ({ output, wordsProcessed, hyphensInserted } = hyphenateHtml(text, options, hypher));
  } else {
    ({ output, wordsProcessed, hyphensInserted } = hyphenatePlainText(text, options, hypher));
  }

  // Encode soft hyphens
  output = encodeHyphen(output, options.encoding);

  const endTime = performance.now();
  const processingTime = Math.round(endTime - startTime);

  return {
    output,
    input: text,
    language: options.languagePack.id,
    htmlMode: options.htmlMode,
    encoding: options.encoding,
    wordsProcessed,
    hyphensInserted,
    processingTime,
  };
}
