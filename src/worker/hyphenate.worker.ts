/**
 * Web Worker for background hyphenation processing
 */
import { hyphenate, type HyphenationOptions, type HyphenationResult } from '../hyphenation/engine';
import { getLanguageById } from '../hyphenation/registry';

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

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, text, languageId, encoding, htmlMode } = e.data;

  try {
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
        wordsProcessed: 0,
        hyphensInserted: 0,
        processingTime: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    self.postMessage(response);
  }
};
