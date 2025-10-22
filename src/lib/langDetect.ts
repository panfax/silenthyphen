/**
 * Simple language detection heuristic for German and English
 * Uses character n-grams and common word patterns
 */

/**
 * Language detection result
 */
export interface DetectionResult {
  language: 'de' | 'en';
  confidence: number; // 0-1
}

/**
 * German-specific character patterns (higher weight)
 */
const GERMAN_PATTERNS = [
  'ä',
  'ö',
  'ü',
  'ß',
  'äu',
  'eu',
  'ei',
  'ie',
  'sch',
  'ch',
  'ck',
  'tz',
  'dt',
];

/**
 * Common German words
 */
const GERMAN_WORDS = [
  'der',
  'die',
  'das',
  'und',
  'ist',
  'ein',
  'eine',
  'nicht',
  'mit',
  'auf',
  'für',
  'von',
  'dem',
  'den',
  'sich',
  'auch',
  'werden',
  'können',
  'über',
  'nach',
];

/**
 * Common English words
 */
const ENGLISH_WORDS = [
  'the',
  'and',
  'is',
  'are',
  'was',
  'were',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'this',
  'that',
  'which',
  'or',
];

/**
 * Detect language from text using heuristics
 */
export function detectLanguage(text: string): DetectionResult {
  if (!text || text.trim().length < 10) {
    // Default to German for very short texts
    return { language: 'de', confidence: 0.5 };
  }

  const lowerText = text.toLowerCase();
  let germanScore = 0;
  let englishScore = 0;

  // Check for German umlauts and special characters (strong signal)
  for (const pattern of GERMAN_PATTERNS) {
    const count = (lowerText.match(new RegExp(pattern, 'g')) || []).length;
    germanScore += count * 3; // High weight for German-specific chars
  }

  // Text is already processed with word patterns, no need to tokenize separately

  // Check for common German words
  for (const word of GERMAN_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const count = (lowerText.match(regex) || []).length;
    germanScore += count * 2;
  }

  // Check for common English words
  for (const word of ENGLISH_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const count = (lowerText.match(regex) || []).length;
    englishScore += count * 2;
  }

  // English-specific patterns (th, wh at start of words)
  const thCount = (lowerText.match(/\bth/g) || []).length;
  const whCount = (lowerText.match(/\bwh/g) || []).length;
  englishScore += (thCount + whCount) * 2;

  // Determine language based on scores
  const totalScore = germanScore + englishScore;

  if (totalScore === 0) {
    // No strong signals, default to English
    return { language: 'en', confidence: 0.5 };
  }

  if (germanScore > englishScore) {
    const confidence = Math.min(0.95, germanScore / totalScore);
    return { language: 'de', confidence };
  } else {
    const confidence = Math.min(0.95, englishScore / totalScore);
    return { language: 'en', confidence };
  }
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
