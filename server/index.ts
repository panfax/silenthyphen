import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let db: Database;

async function initDatabase() {
  db = await open({
    filename: path.join(__dirname, '../analytics.db'),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      language TEXT,
      text_length INTEGER,
      html_mode INTEGER,
      encoding TEXT,
      words_processed INTEGER,
      hyphens_inserted INTEGER,
      processing_time INTEGER,
      feature TEXT,
      download_format TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_timestamp ON events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_session_id ON events(session_id);

    CREATE TABLE IF NOT EXISTS custom_hyphenation_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      hyphenated TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_word ON custom_hyphenation_rules(word);

    CREATE TABLE IF NOT EXISTS exclusion_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_exclusion_word ON exclusion_rules(word);
  `);

  console.log('Database initialized');
}

// Middleware to check admin password
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  const password = authHeader.replace('Bearer ', '');

  if (!ADMIN_PASSWORD_HASH) {
    // Development mode: accept any password
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  const isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  next();
}

// POST /api/analytics - Track event
app.post('/api/analytics', async (req, res) => {
  try {
    const { type, timestamp, sessionId, data } = req.body;

    await db.run(
      `INSERT INTO events (
        type, timestamp, session_id, language, text_length, html_mode,
        encoding, words_processed, hyphens_inserted, processing_time,
        feature, download_format
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type,
        timestamp,
        sessionId,
        data.language || null,
        data.textLength || null,
        data.htmlMode ? 1 : 0,
        data.encoding || null,
        data.wordsProcessed || null,
        data.hyphensInserted || null,
        data.processingTime || null,
        data.feature || null,
        data.downloadFormat || null,
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Failed to save event' });
  }
});

// GET /api/admin/stats - Get analytics statistics
app.get('/api/admin/stats', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause = '';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause = 'WHERE timestamp >= ? AND timestamp <= ?';
      params.push(Number(startDate), Number(endDate));
    }

    // Overall stats
    const totalEvents = await db.get(
      `SELECT COUNT(*) as count FROM events ${whereClause}`,
      params
    );

    const uniqueSessions = await db.get(
      `SELECT COUNT(DISTINCT session_id) as count FROM events ${whereClause}`,
      params
    );

    const totalHyphenations = await db.get(
      `SELECT COUNT(*) as count FROM events WHERE type = 'hyphenate' ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}`,
      whereClause ? params : []
    );

    // Language distribution
    const languageStats = await db.all(
      `SELECT language, COUNT(*) as count
       FROM events
       WHERE type = 'hyphenate' AND language IS NOT NULL ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
       GROUP BY language`,
      whereClause ? params : []
    );

    // Feature usage
    const featureStats = await db.all(
      `SELECT
        SUM(CASE WHEN html_mode = 1 THEN 1 ELSE 0 END) as html_mode_count,
        SUM(CASE WHEN type = 'copy' THEN 1 ELSE 0 END) as copy_count,
        SUM(CASE WHEN type = 'download' THEN 1 ELSE 0 END) as download_count
       FROM events ${whereClause}`,
      params
    );

    // Average text length and processing time
    const avgStats = await db.get(
      `SELECT
        AVG(text_length) as avg_text_length,
        AVG(words_processed) as avg_words_processed,
        AVG(hyphens_inserted) as avg_hyphens_inserted,
        AVG(processing_time) as avg_processing_time
       FROM events
       WHERE type = 'hyphenate' ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}`,
      whereClause ? params : []
    );

    // Events over time (daily aggregation)
    const eventsOverTime = await db.all(
      `SELECT
        DATE(timestamp / 1000, 'unixepoch') as date,
        COUNT(*) as count
       FROM events ${whereClause}
       GROUP BY DATE(timestamp / 1000, 'unixepoch')
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    // Download format distribution
    const downloadFormats = await db.all(
      `SELECT download_format, COUNT(*) as count
       FROM events
       WHERE type = 'download' AND download_format IS NOT NULL ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
       GROUP BY download_format`,
      whereClause ? params : []
    );

    res.json({
      overview: {
        totalEvents: totalEvents.count,
        uniqueSessions: uniqueSessions.count,
        totalHyphenations: totalHyphenations.count,
      },
      languageDistribution: languageStats,
      featureUsage: featureStats[0],
      averages: avgStats,
      eventsOverTime: eventsOverTime.reverse(),
      downloadFormats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/admin/recent - Get recent events
app.get('/api/admin/recent', requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;

    const events = await db.all(
      `SELECT * FROM events
       ORDER BY timestamp DESC
       LIMIT ?`,
      [limit]
    );

    res.json({ events });
  } catch (error) {
    console.error('Error fetching recent events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Custom Hyphenation Rules API

// GET /api/custom-rules - Get all custom hyphenation rules (public)
app.get('/api/custom-rules', async (_req, res) => {
  try {
    const rules = await db.all(
      'SELECT id, word, hyphenated FROM custom_hyphenation_rules ORDER BY word ASC'
    );
    res.json({ rules });
  } catch (error) {
    console.error('Error fetching custom rules:', error);
    res.status(500).json({ error: 'Failed to fetch custom rules' });
  }
});

// GET /api/admin/custom-rules - Get all custom rules with timestamps (admin)
app.get('/api/admin/custom-rules', requireAuth, async (_req, res) => {
  try {
    const rules = await db.all(
      'SELECT * FROM custom_hyphenation_rules ORDER BY word ASC'
    );
    res.json({ rules });
  } catch (error) {
    console.error('Error fetching custom rules:', error);
    res.status(500).json({ error: 'Failed to fetch custom rules' });
  }
});

// POST /api/admin/custom-rules - Add new custom rule
app.post('/api/admin/custom-rules', requireAuth, async (req, res) => {
  try {
    const { word, hyphenated } = req.body;

    if (!word || !hyphenated) {
      return res.status(400).json({ error: 'Word and hyphenated form are required' });
    }

    await db.run(
      'INSERT INTO custom_hyphenation_rules (word, hyphenated) VALUES (?, ?)',
      [word.toLowerCase(), hyphenated]
    );

    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Rule for this word already exists' });
    }
    console.error('Error adding custom rule:', error);
    res.status(500).json({ error: 'Failed to add custom rule' });
  }
});

// PUT /api/admin/custom-rules/:id - Update custom rule
app.put('/api/admin/custom-rules/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { word, hyphenated } = req.body;

    if (!word || !hyphenated) {
      return res.status(400).json({ error: 'Word and hyphenated form are required' });
    }

    await db.run(
      'UPDATE custom_hyphenation_rules SET word = ?, hyphenated = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [word.toLowerCase(), hyphenated, id]
    );

    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Rule for this word already exists' });
    }
    console.error('Error updating custom rule:', error);
    res.status(500).json({ error: 'Failed to update custom rule' });
  }
});

// DELETE /api/admin/custom-rules/:id - Delete custom rule
app.delete('/api/admin/custom-rules/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('DELETE FROM custom_hyphenation_rules WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom rule:', error);
    res.status(500).json({ error: 'Failed to delete custom rule' });
  }
});

// Exclusion Rules API (Never Hyphenate)

// GET /api/exclusion-rules - Get all exclusion rules (public)
app.get('/api/exclusion-rules', async (_req, res) => {
  try {
    const rules = await db.all(
      'SELECT id, word FROM exclusion_rules ORDER BY word ASC'
    );
    res.json({ rules });
  } catch (error) {
    console.error('Error fetching exclusion rules:', error);
    res.status(500).json({ error: 'Failed to fetch exclusion rules' });
  }
});

// GET /api/admin/exclusion-rules - Get all exclusion rules with timestamps (admin)
app.get('/api/admin/exclusion-rules', requireAuth, async (_req, res) => {
  try {
    const rules = await db.all(
      'SELECT * FROM exclusion_rules ORDER BY word ASC'
    );
    res.json({ rules });
  } catch (error) {
    console.error('Error fetching exclusion rules:', error);
    res.status(500).json({ error: 'Failed to fetch exclusion rules' });
  }
});

// POST /api/admin/exclusion-rules - Add new exclusion rule
app.post('/api/admin/exclusion-rules', requireAuth, async (req, res) => {
  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    await db.run(
      'INSERT INTO exclusion_rules (word) VALUES (?)',
      [word.toLowerCase()]
    );

    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'This word is already excluded' });
    }
    console.error('Error adding exclusion rule:', error);
    res.status(500).json({ error: 'Failed to add exclusion rule' });
  }
});

// POST /api/admin/exclusion-rules/bulk - Add multiple exclusion rules at once
app.post('/api/admin/exclusion-rules/bulk', requireAuth, async (req, res) => {
  try {
    const { words } = req.body;

    if (!words || !Array.isArray(words)) {
      return res.status(400).json({ error: 'Words array is required' });
    }

    const results: {
      added: number;
      duplicates: number;
      errors: string[];
    } = {
      added: 0,
      duplicates: 0,
      errors: []
    };

    for (const word of words) {
      if (!word || word.trim() === '') continue;

      try {
        await db.run(
          'INSERT INTO exclusion_rules (word) VALUES (?)',
          [word.toLowerCase().trim()]
        );
        results.added++;
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          results.duplicates++;
        } else {
          results.errors.push(`Failed to add: ${word}`);
        }
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error adding bulk exclusion rules:', error);
    res.status(500).json({ error: 'Failed to add exclusion rules' });
  }
});

// DELETE /api/admin/exclusion-rules/:id - Delete exclusion rule
app.delete('/api/admin/exclusion-rules/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('DELETE FROM exclusion_rules WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting exclusion rule:', error);
    res.status(500).json({ error: 'Failed to delete exclusion rule' });
  }
});

// Initialize and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Analytics server running on port ${PORT}`);
    console.log(`Admin endpoint: http://localhost:${PORT}/api/admin/stats`);
  });
});
