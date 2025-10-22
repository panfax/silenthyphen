import { describe, it, expect } from 'vitest';
import { hyphenate } from '../src/hyphenation/engine';
import { germanLanguagePack } from '../src/hyphenation/languages/de';
import { englishLanguagePack } from '../src/hyphenation/languages/en';

describe('Hyphenation Engine', () => {
  describe('German hyphenation', () => {
    it('should hyphenate German words', () => {
      const result = hyphenate('Ladungssicherung', {
        languagePack: germanLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.output).toContain('\u00AD');
      expect(result.wordsProcessed).toBeGreaterThan(0);
      expect(result.hyphensInserted).toBeGreaterThan(0);
    });

    it('should handle German ck rule (c-k → k-k)', () => {
      const result = hyphenate('Zucker', {
        languagePack: germanLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      // Should not contain c-k combination
      expect(result.output).not.toContain('c\u00ADk');
      // Should contain k-k if hyphenated
      if (result.output.includes('\u00AD')) {
        expect(result.output).toContain('k\u00ADk');
      }
    });

    it('should output HTML entities when encoding is html', () => {
      const result = hyphenate('Ladungssicherung', {
        languagePack: germanLanguagePack,
        encoding: 'html',
        htmlMode: false,
      });

      expect(result.output).toContain('&shy;');
      expect(result.output).not.toContain('\u00AD');
    });

    it('should skip words shorter than minWordLength (5)', () => {
      const result = hyphenate('Test', {
        languagePack: germanLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.output).toBe('Test');
      expect(result.hyphensInserted).toBe(0);
    });

    it('should not hyphenate URLs in German text', () => {
      const text = 'Besuchen Sie https://www.example.com für Informationen';
      const result = hyphenate(text, {
        languagePack: germanLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.output).toContain('https://www.example.com');
      expect(result.output.indexOf('https://www.example.com')).toBeGreaterThan(-1);
    });

    it('should not hyphenate ALL-CAPS words', () => {
      const text = 'Die NATO Organisation hat API Standards';
      const result = hyphenate(text, {
        languagePack: germanLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.output).toContain('NATO');
      expect(result.output).toContain('API');
      // Check that NATO and API don't contain soft hyphens
      const natoIndex = result.output.indexOf('NATO');
      const apiIndex = result.output.indexOf('API');
      expect(result.output.substring(natoIndex, natoIndex + 4)).not.toContain('\u00AD');
      expect(result.output.substring(apiIndex, apiIndex + 3)).not.toContain('\u00AD');
    });
  });

  describe('English hyphenation', () => {
    it('should hyphenate English words', () => {
      const result = hyphenate('responsiveness', {
        languagePack: englishLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.output).toContain('\u00AD');
      expect(result.wordsProcessed).toBeGreaterThan(0);
      expect(result.hyphensInserted).toBeGreaterThan(0);
    });

    it('should skip words shorter than minWordLength (4)', () => {
      const result = hyphenate('web', {
        languagePack: englishLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.output).toBe('web');
      expect(result.hyphensInserted).toBe(0);
    });

    it('should not hyphenate emails', () => {
      const text = 'Contact us at info@example.com today';
      const result = hyphenate(text, {
        languagePack: englishLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.output).toContain('info@example.com');
    });

    it('should not hyphenate version numbers', () => {
      const text = 'Version v2.1.3 includes improvements';
      const result = hyphenate(text, {
        languagePack: englishLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.output).toContain('v2.1.3');
      const versionPart = result.output.substring(
        result.output.indexOf('v2.1.3'),
        result.output.indexOf('v2.1.3') + 6
      );
      expect(versionPart).not.toContain('\u00AD');
    });
  });

  describe('HTML mode', () => {
    it('should preserve HTML tags', () => {
      const html = '<p>Responsiveness is <strong>important</strong></p>';
      const result = hyphenate(html, {
        languagePack: englishLanguagePack,
        encoding: 'html',
        htmlMode: true,
      });

      expect(result.output).toContain('<p>');
      expect(result.output).toContain('</p>');
      expect(result.output).toContain('<strong>');
      expect(result.output).toContain('</strong>');
    });

    it('should preserve HTML entities', () => {
      const html = 'This&nbsp;is&nbsp;text with&amp;symbols';
      const result = hyphenate(html, {
        languagePack: englishLanguagePack,
        encoding: 'html',
        htmlMode: true,
      });

      expect(result.output).toContain('&nbsp;');
      expect(result.output).toContain('&amp;');
    });

    it('should only hyphenate text nodes, not tags', () => {
      const html = '<a href="https://example.com">Ladungssicherung</a>';
      const result = hyphenate(html, {
        languagePack: germanLanguagePack,
        encoding: 'html',
        htmlMode: true,
      });

      expect(result.output).toContain('<a href="https://example.com">');
      expect(result.output).toContain('</a>');
      // Text node should be hyphenated
      expect(result.output).toContain('&shy;');
    });
  });

  describe('Performance', () => {
    it('should process text within reasonable time', () => {
      const longText = 'Ladungssicherung '.repeat(100);
      const result = hyphenate(longText, {
        languagePack: germanLanguagePack,
        encoding: 'unicode',
        htmlMode: false,
      });

      expect(result.processingTime).toBeLessThan(1000); // Less than 1 second
    });
  });
});
