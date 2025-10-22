/**
 * Guard system to protect special content from hyphenation
 */

/** URL pattern (http(s), ftp, file, etc.) */
const URL_PATTERN =
  /^(?:https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]$/;

/** Email pattern */
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Semantic version (v1.2.3, 2.0.1-beta, etc.) */
const SEMVER_PATTERN = /^v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;

/** Product ID / SKU pattern (TB-100, CR250, ABC-123-XYZ, etc.) */
const ID_PATTERN = /^[A-Z]{1,4}[-_]?\d{1,6}(?:[-_][A-Z0-9]+)?$/i;

/** Hashtag */
const HASHTAG_PATTERN = /^#[A-Za-z0-9_]+$/;

/** @mention */
const MENTION_PATTERN = /^@[A-Za-z0-9_]+$/;

/** ALL CAPS (acronyms like NATO, HTML, API) - minimum 2 chars */
const ALL_CAPS_PATTERN = /^[A-Z]{2,}$/;

/** Code fence inline markers */
const CODE_MARKER_PATTERN = /^`.*`$/;

/**
 * Check if a word should be protected from hyphenation
 */
export function shouldProtect(word: string): boolean {
  if (!word || word.length === 0) return true;

  // URLs
  if (URL_PATTERN.test(word)) return true;

  // Emails
  if (EMAIL_PATTERN.test(word)) return true;

  // Semantic versions
  if (SEMVER_PATTERN.test(word)) return true;

  // Product IDs / SKUs
  if (ID_PATTERN.test(word)) return true;

  // Hashtags
  if (HASHTAG_PATTERN.test(word)) return true;

  // @mentions
  if (MENTION_PATTERN.test(word)) return true;

  // ALL CAPS acronyms
  if (ALL_CAPS_PATTERN.test(word)) return true;

  // Code markers
  if (CODE_MARKER_PATTERN.test(word)) return true;

  return false;
}

/**
 * Check if word already contains a hyphen (for compound words)
 * In that case, avoid adding soft hyphens right next to existing hyphens
 */
export function hasExistingHyphen(word: string): boolean {
  return word.includes('-');
}

/**
 * Token type for text segmentation
 */
export interface Token {
  type: 'text' | 'protected' | 'whitespace';
  value: string;
}

/**
 * Tokenize text into processable segments
 * Protected segments won't be hyphenated
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];

  // Split by whitespace while preserving it
  const parts = text.split(/(\s+)/);

  for (const part of parts) {
    if (!part) continue;

    // Whitespace token
    if (/^\s+$/.test(part)) {
      tokens.push({ type: 'whitespace', value: part });
      continue;
    }

    // Check if entire part should be protected
    if (shouldProtect(part)) {
      tokens.push({ type: 'protected', value: part });
      continue;
    }

    // Regular text token
    tokens.push({ type: 'text', value: part });
  }

  return tokens;
}

/**
 * Reconstruct text from tokens
 */
export function detokenize(tokens: Token[]): string {
  return tokens.map((t) => t.value).join('');
}
