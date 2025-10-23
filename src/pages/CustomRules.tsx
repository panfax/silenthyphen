import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface CustomRule {
  id: number;
  word: string;
  hyphenated: string;
  created_at?: string;
  updated_at?: string;
}

export function CustomRules() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rules, setRules] = useState<CustomRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ word: '', hyphenated: '' });
  const [newRule, setNewRule] = useState({ word: '', hyphenated: '' });

  // Check for saved password
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
      fetchRules(savedPassword);
    }
  }, []);

  const fetchRules = async (pwd?: string) => {
    const authPassword = pwd || password;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/custom-rules', {
        headers: {
          Authorization: `Bearer ${authPassword}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setError('Invalid password');
          sessionStorage.removeItem('admin_password');
        }
        return;
      }

      const data = await response.json();
      setRules(data.rules);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Failed to load custom rules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRules();
  };

  const handleAdd = async () => {
    if (!newRule.word || !newRule.hyphenated) {
      setError('Please fill in both fields');
      return;
    }

    setError('');

    try {
      const response = await fetch('/api/admin/custom-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(newRule),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to add rule');
        return;
      }

      setNewRule({ word: '', hyphenated: '' });
      fetchRules();
    } catch (err) {
      setError('Failed to add rule');
      console.error(err);
    }
  };

  const handleEdit = (rule: CustomRule) => {
    setEditingId(rule.id);
    setEditForm({ word: rule.word, hyphenated: rule.hyphenated });
  };

  const handleUpdate = async (id: number) => {
    setError('');

    try {
      const response = await fetch(`/api/admin/custom-rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update rule');
        return;
      }

      setEditingId(null);
      fetchRules();
    } catch (err) {
      setError('Failed to update rule');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this rule?')) return;

    setError('');

    try {
      const response = await fetch(`/api/admin/custom-rules/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (!response.ok) {
        setError('Failed to delete rule');
        return;
      }

      fetchRules();
    } catch (err) {
      setError('Failed to delete rule');
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Custom Hyphenation Rules</h1>
            <p className="text-muted-foreground mt-2">Enter admin password</p>
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
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Custom Hyphenation Rules</h1>
            <p className="text-muted-foreground mt-1">
              Manage words with fixed hyphenation points
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/analytics'}>
              Analytics
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              setIsAuthenticated(false);
              sessionStorage.removeItem('admin_password');
              window.location.href = '/';
            }}>
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Add New Rule */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Add New Rule</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Define custom hyphenation points for specific words (product names, brand names, etc.)
            </p>
          </div>

          {/* Helper Text */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium">How to use:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Word:</strong> Enter the word exactly as it appears (case-insensitive)</li>
              <li><strong>Hyphenated Form:</strong> Use <code className="bg-background px-1 py-0.5 rounded">&amp;shy;</code> or direct soft hyphen (­) to mark break points</li>
            </ul>
            <div className="pt-2 border-t border-border mt-3">
              <p className="font-medium mb-1">Examples:</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono">LogicLine</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono">Logic<span className="bg-yellow-200 dark:bg-yellow-800 px-0.5 font-bold">|</span>Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">FrontRack</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono">Front<span className="bg-yellow-200 dark:bg-yellow-800 px-0.5 font-bold">|</span>Rack</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">PowerStation</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono">Power<span className="bg-yellow-200 dark:bg-yellow-800 px-0.5 font-bold">|</span>Station</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded font-mono font-bold">|</span> = soft hyphen position (invisible in normal text, appears as "-" when word breaks at line end)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-word">Word</Label>
              <Input
                id="new-word"
                value={newRule.word}
                onChange={(e) => setNewRule({ ...newRule, word: e.target.value })}
                placeholder="e.g., LogicLine"
              />
            </div>
            <div>
              <Label htmlFor="new-hyphenated">Hyphenated Form (use ­ between parts)</Label>
              <Input
                id="new-hyphenated"
                value={newRule.hyphenated}
                onChange={(e) => setNewRule({ ...newRule, hyphenated: e.target.value })}
                placeholder="Logic­Line (type: Logic + soft hyphen + Line)"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Type the word with visible soft hyphens (­) or use &amp;shy; HTML entity
              </p>
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        {/* Rules List */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">
              Current Rules ({rules.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading...
            </div>
          ) : rules.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No custom rules yet. Add one above to get started.
            </div>
          ) : (
            <div className="divide-y">
              {rules.map((rule) => (
                <div key={rule.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                  {editingId === rule.id ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-word-${rule.id}`} className="text-xs">Word</Label>
                        <Input
                          id={`edit-word-${rule.id}`}
                          value={editForm.word}
                          onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                          placeholder="Word"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-hyphenated-${rule.id}`} className="text-xs">Hyphenated Form</Label>
                        <Input
                          id={`edit-hyphenated-${rule.id}`}
                          value={editForm.hyphenated.replace(/\u00AD/g, '­')}
                          onChange={(e) => setEditForm({ ...editForm, hyphenated: e.target.value })}
                          placeholder="Logic­Line (use ­ or &shy;)"
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Current: <span dangerouslySetInnerHTML={{
                            __html: editForm.hyphenated.replace(/\u00AD/g, '<span class="bg-yellow-200 dark:bg-yellow-800 px-0.5 font-bold">|</span>')
                          }} />
                        </p>
                      </div>
                      <div className="flex gap-2 sm:col-span-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(rule.id)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-sm">
                          <span className="text-muted-foreground">{rule.word}</span>
                          {' → '}
                          <span dangerouslySetInnerHTML={{
                            __html: rule.hyphenated.replace(/\u00AD/g, '<span class="bg-yellow-200 dark:bg-yellow-800 px-0.5 font-bold">|</span>')
                          }} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
