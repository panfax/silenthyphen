// Analytics service - sends anonymous usage data to backend
// No personal information or text content is collected

interface AnalyticsEvent {
  type: 'hyphenate' | 'copy' | 'download' | 'feature_toggle';
  timestamp: number;
  sessionId: string;
  data: {
    language?: string;
    textLength?: number;
    htmlMode?: boolean;
    encoding?: string;
    wordsProcessed?: number;
    hyphensInserted?: number;
    processingTime?: number;
    feature?: string;
    downloadFormat?: string;
  };
}

class Analytics {
  private sessionId: string;
  private apiUrl: string;
  private enabled: boolean;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.apiUrl = '/api/analytics';
    this.enabled = true; // Can be toggled via settings
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  async track(type: AnalyticsEvent['type'], data: AnalyticsEvent['data'] = {}) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data,
    };

    try {
      await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.debug('Analytics tracking failed:', error);
    }
  }

  // Track hyphenation request
  trackHyphenation(params: {
    language: string;
    textLength: number;
    htmlMode: boolean;
    encoding: string;
    wordsProcessed: number;
    hyphensInserted: number;
    processingTime: number;
  }) {
    this.track('hyphenate', params);
  }

  // Track copy action
  trackCopy() {
    this.track('copy');
  }

  // Track download
  trackDownload(format: string) {
    this.track('download', { downloadFormat: format });
  }

  // Track feature toggle
  trackFeatureToggle(feature: string) {
    this.track('feature_toggle', { feature });
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const analytics = new Analytics();
