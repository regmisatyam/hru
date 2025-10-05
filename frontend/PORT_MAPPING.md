# Backend Port Mapping

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Your Browser                               │
│                  http://localhost:5173                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  React Frontend                           │ │
│  │                                                           │ │
│  │  Session.tsx        StudyDebrief.tsx     PostSession.tsx │ │
│  │      │                    │                    │          │ │
│  │      │                    │                    │          │ │
│  │      │                    └────────────────────┘          │ │
│  │      │                             │                      │ │
│  └──────┼─────────────────────────────┼──────────────────────┘ │
│         │                             │                        │
└─────────┼─────────────────────────────┼────────────────────────┘
          │                             │
          │                             │
    ┌─────┴─────┐                 ┌─────┴─────┐
    │           │                 │           │
    │           │                 │           │
    ▼           ▼                 ▼           ▼
┌─────────────────────┐     ┌─────────────────────────┐
│  MediaPipe Backend  │     │   Gemini AI Backend     │
│   localhost:8001    │     │    localhost:8002       │
│                     │     │                         │
│   (Python/FastAPI)  │     │  (TypeScript/Express)   │
│   External Server   │     │   src/api/server.ts     │
│                     │     │                         │
├─────────────────────┤     ├─────────────────────────┤
│ Endpoints:          │     │ Endpoints:              │
│                     │     │                         │
│ WS  /ws/study       │     │ GET  /health            │
│ GET /ai-messages    │     │ POST /api/micro-nudge   │
│ POST /session/      │     │ POST /api/study-debrief │
│      api/tts        │     │ POST /api/feedback      │
│                     │     │                         │
├─────────────────────┤     ├─────────────────────────┤
│ Features:           │     │ Features:               │
│                     │     │                         │
│ • Face Detection    │     │ • AI Coaching Tips      │
│ • Eye Tracking      │     │ • Session Analysis      │
│ • Focus Scoring     │     │ • Habit Suggestions     │
│ • WebSocket Stream  │     │ • Pattern Detection     │
│ • TTS Audio         │     │ • Feedback Collection   │
│                     │     │                         │
└─────────────────────┘     └─────────────────────────┘
         │                           │
         ▼                           ▼
    MediaPipe CV              Google Gemini API
    (Local Processing)        (Cloud AI Service)
```

## Port Assignment

| Port | Service | Technology | Location | Auto-Start |
|------|---------|------------|----------|------------|
| **5173** | Frontend | Vite + React | Root | ✅ `npm run dev:all` |
| **8001** | MediaPipe | Python/FastAPI | `../backend/` | ❌ Manual start required |
| **8002** | Gemini AI | TypeScript/Express | `src/api/server.ts` | ✅ `npm run dev:all` |

## Environment Variable Flow

```
┌──────────────────────────┐
│      .env File           │
├──────────────────────────┤
│ VITE_MEDIAPIPE_API_URL   │──┐
│ = http://localhost:8001  │  │
│                          │  │
│ VITE_GEMINI_API_URL      │──┼──> Frontend reads via
│ = http://localhost:8002  │  │   import.meta.env.VITE_*
│                          │  │
│ GEMINI_API_KEY           │──┼──> Backend reads via
│ = AIzaSy...              │  │   process.env.*
│                          │  │
│ PORT = 8002              │──┘
└──────────────────────────┘
```

## API Call Routing

### Session.tsx Calls

```typescript
// Session.tsx uses BOTH backends:

// 1. MediaPipe calls (localhost:8001)
const MEDIAPIPE_API_URL = import.meta.env.VITE_MEDIAPIPE_API_URL;
new WebSocket(`ws://${MEDIAPIPE_API_URL}/ws/study`);        // Video frames
axios.get(`${MEDIAPIPE_API_URL}/ai-messages`);              // Motivational text
axios.post(`${MEDIAPIPE_API_URL}/session/api/tts`);         // TTS audio

// 2. Gemini calls (localhost:8002)
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;
axios.post(`${GEMINI_API_URL}/api/micro-nudge`);            // Coaching tips
```

### StudyDebrief.tsx Calls

```typescript
// StudyDebrief.tsx uses ONLY Gemini backend:

const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;
axios.post(`${GEMINI_API_URL}/api/study-debrief`);          // Session analysis
axios.post(`${GEMINI_API_URL}/api/feedback`);               // False positives
```

## Startup Sequence

### Correct Order:
```bash
# Step 1: Install dependencies (one time)
npm install

# Step 2: Start Gemini Backend + Frontend
npm run dev:all
# Output:
# > vite dev         (port 5173)
# > tsx watch src/api/server.ts  (port 8002)

# Step 3: Start MediaPipe Backend (separate terminal)
cd ../backend
python main.py
# Output: Server running on port 8001
```

### What's Running:
```
✅ Frontend:        http://localhost:5173  (Vite dev server)
✅ Gemini Backend:  http://localhost:8002  (Express API)
✅ MediaPipe:       http://localhost:8001  (Python FastAPI)
```

## Testing Connectivity

```bash
# Test 1: Frontend accessible
curl http://localhost:5173
# Expected: HTML content

# Test 2: Gemini backend alive
curl http://localhost:8002/health
# Expected: {"status":"healthy","geminiConfigured":true}

# Test 3: MediaPipe backend alive
curl http://localhost:8001/ai-messages?vibe=calm&duration=25
# Expected: {"message":"...motivational text..."}

# Test 4: Gemini AI responding
curl -X POST http://localhost:8002/api/micro-nudge \
  -H "Content-Type: application/json" \
  -d '{"distraction_count":3,"vibe":"calm","session_duration":420,"recent_events":[]}'
# Expected: {"nudge":{"type":"breathing","message":"..."}}
```

## Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| `WebSocket connection failed` | MediaPipe (8001) not running | `cd ../backend && python main.py` |
| `Cannot fetch micro-nudge` | Gemini (8002) not running | `npm run dev:api` |
| `Port 8002 already in use` | Old Gemini process still running | `lsof -ti:8002 \| xargs kill` |
| `GEMINI_API_KEY not found` | Missing in .env | Add `GEMINI_API_KEY=AIza...` to .env |
| `CORS error` | Wrong frontend URL | Check CORS in `src/api/server.ts` |

## Data Flow: Complete Session

```
1. User opens http://localhost:5173
        ↓
2. Session.tsx loads
        ↓
3. Camera access requested
        ↓
4. WebSocket opens → MediaPipe (8001)
        ↓
5. Video frames sent every 100ms → MediaPipe
        ↓
6. MediaPipe returns focus scores → Session.tsx
        ↓
7. AI messages fetched → MediaPipe (8001)
        ↓
8. If distraction pattern detected:
        ↓
9. POST micro-nudge request → Gemini (8002)
        ↓
10. Gemini returns coaching tip → MicroNudge.tsx
        ↓
11. User ends session
        ↓
12. Data saved to localStorage
        ↓
13. Navigate to PostSession.tsx
        ↓
14. POST study-debrief request → Gemini (8002)
        ↓
15. Gemini returns analysis → StudyDebrief.tsx
        ↓
16. User can mark false positives
        ↓
17. POST feedback → Gemini (8002)
        ↓
18. Session complete! 🎉
```

## Summary

- **2 backends** = Clear separation of concerns
- **Port 8001** = Computer vision (MediaPipe)
- **Port 8002** = Artificial intelligence (Gemini)
- **Port 5173** = User interface (React)
- **All documented** = Easy to maintain and debug
