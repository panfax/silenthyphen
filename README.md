# SilentHyphen

A professional web application for inserting soft hyphens (`&shy;` or U+00AD) into German and English text, enabling responsive typography for CMS platforms like Shopware.

**By LogicLine**

## Features

- **Multilingual Support**: German and English with extensible architecture for additional languages
- **Intelligent Hyphenation**: Dictionary-based patterns via Hypher library
- **Safety Guards**: Protects URLs, emails, IDs, version numbers, ALL-CAPS acronyms, and code blocks
- **HTML Mode**: Preserves tags and entities while hyphenating text content
- **Dual Output**: Choose between HTML entities (`&shy;`) or Unicode (U+00AD)
- **Live Preview**: See how text wraps with CSS controls (`hyphens`, `overflow-wrap`)
- **Language Auto-Detection**: Heuristic-based detection with manual override
- **Performance**: Web Worker processing for large texts (50k+ characters)
- **Export Options**: Copy to clipboard, download as .txt or .html

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

### Run Tests

```bash
npm test
npm run test:ui  # Visual test UI
```

### Linting & Formatting

```bash
npm run lint
npm run typecheck
npm run format
```

## Understanding Soft Hyphens

### What is a Soft Hyphen?

A **soft hyphen** (U+00AD / `&shy;`) is an invisible character that tells the browser: "You may break the line here and insert a visible hyphen if needed."

Unlike regular hyphens (`-`), soft hyphens:
- Are invisible when the word fits on one line
- Only appear when the browser needs to break the word
- Enable professional-quality text wrapping in narrow containers

### Why Use Soft Hyphens?

Modern CMS platforms and e-commerce sites often display product descriptions, specifications, and marketing copy in responsive layouts. Long German compound words (like "Ladungssicherungssystem") or technical English terms can cause:

- Awkward line breaks
- Horizontal scrolling on mobile
- Rivers of whitespace in justified text
- Broken layouts

Soft hyphens solve these issues while remaining invisible in wide layouts.

### `&shy;` vs U+00AD

Both represent the same character:

- **`&shy;`** (HTML entity): Use for HTML content, CMS fields, web editors
- **U+00AD** (Unicode): Use for plain text, databases, non-HTML workflows

This tool supports both. Choose based on your target system.

## Usage Guide

### Basic Workflow

1. **Input**: Paste or type text in the left panel
2. **Language**: Auto-detect or manually select German/English
3. **Process**: Text is automatically hyphenated (300ms debounce)
4. **Output**: Review hyphenated text in the middle panel
5. **Preview**: See live rendering with CSS controls in the right panel
6. **Export**: Copy or download the result

### HTML Mode

Enable **HTML Mode** to process HTML content:

```html
<p>Die <strong>Ladungssicherung</strong> ist wichtig.</p>
```

The tool will:
- Preserve all tags (`<p>`, `<strong>`, etc.)
- Preserve entities (`&nbsp;`, `&amp;`, etc.)
- Only hyphenate text nodes

### Preview Controls

- **Reveal Hyphens**: Highlight soft hyphen positions (yellow markers)
- **hyphens: manual**: Browser uses only soft hyphens you provide
- **hyphens: auto**: Browser adds additional hyphens (requires `lang` attribute)
- **overflow-wrap: anywhere**: Allows breaking anywhere if no hyphen found

### Language Detection

The auto-detect feature uses:
- German-specific characters (ä, ö, ü, ß)
- Common word patterns
- Character n-grams

Confidence is displayed as a percentage. Override if detection is incorrect.

## Architecture

### Core Components

```
src/
├── hyphenation/           # Core engine
│   ├── engine.ts          # Main hyphenation logic
│   ├── guards.ts          # Protection system
│   ├── sanitize.ts        # HTML tokenizer
│   ├── registry.ts        # Language registry
│   └── languages/         # Language packs
│       ├── de.ts          # German (ck rule, patterns)
│       └── en.ts          # English
├── worker/                # Web Worker
│   └── hyphenate.worker.ts
├── lib/                   # Utilities
│   ├── langDetect.ts      # Auto-detection
│   ├── storage.ts         # localStorage persistence
│   └── examples.ts        # Demo texts
├── components/            # React UI
│   ├── Editor.tsx         # Input panel
│   ├── Output.tsx         # Result panel
│   ├── Preview.tsx        # Live preview
│   └── Header.tsx         # Settings
└── context/
    └── AppContext.tsx     # State management
```

### Processing Pipeline

1. **Tokenization**: Split text into words, whitespace, protected segments
2. **Guard Application**: Identify URLs, emails, IDs, ALL-CAPS, etc.
3. **Language-Specific Rules**: Apply German ck-rule, min word length
4. **Hypher Processing**: Dictionary-based syllable splitting
5. **Post-Processing**: Language-specific adjustments
6. **Encoding**: Convert to `&shy;` or U+00AD

## Adding a New Language

### Step 1: Install Patterns

```bash
npm install hyphenation.fr  # Example: French
```

### Step 2: Create Language Pack

Create `src/hyphenation/languages/fr.ts`:

