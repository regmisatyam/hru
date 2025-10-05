# Focus-Bolt Architecture Overview

## 🏗️ System Architecture

This project uses a **dual-backend architecture** to separate concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│                     Port: 5173                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Components:                                        │  │
│  │  - Session.tsx (Main study session)                 │  │
│  │  - MicroNudge.tsx (Real-time notifications)        │  │
│  │  - StudyDebrief.tsx (Post-session analysis)        │  │
│  └─────────────────────────────────────────────────────┘  │
│            │                                  │             │
└────────────┼──────────────────────────────────┼─────────────┘
             │                                  │
             ├──────────────┐                  │
             │              │                  │
             ▼              ▼                  ▼
┌────────────────────┐  ┌────────────────────────────────────┐
│  MediaPipe Backend │  │      Gemini AI Backend (TS)        │
│  Port: 8001        │  │      Port: 8002                    │
│  (External)        │  │      src/api/server.ts             │
│                    │  │                                    │
│  Endpoints:        │  │  Endpoints:                        │
│  - /ws/study       │  │  - /api/micro-nudge                │
│  - /ai-messages    │  │  - /api/study-debrief              │
│  - /session/api/tts│  │  - /api/feedback                   │
│                    │  │                                    │
│  Handles:          │  │  Handles:                          │
│  • Face detection  │  │  • AI-generated coaching tips      │
│  • Eye tracking    │  │  • Session analysis & insights     │
│  • Focus scoring   │  │  • Personalized recommendations    │
│  • WebSocket       │  │  • Feedback collection             │
│    frames          │  │                                    │
└────────────────────┘  └────────────────────────────────────┘
```

## 📡 API Endpoint Mapping

### MediaPipe Backend (Port 8001)
**Environment Variable:** `VITE_MEDIAPIPE_API_URL`

| Endpoint | Method | Purpose | Used By |
|----------|--------|---------|---------|
| `/ws/study` | WebSocket | Real-time video frame processing & focus scoring | Session.tsx |
| `/ai-messages` | GET | Vibe-based motivational messages | Session.tsx |
| `/session/api/tts` | POST | Text-to-speech audio generation | Session.tsx |

### Gemini AI Backend (Port 8002)
**Environment Variable:** `VITE_GEMINI_API_URL`

| Endpoint | Method | Purpose | Used By |
|----------|--------|---------|---------|
| `/api/micro-nudge` | POST | AI-generated real-time coaching tips | Session.tsx |
| `/api/study-debrief` | POST | Post-session analysis & reflection | StudyDebrief.tsx |
| `/api/roadmap` | POST | Learning roadmap generation | Roadmap.tsx |
| `/api/feedback` | POST | False-positive correction data | StudyDebrief.tsx |
| `/health` | GET | Health check & Gemini status | - |

## 🔄 Data Flow Examples

### 1. Real-time Focus Tracking
```
User sits at camera
      ↓
Session.tsx captures video frames
      ↓
Frames sent via WebSocket → MediaPipe Backend (8001)
      ↓
MediaPipe processes face/eye detection
      ↓
Focus score returned to frontend
      ↓
UI updates with real-time score
```

### 2. Micro-Nudge Generation
```
Session.tsx detects 3 distractions in 2 minutes
      ↓
POST request → Gemini Backend (8002) /api/micro-nudge
      ↓
Gemini AI analyzes distraction patterns + vibe
      ↓
Returns personalized coaching tip
      ↓
MicroNudge.tsx displays notification
```

### 3. Post-Session Analysis
```
User ends study session
      ↓
Session.tsx saves data to localStorage
      ↓
Navigate to PostSession.tsx
      ↓
StudyDebrief.tsx loads session data
      ↓
POST request → Gemini Backend (8002) /api/study-debrief
      ↓
Gemini analyzes full session (distractions, focus score, vibe)
      ↓
Returns strengths-based reflection + action plan
      ↓
UI displays analysis + false-positive correction interface
```

## 🔐 Environment Configuration

### `.env` File Structure
```env
# MediaPipe Backend (Face Detection & WebSocket)
VITE_MEDIAPIPE_API_URL=http://localhost:8001

