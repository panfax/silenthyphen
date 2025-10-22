import { describe, it, expect } from 'vitest';
import { detectLanguage, formatConfidence } from '../src/lib/langDetect';

describe('Language Detection', () => {
  it('should detect German text', () => {
    const text = `Die Ladungssicherung ist für den sicheren Transport von Gütern
      entscheidend. Unsere hochwertigen Zurrgurte bieten maximale Festigkeit.`;
    const result = detectLanguage(text);

    expect(result.language).toBe('de');
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it('should detect English text', () => {
    const text = `Responsiveness is fundamental to modern web development.
      Our comprehensive toolkit provides state-of-the-art solutions.`;
    const result = detectLanguage(text);

    expect(result.language).toBe('en');
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it('should detect German from umlauts', () => {
    const text = 'Äpfel, Öle und Übungen';
    const result = detectLanguage(text);

    expect(result.language).toBe('de');
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('should detect German from ß character', () => {
    const text = 'Straße Fußball Gruß';
    const result = detectLanguage(text);

    expect(result.language).toBe('de');
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('should handle short text with low confidence', () => {
    const text = 'test';
    const result = detectLanguage(text);

    expect(result.confidence).toBeLessThan(0.7);
  });

  it('should handle empty text', () => {
    const text = '';
    const result = detectLanguage(text);

    expect(result.confidence).toBe(0.5);
  });

  it('should format confidence correctly', () => {
    expect(formatConfidence(0.85)).toBe('85%');
    expect(formatConfidence(0.5)).toBe('50%');
    expect(formatConfidence(0.123)).toBe('12%');
  });
});