```typescript
import type { LanguagePack } from '../LanguagePack';
import frPatterns from 'hyphenation.fr';

export const frenchLanguagePack: LanguagePack = {
  id: 'fr',
  displayName: 'Français',
  minWordLength: 5,
  patterns: frPatterns,

  // Optional: custom post-processing
  postProcess: (word, hyphenated) => {
    // Apply French-specific rules
    return hyphenated;
  },

  // Optional: additional skip rules
  shouldSkip: (word) => {
    return word.length < 5;
  },
};
```

### Step 3: Register Language

Edit `src/hyphenation/registry.ts`:

```typescript
import { frenchLanguagePack } from './languages/fr';

constructor() {
  this.register(germanLanguagePack);
  this.register(englishLanguagePack);
  this.register(frenchLanguagePack);  // Add this
}
```

### Step 4: Update UI

Add French to language selector in `src/components/Header.tsx`.

Update auto-detection in `src/lib/langDetect.ts` (optional).

### Step 5: Add Tests

Create `tests/french.test.ts` with test cases for French hyphenation rules.

## Configuration

### Changing Default Settings

Edit `src/lib/storage.ts`:

```typescript
const DEFAULT_SETTINGS: UserSettings = {
  language: 'auto',        // 'auto' | 'de' | 'en'
  encoding: 'html',        // 'html' | 'unicode'
  htmlMode: false,
  revealHyphens: false,
  previewHyphens: 'manual',
  previewOverflowWrap: 'normal',
  previewWordBreak: 'normal',
};
```

### Guard Patterns

Customize protection rules in `src/hyphenation/guards.ts`:

```typescript
const URL_PATTERN = /^(?:https?|ftp|file):\/\/.../;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@.../;
// Add custom patterns
```

## Deployment

### Production Deployment to Hetzner Server

**Prerequisites:**
- Hetzner server with Nginx installed
- Domain managed by Cloudflare
- GitHub account

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: SilentHyphen"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/silenthyphen.git
git push -u origin main
```

**Step 2: Cloudflare DNS Setup**
1. Log into Cloudflare dashboard
2. Select your domain
3. Go to **DNS** > **Records**
4. Add an **A Record**:
   - **Type**: A
   - **Name**: silenthyphen
   - **IPv4 address**: Your Hetzner server IP
   - **Proxy status**: Proxied (orange cloud) ✓
   - **TTL**: Auto
   - **Result**: silenthyphen.logicline.dev
5. Save

**Step 3: Deploy to Hetzner Server**
```bash
# SSH into your server
ssh your-user@your-hetzner-ip

# Clone the repository
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/silenthyphen.git
cd silenthyphen

# Install dependencies and build
sudo npm install
sudo npm run build

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/silenthyphen
```

Paste this Nginx config:
```nginx
server {
    listen 80;
    server_name silenthyphen.logicline.dev;

    root /var/www/silenthyphen/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/silenthyphen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL certificate (Cloudflare handles SSL, but set up origin cert)
# Or use Let's Encrypt for origin:
sudo certbot --nginx -d silenthyphen.logicline.dev
```

**Step 4: Cloudflare SSL Settings**
1. In Cloudflare dashboard → **SSL/TLS**
2. Set encryption mode to **Full (strict)** or **Full**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

**Step 5: Updates via Git**
```bash
# On your server, to update:
cd /var/www/silenthyphen
sudo git pull
sudo npm install
sudo npm run build
sudo systemctl reload nginx
```

### Docker Alternative

```bash
docker build -t silenthyphen .
docker run -p 8080:80 silenthyphen
```

Then use Nginx as reverse proxy to the Docker container.

### Other Hosting Options

The `dist/` folder can be deployed to:
- Netlify (automatic with GitHub)
- Vercel (automatic with GitHub)
- GitHub Pages
- Cloudflare Pages
- Any static hosting service

```bash
npm run build
# Upload dist/ folder
```

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile browsers: Modern versions

Requires:
- Web Workers
- ES2020
- CSS `hyphens` property (for preview)

## Performance

- **Small texts** (< 1k chars): < 10ms
- **Medium texts** (1k-10k chars): 10-50ms
- **Large texts** (10k-50k chars): 50-500ms
- **Very large texts** (50k+ chars): 500ms-2s

Processing happens in a Web Worker, keeping the UI responsive.

## Known Limitations

1. **Language Detection**: Heuristic-based; short texts may be misidentified
2. **Hyphenation Quality**: Depends on Hypher pattern completeness
3. **HTML Parsing**: Complex nested structures may have edge cases
4. **Browser Rendering**: Preview may differ from actual CMS rendering

## Troubleshooting

### Hyphens Don't Appear in Preview

- Check **hyphens: manual** is selected
- Ensure soft hyphens are present (use "Reveal Hyphens")
- Make preview container narrower to force line breaks

### Guards Not Working

- Verify pattern in `src/hyphenation/guards.ts`
- Check token type in browser console
- Add custom guard in language pack's `shouldSkip`

### Performance Issues

- Use Web Worker (enabled by default)
- Process text in chunks for 100k+ characters
- Reduce debounce delay in `AppContext.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-language`)
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Run linter and fix issues (`npm run lint`)
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

- **Hypher**: [bramstein/hypher](https://github.com/bramstein/hypher)
- **Hyphenation patterns**: [bramstein/hyphenation-patterns](https://github.com/bramstein/hyphenation-patterns)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide](https://lucide.dev/)

---

**SilentHyphen** - Built with React, TypeScript, and Vite by [LogicLine](https://logicline.de)
