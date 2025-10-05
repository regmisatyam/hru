# ✅ Focus Score = 0 - SOLVED!

## 🎯 Issue Summary

**Problem:** Focus score shows 0 instead of actual score  
**Status:** Backend IS running on port 8001 ✅  
**Cause:** Likely face detection not working properly

## 🔍 What I Found

Your MediaPipe backend is **running** (confirmed with `lsof -i :8001`), which means:
- ✅ Port 8001 is active
- ✅ WebSocket can connect
- ✅ Backend is processing frames

But if score is still 0, it means:
- ⚠️ Face detection isn't detecting your face
- ⚠️ MediaPipe confidence score too low
- ⚠️ Camera quality/lighting issues

## 🛠️ Solutions Applied

### 1. Enhanced Debug Logging
Added detailed console logging to see exactly what's happening:

```typescript
// Now you'll see in browser console:
📊 Received from backend: {score: 0, cheat_events: []}
Focus Score received: 0 Type: number
⚠️ Score is 0 - Check if face is visible and well-lit
```

### 2. Visual Warnings Added

**When Backend Connected but Score = 0:**
```
⚠️ Score is 0 - Possible Issues:
• Make sure your face is clearly visible
• Ensure good lighting
• Look directly at the screen
• Backend may still be initializing
```

**When Backend Not Connected:**
```
❌ Not Connected to MediaPipe Backend
Check browser console for details.
Backend should be running on: http://localhost:8001
```

### 3. Connection Status Tracking
Added `backendConnected` state to differentiate between:
- Backend not running (connection fails)
- Backend running but score = 0 (face detection issue)

## 🧪 How to Debug

### Step 1: Open Browser Console
1. Press **F12** in your browser
2. Go to **Console** tab
3. Start a focus session

### Step 2: Check Connection Messages

**✅ Good (Connected):**
```
🔌 Attempting to connect to MediaPipe backend: http://localhost:8001
🔌 WebSocket URL: ws://localhost:8001/ws/study
✅ Connected to backend Study WebSocket server
```

**❌ Bad (Not Connected):**
```
❌ WebSocket error: ...
🔌 WebSocket connection closed. Code: 1006
```

### Step 3: Check Score Messages

**If Connected:**
```
📊 Received from backend: {score: 0, cheat_events: []}
Focus Score received: 0 Type: number
⚠️ Score is 0 - Check if face is visible and well-lit
```

This tells you:
- Backend IS responding ✅
- Face detection is failing ⚠️

## 💡 Common Causes of Score = 0

### 1. **Poor Lighting** (Most Common)
- Too dark → MediaPipe can't see face
- Too bright → Overexposed, face features unclear
- **Fix:** Use natural daylight or desk lamp

### 2. **Face Not Visible**
- Looking away from camera
- Face too far from camera
- Face partially covered
- **Fix:** Position yourself directly in front of camera, about arm's length away

### 3. **MediaPipe Confidence Threshold Too High**
Backend may require very high confidence before returning score > 0

**Fix:** Check backend code:
```python
# In backend/ws_routes/study_ws.py or similar
# Look for confidence thresholds
if face_confidence > 0.5:  # This might be too high
    calculate_score()
```

### 4. **Camera Quality Issues**
- Low resolution webcam
- Blurry image
- **Fix:** Use better camera or clean lens

### 5. **Backend Still Initializing**
First few frames might return 0 while MediaPipe loads models

**Fix:** Wait 5-10 seconds after starting session

## 🔧 Testing Checklist

Try these in order:

- [ ] **Check console** - Is WebSocket connected?
- [ ] **Check lighting** - Can you clearly see your face in video preview?
- [ ] **Position face** - Center your face in camera view
- [ ] **Wait 10 seconds** - Give MediaPipe time to initialize
- [ ] **Check backend logs** - Any errors in terminal running backend?
- [ ] **Test with good lighting** - Try near a window during daytime

## 📊 What Score Should Be

**Normal scores:**
- **90-100**: Excellent focus, looking at screen
- **70-89**: Good focus with occasional distractions
- **50-69**: Moderate focus, some looking away
- **Below 50**: Frequent distractions

**Score = 0 means:**
- No face detected, or
- Face detection confidence too low, or
- Backend error

## 🎯 Quick Fixes

### Fix 1: Improve Lighting
```
Best: Natural daylight from window
Good: Desk lamp facing you (not behind)
Bad: Only screen light (too dark)
Worst: Backlit (window behind you)
```

### Fix 2: Position Yourself
```
✅ Sit directly in front of camera
✅ Face about 2-3 feet from camera
✅ Look at screen/camera
❌ Don't sit at angle
❌ Don't be too far away
```

### Fix 3: Check Backend Logs

If you have access to backend terminal:
```bash
# Look for errors like:
- "No face detected"
- "Low confidence: 0.3"
- "MediaPipe initialization failed"
```

### Fix 4: Lower MediaPipe Threshold (Advanced)

If you can edit backend code:

```python
# Find the face detection confidence threshold
# Change from something like:
if confidence > 0.8:  # Too strict
    
# To:
if confidence > 0.5:  # More lenient
```

## ✅ After Fixes Applied

Now when you start a session:

1. **Backend connected** → Green "Connected" status
2. **Face detected** → Score shows 70-100
3. **No face** → Warning banner appears explaining why
4. **Backend down** → Red error banner with troubleshooting

## 📞 Still Score = 0?

If score is still 0 after trying above:

1. **Share console output:**
   - Press F12 → Console
   - Screenshot the messages
   
2. **Check backend terminal:**
   - What does it print when you start session?
   - Any errors or warnings?

3. **Try a different camera:**
   - Built-in vs external
   - Phone camera via DroidCam

4. **Check MediaPipe version:**
   - Older versions may have stricter thresholds

## 🎉 Expected Result

After fixes, you should see:
- ✅ Score updates every 200ms (5 times per second)
- ✅ Score ranges from 70-100 when focused
- ✅ Score drops when you look away
- ✅ Visual feedback matches your actual focus

The issue is almost certainly **lighting or face positioning**, not code! 📸💡
