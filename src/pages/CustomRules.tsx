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
          <Button variant="ghost" onClick={() => {
            setIsAuthenticated(false);
            sessionStorage.removeItem('admin_password');
          }}>
            Logout
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Add New Rule */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add New Rule</h2>
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
              <Label htmlFor="new-hyphenated">Hyphenated Form</Label>
              <Input
                id="new-hyphenated"
                value={newRule.hyphenated}
                onChange={(e) => setNewRule({ ...newRule, hyphenated: e.target.value })}
                placeholder="e.g., Logic&shy;Line"
              />
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
                      <Input
                        value={editForm.word}
                        onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                        placeholder="Word"
                      />
                      <Input
                        value={editForm.hyphenated}
                        onChange={(e) => setEditForm({ ...editForm, hyphenated: e.target.value })}
                        placeholder="Hyphenated form"
                      />
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
                          {rule.word} → <span dangerouslySetInnerHTML={{ __html: rule.hyphenated.replace(/\u00AD/g, '&shy;') }} />
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
