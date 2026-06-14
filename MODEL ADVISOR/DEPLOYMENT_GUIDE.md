# 🚀 Model Advisor - Deployment Guide

## ✨ Your Project is Ready!

You have everything you need to deploy a **completely FREE** AI Model Advisor.

**Total Cost: $0 forever!** 🎉

---

## 📋 Quick Start (20 minutes)

### Step 1: Get FREE API Keys (5 minutes)

**Groq API (FREE):**
1. Go to https://console.groq.com
2. Sign up (no credit card needed)
3. Create API key
4. Copy the key

**Reddit API (FREE):**
1. Go to https://www.reddit.com/prefs/apps
2. Create new "script" app
3. Copy Client ID and Secret

### Step 2: Create .env File

In your project folder, create a file named `.env`:

```
GROQ_API_KEY=gsk_YOUR_KEY_HERE
REDDIT_CLIENT_ID=YOUR_ID_HERE
REDDIT_CLIENT_SECRET=YOUR_SECRET_HERE
REDDIT_USER_AGENT=model-recommender-bot/1.0
```

Replace the `YOUR_KEY_HERE` parts with your actual credentials.

### Step 3: Push to GitHub

```bash
cd "C:\Users\ayushi.gautam\OneDrive - UKG\Desktop\MODEL ADVISOR"

git init
git add .
git commit -m "Initial commit: Model Advisor"
git remote add origin https://github.com/YOUR_USERNAME/model-advisor.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Netlify

1. Go to https://app.netlify.com
2. Click "New site from Git"
3. Connect GitHub (authorize)
4. Select `model-advisor` repo
5. Click "Deploy"
6. Go to **Site settings → Environment**
7. Add environment variables:
   - `GROQ_API_KEY` = your key
   - `REDDIT_CLIENT_ID` = your ID
   - `REDDIT_CLIENT_SECRET` = your secret
   - `REDDIT_USER_AGENT` = `model-recommender-bot/1.0`
8. Trigger redeploy

### Step 5: Test

Visit your Netlify URL and test the form!

---

## 📂 Project Files

```
MODEL ADVISOR/
├── index.html              # Frontend UI (dark theme)
├── functions_api_groq.py   # Backend (Groq - FREE)
├── netlify.toml            # Netlify configuration
├── requirements.txt        # Python dependencies
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
└── DEPLOYMENT_GUIDE.md     # This file
```

---

## 🎯 What You're Deploying

**Frontend:**
- Beautiful dark UI (Groq + Gemini + Kimi aesthetic)
- Responsive design
- Fast and smooth

**Backend:**
- Groq API (FREE - no costs ever)
- Reddit API integration (free community insights)
- Web search via Groq

**Hosting:**
- Frontend on Netlify (free)
- Backend on Netlify Functions (free)
- GitHub for code (free)

**Cost: $0/month forever** ✨

---

## 💡 Features

✅ Find best AI models for any use case
✅ Compare costs (free models first)
✅ See community feedback (Reddit)
✅ Completely free for users
✅ Completely free for you
✅ Open source ready

---

## 🚀 You're All Set!

Just follow the 5 steps above and you'll have a live website in 20 minutes!

**Questions?** 
- Refer to DEPLOYMENT_GUIDE_FREE.md for detailed instructions
- Check index.html for UI code
- Check functions_api_groq.py for backend code

---

**Made with ❤️ for the community** 🎉