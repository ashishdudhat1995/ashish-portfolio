# Production Deployment & Infrastructure Guide

This guide provides end-to-end instructions for deploying the Portfolio + Admin CMS application to production environments.

---

## 1. System Requirements & Prerequisites

- **Node.js**: v18.x or v20.x LTS
- **Package Manager**: `npm` (v9+) or `pnpm`
- **Database**: PostgreSQL 14+
- **Process Manager**: PM2, Docker, or systemd
- **Reverse Proxy**: Nginx, Caddy, or Cloudflare

---

## 2. Production Topology

```
Internet
   │
[HTTPS / SSL / CDN (Cloudflare / Nginx)]
   │ (Reverse Proxy)
[Node.js Express API & Static Server (Port 5000)]
   ├── PostgreSQL Database (Prisma ORM)
   └── Media Storage (Local /uploads or AWS S3)
```

---

## 3. Deployment Steps

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/ashish-portfolio.git
cd ashish-portfolio
npm ci
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and fill in production secrets:

```bash
cp .env.example .env
```

Ensure the following production flags are set:
```ini
NODE_ENV="production"
PORT=5000
DATABASE_URL="postgresql://user:password@db-host:5432/ashish_portfolio?sslmode=require"
ADMIN_SESSION_DURATION=86400
ADMIN_EMAIL="dudhatashish1995@gmail.com"
ADMIN_PASSWORD="YourStrongCustomPasswordHere"
ADMIN_ALLOWED_ORIGINS="https://yourdomain.com"
CLIENT_ORIGIN="https://yourdomain.com"
MAX_RESUME_SIZE_MB=10
```

### Step 3: Run Database Migrations & Seed Initial Data
```bash
# Execute Prisma production migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed initial admin account and resume data (Idempotent)
node server/seed.js
```

### Step 4: Build Frontend Assets & Start Express Server
```bash
# Build optimized Vite production bundle
npm run build

# Start Express server via PM2 or node
npx pm2 start server/index.js --name "ashish-portfolio-api"
```

---

## 4. Reverse Proxy & Nginx Configuration

Sample Nginx server block with HTTPS, Gzip, and static asset caching:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /path/to/ashish-portfolio/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }
}
```

---

## 5. Health Check Endpoint

Verify application health by sending a GET request to:
```
GET /api/health
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-02T19:17:00.000Z",
  "database": "connected"
}
```
