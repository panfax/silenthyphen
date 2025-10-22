# SilentHyphen - Quick Start Guide

## 🎯 Your Domain
**https://silenthyphen.logicline.dev**

---

## ⚡ 3-Step Deployment

### 1. Cloudflare (2 minutes)

**DNS → Add Record:**
```
Type: A
Name: silenthyphen
IPv4: YOUR_HETZNER_IP
Proxy: ☁️ ON (orange cloud)
```

**SSL/TLS → Overview:**
```
Encryption mode: Full (strict)
☑️ Always Use HTTPS
☑️ Automatic HTTPS Rewrites
```

---

### 2. GitHub (1 minute)

```bash
cd /home/alexanderknor/logicline/hyphenation
git init
git add .
git commit -m "SilentHyphen v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/silenthyphen.git
git push -u origin main
```

---

### 3. Hetzner Server (5 minutes)

```bash
# SSH into server
ssh your-user@YOUR_HETZNER_IP

# Clone and build
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/silenthyphen.git
cd silenthyphen
sudo npm install
sudo npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/silenthyphen
```

**Paste this config:**
```nginx
server {
    listen 80;
    server_name silenthyphen.logicline.dev;
    root /var/www/silenthyphen/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Enable and test:**
```bash
sudo ln -s /etc/nginx/sites-available/silenthyphen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Optional: SSL certificate
sudo certbot --nginx -d silenthyphen.logicline.dev
```

---

## ✅ Test

Visit: **https://silenthyphen.logicline.dev**

---

## 🔄 Future Updates

**Local:**
```bash
git add .
git commit -m "Update description"
git push
```

**Server:**
```bash
cd /var/www/silenthyphen
sudo git pull
sudo npm install
sudo npm run build
sudo systemctl reload nginx
```

---

## 🆘 Troubleshooting

**502 Bad Gateway:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Check DNS:**
```bash
dig silenthyphen.logicline.dev
```

**Clear Cloudflare cache:**
Dashboard → Caching → Purge Everything

---

Need detailed docs? See **DEPLOYMENT.md**
