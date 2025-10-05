# Backend API Setup Guide

This project uses a **dual-backend architecture**:
- **MediaPipe Backend (Port 8001)**: Face detection, eye tracking, WebSocket
- **Gemini AI Backend (Port 8002)**: AI coaching, session analysis (TypeScript, runs in this project)

## 🏗️ Architecture Overview

```
Frontend (5173) ──┬──> MediaPipe Backend (8001) - Face/Eye Tracking
                  └──> Gemini Backend (8002)    - AI Insights
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all necessary dependencies including:
- `express` - Web framework
- `@google/generative-ai` - Gemini AI SDK
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `tsx` - TypeScript execution
- `concurrently` - Run multiple commands

### 2. Configure Environment Variables

Update the `.env` file with your Gemini API key:

```env
# MediaPipe Backend (Face Detection)
VITE_MEDIAPIPE_API_URL=http://localhost:8001

# Gemini AI Backend (Chat & Insights)
VITE_GEMINI_API_URL=http://localhost:8002
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=8002
```

**Get your Gemini API key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and paste it into your `.env` file

### 3. Run the Development Servers

**⚠️ Important:** You need to run BOTH backends:

#### Start Gemini Backend (Port 8002)

```bash
npm run dev:all
```

This will start:
- Vite dev server on `http://localhost:5173`
- Gemini API server on `http://localhost:8002`

#### Start MediaPipe Backend (Port 8001) - Separately

```bash
cd ../backend
python main.py  # or your MediaPipe backend start command
```

Now you have all three services running:
- ✅ Frontend: http://localhost:5173
- ✅ Gemini Backend: http://localhost:8002
- ✅ MediaPipe Backend: http://localhost:8001

#### Alternative: Run Separately

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Gemini Backend:
```bash
npm run dev:api
```

Terminal 3 - MediaPipe Backend:
```bash
cd ../backend && python main.py
```

## 📡 API Endpoints

### Gemini AI Backend (Port 8002)

### Health Check
```
GET http://localhost:8002/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-05T12:00:00.000Z",
  "geminiConfigured": true
}
```

### MediaPipe Backend (Port 8001)
**Note:** This is a separate backend (Python/FastAPI). Endpoints include:
- `GET /ai-messages` - Vibe-based motivational messages
- `POST /session/api/tts` - Text-to-speech audio
- `WebSocket /ws/study` - Real-time video frame processing

---

### 1. Micro-Nudge Generation (Gemini)

**Endpoint:** `POST /api/micro-nudge`
**Port:** 8002 (Gemini Backend)

**Request:**
```json
{
  "distraction_count": 3,
  "recent_events": [
    {
      "timestamp": 1696512000000,
      "type": "distraction",
      "count": 1
    }
  ],
  "session_duration": 420,
  "vibe": "calm"
}
```

**Response:**
```json
{
  "nudge": {
    "type": "breathing",
    "message": "Take a deep breath. Inhale 4, hold 4, exhale 4."
  }
}
```

### 2. Study Debrief Generation (Gemini)

**Endpoint:** `POST /api/study-debrief`
**Port:** 8002 (Gemini Backend)

**Request:**
```json
{
  "duration": 25,
  "vibe": "calm",
  "distraction_history": [],
  "total_distractions": 3,
  "focus_score": 78
}
```

**Response:**
```json
{
  "summary": "Great job maintaining focus!",
  "strengths": ["strength 1", "strength 2"],
  "triggers": [],
  "actionable_habits": ["habit 1", "habit 2"],
  "focus_streaks": [],
  "overall_score": 78
}
```

### 3. Learning Roadmap Generation (Gemini)

**Endpoint:** `POST /api/roadmap`
**Port:** 8002 (Gemini Backend)

**Request:**
```json
{
  "topic": "Machine Learning"
}
```

**Response:**
```json
{
  "topic": "Machine Learning",
  "stages": [
    {
      "title": "Foundations",
      "subtopics": ["Linear Algebra", "Calculus", "Statistics", "Python Programming"],
      "projects": ["Iris Classification", "Housing Price Prediction"]
    },
    {
      "title": "Intermediate Skills",
      "subtopics": ["Neural Networks", "Deep Learning", "CNNs", "RNNs"],
      "projects": ["Image Recognition", "Sentiment Analysis"]
    }
  ]
}
```

### 4. Feedback Submission (Gemini)

**Endpoint:** `POST /api/feedback`
**Port:** 8002 (Gemini Backend)

**Request:**
```json
{
  "session_id": 1696512000000,
  "corrected_events": [],
  "false_positive_count": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your feedback!"
}
```

## 🧪 Testing the API

### Using cURL