# Gemini AI Backend (Chat & Insights)
VITE_GEMINI_API_URL=http://localhost:8002
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=8002
```

### Frontend Access
```typescript
// In React components:
const MEDIAPIPE_API_URL = import.meta.env.VITE_MEDIAPIPE_API_URL;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;
```

### Backend Access
```typescript
// In Express server:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 8002;
```

## 🚀 Running the Full Stack

### Option 1: All-in-One Command (Recommended)
```bash
npm run dev:all
```
This runs:
- Frontend on `http://localhost:5173`
- Gemini Backend on `http://localhost:8002`
- **Note:** MediaPipe backend (8001) must be started separately

### Option 2: Individual Terminals
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Gemini Backend
npm run dev:api

# Terminal 3 - MediaPipe Backend (external)
cd ../backend && python main.py
```

## 📦 Dependencies by Service

### Frontend (package.json)
- `react` - UI framework
- `axios` - HTTP client for API calls
- `recharts` - Session analytics charts
- `lucide-react` - Icon library
- `tailwindcss` - Styling

### Gemini Backend (package.json)
- `express` - Web server
- `@google/generative-ai` - Gemini AI SDK
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `tsx` - TypeScript execution

### MediaPipe Backend (External - Python)
- `fastapi` - API framework
- `mediapipe` - Computer vision
- `opencv-python` - Video processing
- `websockets` - Real-time communication

## 🎨 Component Responsibilities

### Session.tsx
- **Purpose:** Main study session interface
- **APIs Used:** Both MediaPipe (8001) & Gemini (8002)
- **Key Features:**
  - WebSocket video streaming to MediaPipe
  - Real-time focus score display
  - Distraction pattern detection
  - Micro-nudge triggering (Gemini)
  - Session data persistence (localStorage)

### MicroNudge.tsx
- **Purpose:** Real-time notification overlay
- **APIs Used:** None (receives data from parent)
- **Key Features:**
  - Three nudge types (breathing, posture, stretch)
  - Liquid glass morphism design
  - Auto-dismiss with progress bar
  - Vibe-aware styling

### StudyDebrief.tsx
- **Purpose:** Post-session AI reflection
- **APIs Used:** Gemini (8002)
- **Key Features:**
  - AI-generated session summary
  - Strengths identification
  - Trigger pattern analysis
  - Actionable habit recommendations
  - False-positive correction UI
  - Feedback submission

## 🔧 Development Workflow

### Adding a New Feature

1. **Determine which backend to use:**
   - Computer vision / Real-time processing → MediaPipe (8001)
   - AI analysis / Text generation → Gemini (8002)

2. **Create endpoint (if Gemini feature):**
   ```typescript
   // In src/api/server.ts
   app.post('/api/new-feature', async (req: Request, res: Response) => {
     // Use Gemini AI here
   });
   ```

3. **Call from frontend:**
   ```typescript
   const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;
   const response = await axios.post(`${GEMINI_API_URL}/api/new-feature`, data);
   ```

### Testing APIs

```bash
# Test Gemini Backend health
curl http://localhost:8002/health

# Test micro-nudge
curl -X POST http://localhost:8002/api/micro-nudge \
  -H "Content-Type: application/json" \
  -d '{"distraction_count": 3, "vibe": "calm"}'

# Test MediaPipe Backend
curl http://localhost:8001/ai-messages?vibe=calm&duration=25
```

## 🔍 Debugging Tips

### Frontend Issues
- Check browser console for API errors
- Verify environment variables: `console.log(import.meta.env)`
- Use Network tab to inspect requests

### Gemini Backend Issues
- Check server logs in terminal running `npm run dev:api`
- Verify API key: Server logs will show warning if missing
- Test endpoints with cURL before frontend integration

### MediaPipe Backend Issues
- Ensure Python backend is running on correct port
- Check WebSocket connection status in Session.tsx
- Verify camera permissions in browser

## 📊 Performance Considerations

- **WebSocket frames:** Sent at 10 FPS to balance performance
- **Micro-nudge cooldown:** Prevents spam notifications
- **Gemini API calls:** Cached/fallback responses for failures
- **Session data:** Stored in localStorage, not database

## 🛡️ Security Notes

- ✅ `.env` is gitignored (API keys protected)
- ✅ CORS limited to localhost during development
- ✅ No user video uploaded to any server
- ✅ MediaPipe runs locally (privacy-first)
- ⚠️ Production: Update CORS, use HTTPS, add rate limiting
