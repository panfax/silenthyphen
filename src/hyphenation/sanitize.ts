/**
 * HTML-safe tokenization to preserve tags and entities
 */

export interface HtmlToken {
  type: 'text' | 'tag' | 'entity';
  value: string;
}

/**
 * Parse HTML into tokens, separating text nodes from tags and entities
 * This ensures we only hyphenate text content, not markup
 */
export function parseHtml(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  let currentIndex = 0;

  // Pattern to match HTML tags or entities
  const pattern = /(<[^>]+>)|(&[a-zA-Z0-9#]+;)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      const textContent = html.substring(currentIndex, match.index);
      if (textContent) {
        tokens.push({ type: 'text', value: textContent });
      }
    }

    // Add the tag or entity
    if (match[1]) {
      // HTML tag
      tokens.push({ type: 'tag', value: match[1] });
    } else if (match[2]) {
      // HTML entity
      tokens.push({ type: 'entity', value: match[2] });
    }

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (currentIndex < html.length) {
    const textContent = html.substring(currentIndex);
    if (textContent) {
      tokens.push({ type: 'text', value: textContent });
    }
  }

  return tokens;
}

/**
 * Reconstruct HTML from tokens
 */
export function reconstructHtml(tokens: HtmlToken[]): string {
  return tokens.map((t) => t.value).join('');
}

/**
 * Check if string contains HTML tags or entities
 */
export function isHtml(text: string): boolean {
  return /<[^>]+>/.test(text) || /&[a-zA-Z0-9#]+;/.test(text);
}
