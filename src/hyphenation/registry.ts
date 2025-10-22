import type { LanguagePack } from './LanguagePack';
import { germanLanguagePack } from './languages/de';
import { englishLanguagePack } from './languages/en';

/**
 * Language registry for extensible language support
 */
class LanguageRegistry {
  private languages = new Map<string, LanguagePack>();

  constructor() {
    // Register built-in languages
    this.register(germanLanguagePack);
    this.register(englishLanguagePack);
  }

  /**
   * Register a new language pack
   */
  register(pack: LanguagePack): void {
    this.languages.set(pack.id, pack);
  }

  /**
   * Get language pack by ID
   */
  get(id: string): LanguagePack | undefined {
    return this.languages.get(id);
  }

  /**
   * Get all registered language packs
   */
  getAll(): LanguagePack[] {
    return Array.from(this.languages.values());
  }

  /**
   * Get all language IDs
   */
  getIds(): string[] {
    return Array.from(this.languages.keys());
  }
}

// Singleton instance
export const languageRegistry = new LanguageRegistry();

/**
 * Add a new language pack (for extensibility)
 */
export function addLanguage(pack: LanguagePack): void {
  languageRegistry.register(pack);
}

/**
 * Get language pack by ID
 */
export function getLanguageById(id: string): LanguagePack | undefined {
  return languageRegistry.get(id);
}

/**
 * Get all available languages
 */
export function getAllLanguages(): LanguagePack[] {
  return languageRegistry.getAll();
}