```bash
# Health check (Gemini Backend)
curl http://localhost:8002/health

# Test micro-nudge (Gemini Backend)
curl -X POST http://localhost:8002/api/micro-nudge \
  -H "Content-Type: application/json" \
  -d '{
    "distraction_count": 3,
    "recent_events": [],
    "session_duration": 420,
    "vibe": "calm"
  }'

# Test study debrief (Gemini Backend)
curl -X POST http://localhost:8002/api/study-debrief \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 25,
    "vibe": "calm",
    "distraction_history": [],
    "total_distractions": 3,
    "focus_score": 78
  }'

# Test roadmap generation (Gemini Backend)
curl -X POST http://localhost:8002/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"topic": "React.js"}'

# Test MediaPipe Backend
curl http://localhost:8001/ai-messages?vibe=calm&duration=25
```

### Using Thunder Client / Postman

1. Import the endpoints above
2. Set Content-Type to `application/json`
3. Send requests with the example payloads

## 🛠️ Project Structure

```
src/
├── api/
│   └── server.ts          # Gemini AI Express server (Port 8002)
├── components/
│   ├── MicroNudge.tsx     # Calls Gemini /api/micro-nudge
│   └── StudyDebrief.tsx   # Calls Gemini /api/study-debrief
└── pages/
    ├── Session.tsx        # Calls both MediaPipe & Gemini APIs
    └── PostSession.tsx    # Displays StudyDebrief component
```

**API Call Distribution:**
- `Session.tsx` → MediaPipe (WebSocket, TTS) + Gemini (micro-nudges)
- `StudyDebrief.tsx` → Gemini (debrief, feedback)
- `Roadmap.tsx` → Gemini (roadmap generation)

## 🔧 Troubleshooting

### Gemini API Key Issues

**Error:** `⚠️ GEMINI_API_KEY not found in environment variables`

**Solution:**
1. Make sure you've added `GEMINI_API_KEY` to your `.env` file
2. Restart the API server after updating `.env`
3. Check that the key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::8002`

**Solution:**
1. Check if Gemini backend is already running:
   ```bash
   lsof -ti:8002
   ```
2. Kill the process or change the port in `.env`:
   ```env
   PORT=8003
   VITE_GEMINI_API_URL=http://localhost:8003
   ```
3. Restart the server

### MediaPipe Backend Not Running

**Error:** `WebSocket connection failed` or `Cannot GET /ai-messages`

**Solution:**
1. Make sure MediaPipe backend (port 8001) is running separately
2. Check if the backend folder exists: `ls ../backend`
3. Start MediaPipe backend:
   ```bash
   cd ../backend && python main.py
   ```

### Mixed Port Configuration

**Error:** APIs not responding or mixing up backends

**Solution:**
Check your `.env` file has TWO separate URLs:
```env
VITE_MEDIAPIPE_API_URL=http://localhost:8001  # Face detection
VITE_GEMINI_API_URL=http://localhost:8002      # AI insights
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::8001`

**Solution:**
1. Change the port in `.env`:
   ```env
   PORT=8003
   ```
2. Update frontend Gemini API URL:
   ```env
   VITE_GEMINI_API_URL=http://localhost:8003
   ```
3. Restart Gemini backend server

### CORS Issues

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
The API is configured to allow requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)

If you're running on a different port, update `src/api/server.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:YOUR_PORT'],
  credentials: true
}));
```

## 📦 Production Deployment

### Building for Production

```bash
# Build frontend
npm run build

# The API server can be run directly with:
node --loader tsx src/api/server.ts
```

### Environment Variables for Production

Create a `.env.production` file:
```env
VITE_API_BASE_URL=https://your-api-domain.com
GEMINI_API_KEY=your_production_api_key
PORT=8001
NODE_ENV=production
```

### Deployment Platforms

**Recommended Setup:**
- Frontend: Vercel, Netlify, or GitHub Pages
- Backend API: Railway, Render, or Fly.io

**Example (Railway):**
1. Create new project on Railway
2. Add environment variables
3. Deploy from GitHub
4. Update frontend `.env` with Railway API URL

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use environment variables** - Never hardcode API keys
3. **Rate limiting** - Add rate limiting in production
4. **HTTPS only** - Use HTTPS in production
5. **API key rotation** - Regularly rotate your Gemini API key

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Add Gemini API key to `.env`
3. ✅ Run dev servers: `npm run dev:all`
4. ✅ Test endpoints with cURL or Postman
5. ✅ Start using the app!

## 💡 Tips

- Use `npm run dev:all` to run both servers with one command
- API changes auto-reload thanks to `tsx watch`
- Frontend changes auto-reload thanks to Vite HMR
- Check console for helpful logs and error messages
