# SilentHyphen Analytics

## Overview

SilentHyphen includes an optional analytics system that tracks anonymous usage statistics. **No text content is ever collected** - only metadata about usage patterns.

## What is Tracked

- **Hyphenation requests**: language, text length, processing time, words processed
- **Feature usage**: HTML mode, copy actions, downloads
- **Download formats**: .txt vs .html
- **Session data**: Anonymous session IDs (no personal information)

## What is NOT Tracked

- Actual text content
- IP addresses (unless you choose to add this)
- User identifiable information
- Browser fingerprints

## Setup

### 1. Install Dependencies

All dependencies are already in package.json. Just run:

```bash
npm install
```

### 2. Generate Admin Password Hash

```bash
node scripts/generate-password.js
```

This will prompt you for a password and output a bcrypt hash.

### 3. Create `.env` File

Create a `.env` file in the project root:

```bash
PORT=3001
NODE_ENV=production
ADMIN_PASSWORD_HASH="your-hash-from-step-2"
```

### 4. Run the Analytics Server

**Development:**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Analytics backend
npm run dev:server
```

**Production:**
```bash
# Build backend
npm run build:server

# Run backend (use PM2 or systemd)
npm run server
```

## Accessing the Admin Dashboard

1. Navigate to `/admin` on your site (e.g., `https://silenthyphen.logicline.dev/admin`)
2. Enter your admin password
3. View analytics dashboard with:
   - Unique sessions
   - Total events
   - Language distribution
   - Feature usage statistics
   - Events over time
   - Download format preferences

## Production Deployment

### Option 1: PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start npm --name "silenthyphen-analytics" -- run server

# Save PM2 config
pm2 save
pm2 startup
```

### Option 2: Systemd Service

Create `/etc/systemd/system/silenthyphen-analytics.service`:

```ini
[Unit]
Description=SilentHyphen Analytics Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/silenthyphen
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=ADMIN_PASSWORD_HASH=your-hash-here
ExecStart=/usr/bin/node dist-server/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable silenthyphen-analytics
sudo systemctl start silenthyphen-analytics
sudo systemctl status silenthyphen-analytics
```

### Nginx Configuration

Update your Nginx config to proxy API requests:

```nginx
server {
    listen 80;
    server_name silenthyphen.logicline.dev;

    root /var/www/silenthyphen/dist;
    index index.html;

    # Proxy API requests to analytics backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA fallback (for /admin route)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Database

Analytics data is stored in SQLite (`analytics.db` in the project root).

**Backup:**
```bash
sqlite3 analytics.db ".backup analytics-backup.db"
```

**View data manually:**
```bash
sqlite3 analytics.db
> SELECT * FROM events LIMIT 10;
> .quit
```

## Privacy Considerations

- The analytics system is designed to be privacy-friendly
- No text content is ever stored
- Session IDs are random and cannot be linked to users
- Consider adding a privacy notice on your site
- For GDPR compliance, document your data retention policy

## Disabling Analytics

To disable analytics without removing the code:

In `src/lib/analytics.ts`, set:
```typescript
this.enabled = false; // Disable all tracking
```

Or remove analytics tracking calls from:
- `src/context/AppContext.tsx`
- `src/components/Output.tsx`

## Troubleshooting

**Backend not connecting:**
- Check if port 3001 is available
- Verify .env file exists with correct hash
- Check server logs: `pm2 logs silenthyphen-analytics`

**Admin login failing:**
- Regenerate password hash
- Check ADMIN_PASSWORD_HASH in .env
- Clear browser cache/session storage

**Database errors:**
- Ensure write permissions on analytics.db
- Check disk space
- Verify SQLite3 is installed

## Future Enhancements

Potential improvements:
- Export analytics data as CSV/JSON
- Customizable date ranges
- Real-time dashboard updates (WebSocket)
- Geo-location statistics (optional, with consent)
- A/B testing capabilities

---

**Questions?** Check the main README.md or create an issue on GitHub.
