/**
 * HTML-safe tokenization to preserve tags and entities
 */

export interface HtmlToken {
  type: 'text' | 'tag' | 'entity' | 'skip';
  value: string;
}

/**
 * Parse HTML into tokens, separating text nodes from tags and entities
 * This ensures we only hyphenate text content, not markup
 * Content inside <a> tags is marked as 'skip' to prevent hyphenation in links
 */
export function parseHtml(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  let currentIndex = 0;
  let insideLink = false;

  // Pattern to match HTML tags or entities
  const pattern = /(<[^>]+>)|(&[a-zA-Z0-9#]+;)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      const textContent = html.substring(currentIndex, match.index);
      if (textContent) {
        // Mark text inside <a> tags as 'skip' to prevent hyphenation
        tokens.push({
          type: insideLink ? 'skip' : 'text',
          value: textContent
        });
      }
    }

    // Add the tag or entity
    if (match[1]) {
      // HTML tag
      const tag = match[1];
      tokens.push({ type: 'tag', value: tag });

      // Track if we're entering or exiting a link
      if (/<a\s/i.test(tag)) {
        insideLink = true;
      } else if (/<\/a>/i.test(tag)) {
        insideLink = false;
      }
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
      tokens.push({
        type: insideLink ? 'skip' : 'text',
        value: textContent
      });
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
