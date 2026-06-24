# Chat TPG Portfolio — Contabo VPS Deployment Guide

A self-hosted Express server. No Vercel, no serverless functions —
this runs as a normal Node process on your own VPS, kept alive with PM2
and served to the internet through Nginx.

## Project Structure
```
chat-tpg-port/
├── server.js              ← Express app entrypoint
├── routes/
│   ├── upload.js          ← POST /api/upload  → uploads to Cloudinary
│   └── portfolio.js       ← GET/DELETE /api/portfolio
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── package.json
├── ecosystem.config.js    ← PM2 process config
├── nginx.conf.example     ← Reverse proxy config
├── .env.example           ← Copy to .env and fill in
└── README.md
```

---

## Step 1 — Get Your Cloudinary Credentials (Free)

1. Go to https://cloudinary.com and create a free account.
2. On your dashboard you'll see three things — copy them:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. The free tier gives you 25GB storage and 25GB bandwidth/month.

---

## Step 2 — Get the Project Onto Your Contabo VPS

From your local machine, push this folder to a GitHub repo, then on the VPS:

```bash
ssh youruser@your-vps-ip
git clone https://github.com/yourname/chat-tpg-port.git
cd chat-tpg-port
```

(Or `scp -r` the folder directly to the VPS if you'd rather skip GitHub.)

---

## Step 3 — Install Node.js & PM2 on the VPS (one-time setup)

```bash
# Node 18+ via NodeSource (skip if already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

node -v   # confirm v18 or higher

# PM2 keeps the app running and restarts it if it crashes or the VPS reboots
sudo npm install -g pm2
```

---

## Step 4 — Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Fill in:
```
PORT=3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_PASSWORD=choose_a_strong_password
```

`.env` is never committed to GitHub — it stays only on the VPS.

---

## Step 5 — Install Dependencies & Start the App

```bash
npm install
pm2 start ecosystem.config.js
pm2 save                     # remember this process across reboots
pm2 startup                  # prints a command — run the one it gives you
```

Check it's alive:
```bash
pm2 status
pm2 logs chat-tpg-portfolio
curl http://localhost:3000   # should return the HTML page
```

---

## Step 6 — Put Nginx in Front of It (so port 80/443 work)

```bash
sudo apt-get install -y nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/chat-tpg-portfolio
sudo nano /etc/nginx/sites-available/chat-tpg-portfolio   # set your real domain
sudo ln -s /etc/nginx/sites-available/chat-tpg-portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Point your domain's DNS A record at the VPS's IP address, then visit
`http://your-domain.com` — you should see the portfolio.

---

## Step 7 — Add Free HTTPS

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot edits the Nginx config for you and auto-renews the certificate.

---

## Updating the Site Later

```bash
cd chat-tpg-port
git pull                 # or re-upload changed files
npm install               # only needed if dependencies changed
pm2 restart chat-tpg-portfolio
```

---

## How It Works (no database)

- Uploads go straight from the browser to `/api/upload`, which forwards
  them to Cloudinary and tags each one with its category and title.
- `/api/portfolio` asks Cloudinary for everything in the
  `chat-tpg-portfolio` folder and reconstructs the list from those tags.
- Cloudinary is the only place media and metadata live — no Postgres,
  Mongo, or local disk storage to manage on the VPS.

---

## Personalizing

Open `public/index.html` and update:
- Email: search for `tabiagwe247@gmail.com`
- WhatsApp number: search for `wa.me/650716480`
- LinkedIn / GitHub links: search `.contact-card`
- About text: inside `.about-text`

---

## Troubleshooting

**"Upload failed"** → check `CLOUDINARY_API_SECRET` in `.env`, then `pm2 restart chat-tpg-portfolio` so the new env loads.
**"Could not load portfolio"** → run `pm2 logs chat-tpg-portfolio` and check for a Cloudinary auth error.
**502 Bad Gateway from Nginx** → the Node process probably isn't running; check `pm2 status`.
**Changes to .env not taking effect** → PM2 caches env vars at start; always `pm2 restart` (not just reload) after editing `.env`.
