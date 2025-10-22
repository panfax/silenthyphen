import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { HyphenationResult } from '../hyphenation/engine';
import type { WorkerRequest, WorkerResponse } from '../worker/hyphenate.worker';
import { loadSettings, saveSettings, type UserSettings } from '../lib/storage';
import { detectLanguage } from '../lib/langDetect';

interface AppContextType {
  // Input text
  inputText: string;
  setInputText: (text: string) => void;

  // Output
  outputText: string;
  stats: HyphenationResult | null;

  // Settings
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;

  // Language detection
  detectedLanguage: 'de' | 'en' | null;
  detectionConfidence: number;

  // Processing state
  isProcessing: boolean;

  // Trigger hyphenation
  process: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [stats, setStats] = useState<HyphenationResult | null>(null);
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [detectedLanguage, setDetectedLanguage] = useState<'de' | 'en' | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../worker/hyphenate.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { result, error } = e.data;

      if (error) {
        console.error('Hyphenation error:', error);
      }

      setOutputText(result.output);
      setStats(result);
      setIsProcessing(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Detect language when input changes
  useEffect(() => {
    if (inputText.trim().length > 10) {
      const detection = detectLanguage(inputText);
      setDetectedLanguage(detection.language);
      setDetectionConfidence(detection.confidence);
    } else {
      setDetectedLanguage(null);
      setDetectionConfidence(0);
    }
  }, [inputText]);

  // Update setting and persist
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Process hyphenation
  const process = useCallback(() => {
    if (!inputText.trim() || !workerRef.current) {
      setOutputText('');
      setStats(null);
      return;
    }

    setIsProcessing(true);

    // Determine language
    const languageId =
      settings.language === 'auto'
        ? detectedLanguage || 'de'
        : settings.language;

    const request: WorkerRequest = {
      id: `req-${++requestIdRef.current}`,
      text: inputText,
      languageId,
      encoding: settings.encoding,
      htmlMode: settings.htmlMode,
    };

    workerRef.current.postMessage(request);
  }, [inputText, settings, detectedLanguage]);

  // Auto-process when settings change (debounced via useEffect)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        process();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText, settings.language, settings.encoding, settings.htmlMode]);

  return (
    <AppContext.Provider
      value={{
        inputText,
        setInputText,
        outputText,
        stats,
        settings,
        updateSetting,
        detectedLanguage,
        detectionConfidence,
        isProcessing,
        process,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
