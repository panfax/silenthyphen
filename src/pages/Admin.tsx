import React, { useEffect, useState } from 'react';
import { BarChart3, Users, MousePointerClick, Download, Globe, Clock, TrendingUp, Lock } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

interface Stats {
  overview: {
    totalEvents: number;
    uniqueSessions: number;
    totalHyphenations: number;
  };
  languageDistribution: Array<{ language: string; count: number }>;
  featureUsage: {
    html_mode_count: number;
    copy_count: number;
    download_count: number;
  };
  averages: {
    avg_text_length: number;
    avg_words_processed: number;
    avg_hyphens_inserted: number;
    avg_processing_time: number;
  };
  eventsOverTime: Array<{ date: string; count: number }>;
  downloadFormats: Array<{ download_format: string; count: number }>;
}

export function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    end: new Date().toISOString().split('T')[0] || '',
  });

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      const startTimestamp = new Date(dateRange.start).getTime();
      const endTimestamp = new Date(dateRange.end).getTime();

      const response = await fetch(
        `/api/admin/stats?startDate=${startTimestamp}&endDate=${endTimestamp}`,
        {
          headers: {
            Authorization: `Bearer ${password}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setError('Invalid password');
        } else {
          throw new Error('Failed to fetch stats');
        }
        return;
      }

      const data = await response.json();
      setStats(data);
      setIsAuthenticated(true);

      // Store password in sessionStorage for persistence
      sessionStorage.setItem('admin_password', password);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats();
  };

  // Try to auto-login with stored password
  useEffect(() => {
    const storedPassword = sessionStorage.getItem('admin_password');
    if (storedPassword) {
      setPassword(storedPassword);
      setTimeout(() => {
        fetchStats();
      }, 100);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground text-center">
              Enter your password to access analytics
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-1"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">SilentHyphen Analytics</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/admin/custom-rules'}
            >
              Custom Rules
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem('admin_password');
                window.location.href = '/';
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-6">
        {/* Date Range Filter */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button onClick={fetchStats} disabled={loading}>
              {loading ? 'Loading...' : 'Update'}
            </Button>
          </div>
        </Card>

        {stats && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Sessions</p>
                    <p className="text-2xl font-bold">{stats.overview.uniqueSessions}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{stats.overview.totalEvents}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MousePointerClick className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hyphenations</p>
                    <p className="text-2xl font-bold">{stats.overview.totalHyphenations}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Language Distribution & Averages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language Distribution
                </h3>
                <div className="space-y-3">
                  {stats.languageDistribution.map((lang) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <span className="text-sm font-medium uppercase">{lang.language}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(lang.count / stats.overview.totalHyphenations) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {lang.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Averages
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Text Length</span>
                    <span className="font-medium">{Math.round(stats.averages.avg_text_length)} chars</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Words Processed</span>
                    <span className="font-medium">{Math.round(stats.averages.avg_words_processed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Hyphens Inserted</span>
                    <span className="font-medium">{Math.round(stats.averages.avg_hyphens_inserted)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Processing Time</span>
                    <span className="font-medium">{Math.round(stats.averages.avg_processing_time)}ms</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Feature Usage */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                    <p className="text-xl font-bold">{stats.featureUsage.download_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Copy Actions</p>
                    <p className="text-xl font-bold">{stats.featureUsage.copy_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">HTML Mode Usage</p>
                    <p className="text-xl font-bold">{stats.featureUsage.html_mode_count}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Events Over Time */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Events Over Time (Last 30 Days)</h3>
              <div className="space-y-2">
                {stats.eventsOverTime.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-24">{day.date}</span>
                    <div className="flex-1 h-8 bg-secondary rounded overflow-hidden">
                      <div
                        className="h-full bg-primary/70 flex items-center px-2"
                        style={{
                          width: `${(day.count / Math.max(...stats.eventsOverTime.map(d => d.count))) * 100}%`,
                        }}
                      >
                        <span className="text-xs text-primary-foreground font-medium">
                          {day.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
