/**
 * Web Worker for background hyphenation processing
 */
import { hyphenate, type HyphenationOptions, type HyphenationResult } from '../hyphenation/engine';
import { getLanguageById } from '../hyphenation/registry';
import { fetchExclusionRules } from '../lib/exclusionRules';
import { fetchCustomRules } from '../lib/customRules';

export interface WorkerRequest {
  id: string;
  text: string;
  languageId: string;
  encoding: 'html' | 'unicode';
  htmlMode: boolean;
}

export interface WorkerResponse {
  id: string;
  result: HyphenationResult;
  error?: string;
}

// Load exclusion rules and custom rules when worker starts
let rulesLoaded = false;
const loadRules = async () => {
  if (rulesLoaded) return;

  try {
    await Promise.all([
      fetchExclusionRules(true), // Force fetch
      fetchCustomRules(true), // Force fetch
    ]);
    rulesLoaded = true;
    console.log('[Worker] Exclusion and custom rules loaded');
  } catch (error) {
    console.error('[Worker] Failed to load rules:', error);
  }
};

// Start loading rules immediately
loadRules();

// Worker message handler
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, text, languageId, encoding, htmlMode } = e.data;

  try {
    // Ensure rules are loaded before processing
    await loadRules();
    // Get language pack
    const languagePack = getLanguageById(languageId);

    if (!languagePack) {
      throw new Error(`Language pack not found: ${languageId}`);
    }

    // Prepare options
    const options: HyphenationOptions = {
      languagePack,
      encoding,
      htmlMode,
    };

    // Perform hyphenation
    const result = hyphenate(text, options);

    // Send result back
    const response: WorkerResponse = {
      id,
      result,
    };

    self.postMessage(response);
  } catch (error) {
    // Send error back
    const response: WorkerResponse = {
      id,
      result: {
        output: text, // Return original text on error
        input: text,
        language: languageId,
        htmlMode,
        encoding,
        wordsProcessed: 0,
        hyphensInserted: 0,
        processingTime: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    self.postMessage(response);
  }
};
