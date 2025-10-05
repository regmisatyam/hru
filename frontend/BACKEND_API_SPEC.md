# Backend API Requirements for Focus-Bolt

This document outlines the new API endpoints needed to support the real-time focus coaching and study debrief features.

## New API Endpoints

### 1. Micro-Nudge Generation (Real-time Focus Coach)

**Endpoint:** `POST /api/micro-nudge`

**Purpose:** Generate personalized micro-nudges when recurring distractions are detected.

**Request Body:**
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
    "message": "Take a moment to breathe deeply. Inhale for 4 counts, hold for 4, exhale for 4. This helps reset your focus."
  }
}
```

**Nudge Types:**
- `breathing` - Deep breathing exercises
- `posture` - Posture correction tips
- `stretch` - Quick stretch reminders

**Implementation Notes:**
- Use Gemini Flash 2.5 to generate personalized messages based on:
  - Recent distraction patterns
  - Session vibe (calm/beast/gamified)
  - Time elapsed in session
  - Frequency of distractions
- Fallback to default nudges if API fails
- Keep messages under 100 characters for better UX

---

### 2. Study Debrief Generation (Post-Session Reflection)

**Endpoint:** `POST /api/study-debrief`

**Purpose:** Generate a strengths-based study debrief after the session ends.

**Request Body:**
```json
{
  "duration": 25,
  "vibe": "calm",
  "distraction_history": [
    {
      "timestamp": 1696512000000,
      "type": "distraction",
      "count": 1
    }
  ],
  "total_distractions": 3,
  "focus_score": 78
}
```

**Response:**
```json
{
  "summary": "Great job maintaining focus for most of your session! You demonstrated strong commitment by staying engaged even when distractions occurred.",
  "strengths": [
    "Maintained consistent presence throughout the 25-minute session",
    "Recovered quickly after interruptions",
    "Showed resilience with a focus score of 78%"
  ],
  "triggers": [
    {
      "type": "Phone notifications",
      "count": 2,
      "suggestion": "Try enabling Do Not Disturb mode before your next session"
    }
  ],
  "actionable_habits": [
    "Set your phone to airplane mode during study sessions",
    "Use the Pomodoro technique: 25 min work, 5 min break"
  ],
  "focus_streaks": [
    {
      "start": 0,
      "end": 600,
      "duration": 600
    }
  ],
  "overall_score": 78
}
```

**Implementation Notes:**
- Use Gemini Flash 2.5 with a **strengths-based prompt**:
  - Focus on what went well first
  - Frame distractions as learning opportunities
  - Provide 2 actionable habits (not overwhelming)
  - Use encouraging, non-judgmental language
- Analyze patterns in distraction_history to identify triggers
- Calculate focus streaks (continuous periods without distractions)
- Tailor language to session vibe:
  - `calm`: Gentle, mindful language
  - `beast`: Motivational, energetic language
  - `gamified`: Achievement-oriented, level-up language

---

### 3. Feedback Submission (False-Positive Correction)

**Endpoint:** `POST /api/feedback`

**Purpose:** Collect student feedback on false-positive detections to improve the model.

**Request Body:**
```json
{
  "session_id": 1696512000000,
  "corrected_events": [
    {
      "timestamp": 1696512000000,
      "type": "distraction",
      "count": 1,
      "isFalsePositive": false
    },
    {
      "timestamp": 1696512300000,
      "type": "distraction",
      "count": 2,
      "isFalsePositive": true
    }
  ],
  "false_positive_count": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your feedback! This helps us improve detection accuracy."
}
```

**Implementation Notes:**
- Store feedback in database for model retraining
- Track false-positive rates per user
- Use data to adjust MediaPipe detection thresholds
- Consider implementing adaptive thresholds per user over time

---

## Gemini Flash 2.5 Integration

### Recommended Prompt Templates

**For Micro-Nudges:**
```
You are a supportive focus coach. A student is experiencing distractions during their study session.

Context:
- Session vibe: {vibe}
- Distractions in last 2 minutes: {distraction_count}
- Session time elapsed: {session_duration} seconds

Generate a brief, encouraging micro-nudge (under 100 characters) suggesting one of:
1. A breathing exercise
2. A posture check
3. A quick stretch

Tone: {vibe-based tone}
Format: Single sentence, actionable, friendly
```

**For Study Debrief:**
```
You are a strengths-based learning coach. Analyze this study session and provide encouraging feedback.

Session Data:
- Duration: {duration} minutes
- Focus Score: {focus_score}%
- Distraction Count: {total_distractions}
- Vibe: {vibe}

Generate a JSON response with:
1. summary: Positive overview highlighting effort and dedication
2. strengths: 2-3 specific things the student did well
3. triggers: Identified distraction patterns with gentle suggestions
4. actionable_habits: 2 specific, achievable habits for next session

Tone: Encouraging, growth-oriented, never critical
Language: {vibe-based language}
```

---

## Environment Variables

Add to backend `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

---

## Dependencies

**Python (FastAPI):**
```
google-generativeai>=0.3.0
fastapi>=0.104.0
pydantic>=2.0.0
```

**Node.js (Express):**
```
@google/generative-ai
```

---

## Rate Limiting Recommendations

- Micro-nudges: Max 1 per 30 seconds per session
- Study debrief: 1 per session
- Feedback: Unlimited (but validate session_id)

---

## Privacy & Data Handling

- Never send video frames to backend
- Only send anonymized event metadata
- Store feedback with anonymized IDs
- Allow users to delete session data
- Comply with FERPA for education use

---

## Testing

Create mock endpoints for development:

**Mock Micro-Nudge Response:**
```javascript
const mockNudges = [
  { type: 'breathing', message: 'Take a deep breath. Inhale 4, hold 4, exhale 4.' },
  { type: 'posture', message: 'Sit up straight. Roll shoulders back and relax.' },
  { type: 'stretch', message: 'Stand and stretch for 30 seconds!' }
];

app.post('/api/micro-nudge', (req, res) => {
  const randomNudge = mockNudges[Math.floor(Math.random() * mockNudges.length)];
  res.json({ nudge: randomNudge });
});
```

---

## Next Steps for Backend Development

1. Set up Gemini API client
2. Implement prompt templates
3. Create endpoints with error handling
4. Add rate limiting middleware
5. Implement database storage for feedback
6. Create analytics dashboard (optional)
7. Test with real session data
8. Deploy with environment variables secured
