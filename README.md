# Chat TPG Portfolio — Vercel + Cloudinary Deployment Guide

## Project Structure
```
chat-tpg-vercel/
├── api/
│   ├── upload.js       ← Handles file uploads to Cloudinary
│   └── portfolio.js    ← Lists & deletes portfolio items
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── package.json
├── vercel.json
└── README.md
```

---

## Step 1 — Get Your Cloudinary Credentials (Free)

1. Go to https://cloudinary.com and create a free account
2. On your dashboard you'll see 3 things — copy them:
   - **Cloud Name** (e.g. `dxyz12345`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcDEFghiJKLmnoPQRstu`)
3. Free tier gives you **25GB storage** and **25GB bandwidth/month** — more than enough to start

---

## Step 2 — Deploy to Vercel

### Option A: Vercel CLI (recommended since you're advanced)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate into your project folder
cd chat-tpg-vercel

# 3. Install dependencies
npm install

# 4. Login to Vercel
vercel login

# 5. Deploy (first time — follow the prompts)
vercel

# 6. Add your Cloudinary environment variables
vercel env add CLOUDINARY_CLOUD_NAME
# → paste your cloud name when prompted

vercel env add CLOUDINARY_API_KEY
# → paste your API key

vercel env add CLOUDINARY_API_SECRET
# → paste your API secret

# 7. Redeploy so the env vars take effect
vercel --prod
```

### Option B: Vercel Dashboard (drag & drop)

1. Go to https://vercel.com/new
2. Import your GitHub repo OR drag the entire `chat-tpg-vercel` folder
3. In **Settings → Environment Variables**, add:
   | Name                     | Value             |
   |--------------------------|-------------------|
   | CLOUDINARY_CLOUD_NAME    | your_cloud_name   |
   | CLOUDINARY_API_KEY       | your_api_key      |
   | CLOUDINARY_API_SECRET    | your_api_secret   |
4. Click **Deploy**

---

## Step 3 — Test It

After deployment, visit your Vercel URL (e.g. `https://chat-tpg.vercel.app`):
- Click **+ Upload Work**
- Upload a flyer image or video
- It should appear in your portfolio grid within seconds
- Anyone with your Vercel URL can view your portfolio

---

## Step 4 — Custom Domain (Optional)

In Vercel dashboard → Settings → Domains → Add your domain (e.g. `chattpg.com`)

---

## How it works (no database!)

- When you upload a file, it goes directly to **Cloudinary** via `/api/upload`
- Cloudinary stores the file AND its metadata (title, category, description) as "context tags"
- When the page loads, `/api/portfolio` searches Cloudinary for all files in your folder
- No external database (Mongo, Postgres, etc.) needed at all

---

## Personalizing

Open `public/index.html` and update:
- Email: search `chattpg@email.com`
- Social links: find the 4 `.social-link` anchor tags
- About text: find the `<p>` tags inside `.about-text`

---

## Troubleshooting

**"Upload failed"** → Double-check your CLOUDINARY_API_SECRET in Vercel env vars
**"Could not load portfolio"** → Make sure all 3 env vars are set and you redeployed
**Videos not playing** → Cloudinary free tier supports video; just make sure file < 100MB
