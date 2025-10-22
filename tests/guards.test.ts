import { describe, it, expect } from 'vitest';
import { shouldProtect, tokenize, detokenize } from '../src/hyphenation/guards';

describe('Guards - shouldProtect', () => {
  it('should protect URLs', () => {
    expect(shouldProtect('https://www.example.com')).toBe(true);
    expect(shouldProtect('http://test.de')).toBe(true);
    expect(shouldProtect('ftp://files.example.com')).toBe(true);
  });

  it('should protect emails', () => {
    expect(shouldProtect('info@example.com')).toBe(true);
    expect(shouldProtect('test.user@domain.de')).toBe(true);
  });

  it('should protect semantic versions', () => {
    expect(shouldProtect('v2.1.3')).toBe(true);
    expect(shouldProtect('1.0.0')).toBe(true);
    expect(shouldProtect('2.1.0-beta')).toBe(true);
  });

  it('should protect product IDs and SKUs', () => {
    expect(shouldProtect('TB-100')).toBe(true);
    expect(shouldProtect('CR250')).toBe(true);
    expect(shouldProtect('ABC-123-XYZ')).toBe(true);
  });

  it('should protect hashtags', () => {
    expect(shouldProtect('#example')).toBe(true);
    expect(shouldProtect('#test123')).toBe(true);
  });

  it('should protect @mentions', () => {
    expect(shouldProtect('@username')).toBe(true);
    expect(shouldProtect('@test_user')).toBe(true);
  });

  it('should protect ALL-CAPS acronyms', () => {
    expect(shouldProtect('NATO')).toBe(true);
    expect(shouldProtect('HTML')).toBe(true);
    expect(shouldProtect('API')).toBe(true);
    expect(shouldProtect('CSS')).toBe(true);
  });

  it('should protect code markers', () => {
    expect(shouldProtect('`code`')).toBe(true);
    expect(shouldProtect('`ISO-9001`')).toBe(true);
  });

  it('should not protect regular words', () => {
    expect(shouldProtect('example')).toBe(false);
    expect(shouldProtect('Ladungssicherung')).toBe(false);
    expect(shouldProtect('responsiveness')).toBe(false);
  });

  it('should not protect mixed case words', () => {
    expect(shouldProtect('iPhone')).toBe(false);
    expect(shouldProtect('JavaScript')).toBe(false);
  });
});

describe('Guards - tokenize/detokenize', () => {
  it('should tokenize text with protected content', () => {
    const text = 'Visit https://example.com for more info';
    const tokens = tokenize(text);

    expect(tokens).toHaveLength(5); // "Visit", " ", "https://example.com", " ", "for more info"
    expect(tokens[0]?.type).toBe('text');
    expect(tokens[2]?.type).toBe('protected');
    expect(tokens[2]?.value).toBe('https://example.com');
  });

  it('should preserve whitespace', () => {
    const text = 'word1  word2   word3';
    const tokens = tokenize(text);

    const whitespaceTokens = tokens.filter((t) => t.type === 'whitespace');
    expect(whitespaceTokens).toHaveLength(2);
  });

  it('should roundtrip text correctly', () => {
    const text = 'Text with https://url.com and @mention and #hashtag';
    const tokens = tokenize(text);
    const reconstructed = detokenize(tokens);

    expect(reconstructed).toBe(text);
  });

  it('should handle empty strings', () => {
    const tokens = tokenize('');
    expect(tokens).toHaveLength(0);
  });

  it('should handle text with multiple protected segments', () => {
    const text = 'Email info@example.com version v2.1.3 and TB-100';
    const tokens = tokenize(text);

    const protectedTokens = tokens.filter((t) => t.type === 'protected');
    expect(protectedTokens).toHaveLength(3);
    expect(protectedTokens.map((t) => t.value)).toEqual([
      'info@example.com',
      'v2.1.3',
      'TB-100',
    ]);
  });
});
