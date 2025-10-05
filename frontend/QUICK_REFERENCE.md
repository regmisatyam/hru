# Quick Reference: Dual Backend Setup

## 🎯 At a Glance

Your Focus-Bolt project now has **TWO separate backends**:

| Backend | Port | Purpose | Technology | Location |
|---------|------|---------|------------|----------|
| **MediaPipe** | 8001 | Face/eye tracking, WebSocket | Python/FastAPI | `../backend/` (separate) |
| **Gemini AI** | 8002 | AI coaching & insights | TypeScript/Express | `src/api/server.ts` |

## 🚀 How to Start Everything

```bash
# 1. Start Gemini Backend + Frontend (one command)
npm run dev:all

# 2. Start MediaPipe Backend (separate terminal)
cd ../backend && python main.py
```

Now you have:
- ✅ Frontend: http://localhost:5173
- ✅ Gemini API: http://localhost:8002
- ✅ MediaPipe API: http://localhost:8001

## 📱 Which Component Calls Which Backend?

### Session.tsx
```typescript
// Uses BOTH backends:
const MEDIAPIPE_API_URL = import.meta.env.VITE_MEDIAPIPE_API_URL; // 8001
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;       // 8002

// MediaPipe calls:
- WebSocket connection for video frames
- GET /ai-messages for motivational text
- POST /session/api/tts for text-to-speech

// Gemini calls:
- POST /api/micro-nudge for real-time coaching tips
```

### StudyDebrief.tsx
```typescript
// Uses ONLY Gemini:
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL; // 8002

// Gemini calls:
- POST /api/study-debrief for session analysis
- POST /api/feedback for false-positive corrections
```

## 🔧 Environment Variables Explained

```env
# .env file should have:

# MediaPipe Backend (external Python server)
VITE_MEDIAPIPE_API_URL=http://localhost:8001

# Gemini Backend (TypeScript server in this project)
VITE_GEMINI_API_URL=http://localhost:8002
GEMINI_API_KEY=AIzaSy...your_key_here
PORT=8002
```

**Why two URLs?**
- `VITE_MEDIAPIPE_API_URL` → Used by frontend to call MediaPipe
- `VITE_GEMINI_API_URL` → Used by frontend to call Gemini
- `PORT` → Used by Gemini backend server to know which port to run on

## 🧪 Quick Test Commands

```bash
# Test Gemini Backend
curl http://localhost:8002/health

# Test MediaPipe Backend
curl http://localhost:8001/ai-messages?vibe=calm&duration=25

# Test Gemini Micro-Nudge
curl -X POST http://localhost:8002/api/micro-nudge \
  -H "Content-Type: application/json" \
  -d '{"distraction_count": 3, "vibe": "calm", "session_duration": 300}'
```

## 🐛 Common Issues

### "WebSocket connection failed"
**Problem:** MediaPipe backend (8001) not running  
**Fix:** `cd ../backend && python main.py`

### "Cannot fetch micro-nudge"
**Problem:** Gemini backend (8002) not running or API key missing  
**Fix:** 
1. Check `.env` has `GEMINI_API_KEY=AIza...`
2. Run `npm run dev:api` or `npm run dev:all`

### "Port 8002 already in use"
**Problem:** Gemini backend already running  
**Fix:** `lsof -ti:8002 | xargs kill` then restart

### "Cannot find module 'express'"
**Problem:** Dependencies not installed  
**Fix:** `npm install`

## 📁 File Changes Summary

**Updated Files:**
- ✅ `.env` - Now has TWO API URLs
- ✅ `Session.tsx` - Uses both MEDIAPIPE_API_URL and GEMINI_API_URL
- ✅ `StudyDebrief.tsx` - Uses GEMINI_API_URL
- ✅ `server.ts` - Runs on port 8002

**New Files:**
- ✅ `ARCHITECTURE.md` - Detailed system design
- ✅ `QUICK_REFERENCE.md` - This file!

## 🎓 Remember

- **8001 = MediaPipe** = Face tracking, WebSocket, TTS
- **8002 = Gemini** = AI coaching, session insights
- **5173 = Frontend** = React app that talks to both

Both backends must be running for full functionality!
