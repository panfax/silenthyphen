/**
 * localStorage utilities for persisting user settings
 */

const STORAGE_KEY_PREFIX = 'hyphenation_';

export interface UserSettings {
  language: 'auto' | 'de' | 'en';
  encoding: 'html' | 'unicode';
  htmlMode: boolean;
  revealHyphens: boolean;
  previewHyphens: 'auto' | 'manual';
  previewOverflowWrap: 'normal' | 'anywhere';
  previewWordBreak: 'normal';
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'auto',
  encoding: 'html',
  htmlMode: false,
  revealHyphens: false,
  previewHyphens: 'manual',
  previewOverflowWrap: 'normal',
  previewWordBreak: 'normal',
};

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}settings`,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
}

/**
 * Load settings from localStorage
 */
export function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Clear all settings
 */
export function clearSettings(): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}settings`);
  } catch (error) {
    console.warn('Failed to clear settings:', error);
  }
}
