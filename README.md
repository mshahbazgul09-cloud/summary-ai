# SummarAI — Media Summarizer

AI-powered video & audio summarizer. Generates transcripts, summaries, action items, and key points.

## Project Structure

```
summarai/
├── api/
│   └── summarize.js      ← Vercel serverless function (keeps API key secret)
├── public/
│   └── index.html        ← Frontend UI
├── vercel.json           ← Vercel routing config
├── .env.example          ← Environment variable template
└── README.md
```

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create summarai --public --push
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Keep all settings as default
4. Click **Deploy**

### 3. Add Environment Variable
In your Vercel project dashboard:
1. Go to **Settings → Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-your-key-here`
3. Click **Save** → then **Redeploy**

That's it! Your app is live. 🎉

## Local Development

```bash
npm install -g vercel
vercel dev
```

Create a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Then visit `http://localhost:3000`
