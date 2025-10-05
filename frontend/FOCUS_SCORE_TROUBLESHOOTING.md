# Focus Score Showing 0 - Troubleshooting Guide

## 🔍 Problem: Focus Score Always Shows 0

This issue occurs when the **MediaPipe backend** (port 8001) is either:
1. Not running
2. Not sending proper focus scores
3. Connection is failing

## 🛠️ Solutions

### Step 1: Check if MediaPipe Backend is Running

```bash
# Test if backend is responding
curl http://localhost:8001/health

# Or check if port is open
lsof -i :8001
```

**If nothing responds:** The MediaPipe backend is **NOT running** ❌

### Step 2: Start MediaPipe Backend

```bash
# Navigate to backend directory
cd /Users/satyamregmi/Desktop/hru/Focus-Bolt-Refined/backend

# Check if backend exists
ls -la

# Start the backend (Python/FastAPI)
python main.py
# OR
python3 main.py
# OR
uvicorn main:app --port 8001
```

### Step 3: Verify WebSocket Connection

Open your browser console (F12) when on the session page. You should see:

**✅ Good (Backend Running):**
```
🔌 Attempting to connect to MediaPipe backend: http://localhost:8001
🔌 WebSocket URL: ws://localhost:8001/ws/study
✅ Connected to backend Study WebSocket server
📊 Received from backend: {score: 85, cheat_events: []}
Focus Score received: 85 Type: number
```

**❌ Bad (Backend NOT Running):**
```
🔌 Attempting to connect to MediaPipe backend: http://localhost:8001
🔌 WebSocket URL: ws://localhost:8001/ws/study
❌ WebSocket error: [Error details]
Is MediaPipe backend running on http://localhost:8001 ?
⚠️ Connection Error - Check if backend is running
🔌 WebSocket connection closed. Code: 1006 Reason: 
```

### Step 4: Check Backend Logs

If backend is running, check its console output:

**Look for:**
- WebSocket connection messages
- Face detection processing
- Focus score calculations
- Any error messages

### Step 5: Verify Environment Variables

Check `.env` file:

```bash
cat .env
```

Should show:
```env
VITE_MEDIAPIPE_API_URL=http://localhost:8001
```

## 🔧 Quick Fixes

### Fix 1: Backend Not Installed

```bash
# Navigate to backend folder
cd ../backend

# If backend doesn't exist, you need to set it up
# Check documentation for MediaPipe backend setup
```

### Fix 2: Port Conflict

If port 8001 is in use by something else:

```bash
# Find what's using port 8001
lsof -i :8001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change port in both .env and backend
```

### Fix 3: WebSocket Protocol Issue

If you see mixed http/https warnings:

```env
# Make sure both use same protocol
VITE_MEDIAPIPE_API_URL=http://localhost:8001  # NOT https
```

### Fix 4: CORS or Network Issues

Add to MediaPipe backend (if you have access):

```python
# In FastAPI backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 Testing Steps

### Test 1: Manual WebSocket Test

```javascript
// Open browser console on session page
const ws = new WebSocket('ws://localhost:8001/ws/study');
ws.onopen = () => console.log('✅ Connected!');
ws.onerror = (e) => console.error('❌ Error:', e);
ws.onmessage = (e) => console.log('📊 Message:', e.data);
```

### Test 2: Check Backend API

```bash
# If backend has REST endpoints
curl http://localhost:8001/ai-messages?vibe=calm&duration=25
```

### Test 3: Verify Video Stream

Check if camera is working:
- Does video preview show your face?
- Is "Camera Active" status shown?
- Are frames being sent (check Network tab for WebSocket traffic)?

## 📊 Debug Mode Added

I've added detailed logging to Session.tsx. Open browser console to see:

1. **Connection attempt:**
   ```
   🔌 Attempting to connect to MediaPipe backend: http://localhost:8001
   🔌 WebSocket URL: ws://localhost:8001/ws/study
   ```

2. **Connection success:**
   ```
   ✅ Connected to backend Study WebSocket server
   ```

3. **Data received:**
   ```
   📊 Received from backend: {score: 78, cheat_events: []}
   Focus Score received: 78 Type: number
   ```

4. **Errors:**
   ```
   ❌ WebSocket error: [details]
   Is MediaPipe backend running on http://localhost:8001 ?
   ```

## 🚨 Common Issues

### Issue 1: Backend Never Started
**Symptom:** WebSocket immediately fails  
**Fix:** Start MediaPipe backend

### Issue 2: Backend Crashes
**Symptom:** Connection works briefly then disconnects  
**Fix:** Check backend logs for Python errors

### Issue 3: Score is 0 (not null)
**Symptom:** Shows "0" instead of no connection  
**Fix:** Backend IS running but face detection is failing
- Ensure good lighting
- Face must be visible to camera
- Check MediaPipe face detection thresholds

### Issue 4: Backend on Wrong Port
**Symptom:** Connection refused  
**Fix:** 
```bash
# Check what port backend is actually running on
# Update .env to match
VITE_MEDIAPIPE_API_URL=http://localhost:ACTUAL_PORT
```

## ✅ Verification Checklist

- [ ] MediaPipe backend running on port 8001
- [ ] WebSocket connection succeeds (check console)
- [ ] Camera permission granted
- [ ] Video stream showing your face
- [ ] Backend logs show frame processing
- [ ] Browser console shows score updates
- [ ] No CORS errors in console
- [ ] `.env` has correct MediaPipe URL

## 🎯 Expected Behavior

When everything works correctly:

1. **Session starts** → WebSocket connects
2. **Frames sent** → Every 200ms, image sent to backend
3. **Backend processes** → Face detection runs
4. **Score returned** → `{score: 75-100, cheat_events: []}`
5. **UI updates** → Focus score displays in real-time
6. **Distractions detected** → Score drops, red indicator shows

## 💡 Next Steps

1. **Check browser console** - Look for the new debug messages
2. **Verify backend is running** - `lsof -i :8001`
3. **Start backend if needed** - `cd ../backend && python main.py`
4. **Check backend logs** - See if frames are being received
5. **Report specific error** - Share console output for more help

## 📞 Still Not Working?

If focus score is still 0 after checking all above:

1. Share browser console output (F12 → Console tab)
2. Share backend console output (if accessible)
3. Confirm backend technology (Python/FastAPI, Node.js, etc.)
4. Share backend file structure (`ls -la backend/`)

The issue is **definitely** with the MediaPipe backend connection, not the frontend! 🎯
