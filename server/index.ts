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

// Initialize and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Analytics server running on port ${PORT}`);
    console.log(`Admin endpoint: http://localhost:${PORT}/api/admin/stats`);
  });
});
