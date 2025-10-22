# SilentHyphen - Deployment Guide

## Quick Summary

**What you need on Cloudflare:**
- A Record pointing to your Hetzner server IP
- Proxied (orange cloud) enabled
- SSL/TLS set to "Full" or "Full (strict)"

---

## Complete Deployment Steps

### 1. Cloudflare DNS Setup

Go to Cloudflare → Your Domain → DNS → Records

**Add A Record:**
```
Type: A
Name: silenthyphen
IPv4: YOUR_HETZNER_IP
Proxy: ON (orange cloud)
TTL: Auto

Result: silenthyphen.logicline.dev
```

**Cloudflare SSL Settings:**
1. Go to SSL/TLS → Overview
2. Set encryption mode: **Full (strict)**
3. Enable:
   - Always Use HTTPS
   - Automatic HTTPS Rewrites
   - Minimum TLS Version: 1.2

---

### 2. GitHub Repository

```bash
cd /home/alexanderknor/logicline/hyphenation

# Initialize git
git init
git add .
git commit -m "Initial commit: SilentHyphen"
git branch -M main

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/silenthyphen.git
git push -u origin main
```

---

### 3. Hetzner Server Setup

**SSH into your server:**
```bash
ssh your-user@YOUR_HETZNER_IP
```

**Install Node.js (if not installed):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Install Nginx (if not installed):**
```bash
sudo apt update
sudo apt install nginx
```

**Clone and build:**
```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/silenthyphen.git
cd silenthyphen
sudo npm install
sudo npm run build
```

**Create Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/silenthyphen
```

Paste this:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name silenthyphen.logicline.dev;

    root /var/www/silenthyphen/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Deny hidden files
    location ~ /\. {
        deny all;
    }
}
```

Save and exit (Ctrl+X, Y, Enter)

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/silenthyphen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Install SSL (optional, Cloudflare handles SSL but good for origin):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d silenthyphen.logicline.dev
```

---

### 4. Test Your Deployment

Visit: `https://silenthyphen.logicline.dev`

You should see SilentHyphen running!

---

## Updating After Changes

**Option A: Manual update**
```bash
# Local machine
git add .
git commit -m "Update description"
git push

# Server
ssh your-user@YOUR_HETZNER_IP
cd /var/www/silenthyphen
sudo git pull
sudo npm install
sudo npm run build
sudo systemctl reload nginx
```

**Option B: Using deployment script**
```bash
# Local machine
./deploy.sh
git push

# Server (copy script first time)
scp deploy-server.sh your-user@YOUR_HETZNER_IP:/var/www/silenthyphen/
ssh your-user@YOUR_HETZNER_IP
cd /var/www/silenthyphen
sudo ./deploy-server.sh
```

---

## Troubleshooting

**Cloudflare shows "502 Bad Gateway":**
- Check Nginx is running: `sudo systemctl status nginx`
- Check Nginx config: `sudo nginx -t`
- Check DNS propagation: `dig silenthyphen.logicline.dev`

**Files not updating:**
- Clear Cloudflare cache: Dashboard → Caching → Purge Everything
- Hard refresh browser: Ctrl+Shift+R

**SSL errors:**
- Verify Cloudflare SSL mode is "Full" not "Flexible"
- Check origin certificate on server

**Port issues:**
- Ensure port 80 and 443 are open: `sudo ufw status`
- Allow if needed: `sudo ufw allow 80` and `sudo ufw allow 443`

---

## Your Domain

Your SilentHyphen instance will be at:
- `https://silenthyphen.logicline.dev`

To change subdomain:
- Change DNS A Record name in Cloudflare
- Update `server_name` in Nginx config
- Reload Nginx

---

## Security Best Practices

1. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   ```

2. **Enable Cloudflare security features:**
   - Bot Fight Mode
   - Security Level: Medium or High
   - Challenge Passage: 30 minutes

3. **Server hardening:**
   - Keep server packages updated: `sudo apt update && sudo apt upgrade`
   - Configure firewall properly
   - Regular backups

---

## Performance Optimization

**Cloudflare Caching:**
1. Go to Caching → Configuration
2. Enable "Always Online"
3. Set Browser Cache TTL: 1 year
4. Enable "Cache Everything" page rule for static assets

**Nginx Caching (optional):**
Add to Nginx config for aggressive caching:
```nginx
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Monitoring

Check logs if issues occur:
```bash
# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Cloudflare analytics
# Dashboard → Analytics & Logs
```

---

Need help? Check the main README.md or create an issue on GitHub.
