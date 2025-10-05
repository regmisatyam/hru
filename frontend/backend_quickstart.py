"""
Quick Backend Implementation Guide
Focus-Bolt AI Coaching Features

This is a minimal FastAPI implementation to get you started quickly.
For production, add proper error handling, rate limiting, and database storage.
"""

# 1. Install dependencies
"""
pip install fastapi uvicorn google-generativeai python-multipart pydantic
"""

# 2. Create main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
from datetime import datetime

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your-api-key-here")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Request/Response Models
class DistractionEvent(BaseModel):
    timestamp: int
    type: str
    count: int
    isFalsePositive: Optional[bool] = None

class MicroNudgeRequest(BaseModel):
    distraction_count: int
    recent_events: List[DistractionEvent]
    session_duration: int
    vibe: str

class StudyDebriefRequest(BaseModel):
    duration: int
    vibe: str
    distraction_history: List[DistractionEvent]
    total_distractions: int
    focus_score: int

class FeedbackRequest(BaseModel):
    session_id: int
    corrected_events: List[DistractionEvent]
    false_positive_count: int


# Endpoint 1: Micro-Nudge Generation
@app.post("/api/micro-nudge")
async def generate_micro_nudge(request: MicroNudgeRequest):
    try:
        # Determine tone based on vibe
        tone_map = {
            "calm": "gentle, mindful, and soothing",
            "beast": "energetic, motivational, and powerful",
            "gamified": "fun, achievement-oriented, and encouraging"
        }
        tone = tone_map.get(request.vibe, "supportive and friendly")
        
        # Create prompt
        prompt = f"""You are a {tone} focus coach helping a student stay on task.

Context:
- The student has been distracted {request.distraction_count} times in the last 2 minutes
- They've been studying for {request.session_duration} seconds
- Their preferred style is: {request.vibe}

Generate a brief micro-nudge (under 80 characters) suggesting ONE of these:
1. A breathing exercise (type: "breathing")
2. A posture correction (type: "posture")  
3. A quick stretch (type: "stretch")

Respond in JSON format:
{{
  "type": "breathing|posture|stretch",
  "message": "your encouraging tip here"
}}

Make it {tone} and actionable. No pleasantries, just the tip."""

        # Call Gemini
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        # Parse JSON (simple approach - improve for production)
        import json
        # Remove markdown code blocks if present
        result = result.replace("```json", "").replace("```", "").strip()
        nudge_data = json.loads(result)
        
        return {"nudge": nudge_data}
        
    except Exception as e:
        print(f"Error generating nudge: {e}")
        # Fallback nudges
        fallback_nudges = [
            {"type": "breathing", "message": "Take a deep breath. Inhale 4, hold 4, exhale 4."},
            {"type": "posture", "message": "Sit up straight. Roll shoulders back and relax."},
            {"type": "stretch", "message": "Stand and stretch for 30 seconds!"}
        ]
        import random
        return {"nudge": random.choice(fallback_nudges)}


# Endpoint 2: Study Debrief Generation
@app.post("/api/study-debrief")
async def generate_study_debrief(request: StudyDebriefRequest):
    try:
        # Analyze distraction patterns
        distraction_times = [e.timestamp for e in request.distraction_history]
        
        # Create vibe-appropriate language
        language_map = {
            "calm": "gentle and mindful",
            "beast": "energetic and motivational",
            "gamified": "achievement-focused with gaming metaphors"
        }
        language_style = language_map.get(request.vibe, "supportive")
        
        prompt = f"""You are a strengths-based learning coach. Analyze this study session and provide ENCOURAGING feedback.

Session Data:
- Duration: {request.duration} minutes
- Focus Score: {request.focus_score}%
- Total Distractions: {request.total_distractions}
- Student's preferred style: {request.vibe}

IMPORTANT RULES:
1. Start with what went WELL - highlight effort and dedication
2. Be encouraging, never critical or judgmental
3. Frame distractions as learning opportunities
4. Suggest exactly 2 actionable habits (not overwhelming)
5. Use {language_style} language

Generate a JSON response with this exact structure:
{{
  "summary": "A positive 2-sentence overview celebrating their effort and highlighting dedication",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "triggers": [
    {{
      "type": "pattern name",
      "count": number,
      "suggestion": "gentle tip to address it"
    }}
  ],
  "actionable_habits": ["habit 1", "habit 2"],
  "focus_streaks": [],
  "overall_score": {request.focus_score}
}}

Be specific, encouraging, and growth-oriented. Focus on progress over perfection."""

        # Call Gemini
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        # Parse JSON
        import json
        result = result.replace("```json", "").replace("```", "").strip()
        debrief_data = json.loads(result)
        
        return debrief_data
        
    except Exception as e:
        print(f"Error generating debrief: {e}")
        # Fallback response
        return {
            "summary": f"Great effort on your {request.duration}-minute session! You showed dedication by staying engaged even when distractions occurred.",
            "strengths": [
                "Maintained consistent presence throughout the session",
                f"Achieved a focus score of {request.focus_score}%",
                "Demonstrated commitment to your learning goals"
            ],
            "triggers": [],
            "actionable_habits": [
                "Try the Pomodoro technique: 25 minutes focused work, 5 minutes break",
                "Create a distraction-free zone by silencing notifications before you start"
            ],
            "focus_streaks": [],
            "overall_score": request.focus_score
        }


# Endpoint 3: Feedback Collection
@app.post("/api/feedback")
async def submit_feedback(request: FeedbackRequest):
    try:
        # In production, save to database
        print(f"Feedback received for session {request.session_id}")
        print(f"False positives: {request.false_positive_count}/{len(request.corrected_events)}")
        
        # TODO: Store in database for model retraining
        # db.save_feedback(request.dict())
        
        return {
            "success": True,
            "message": "Thank you for your feedback! This helps us improve detection accuracy."
        }
        
    except Exception as e:
        print(f"Error saving feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")


# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# Run with: uvicorn main:app --reload --port 8001

"""
3. Set environment variable:

export GEMINI_API_KEY="your-actual-api-key"

4. Run the server:

uvicorn main:app --reload --port 8001

5. Test the endpoints:

curl -X POST http://localhost:8001/api/micro-nudge \
  -H "Content-Type: application/json" \
  -d '{
    "distraction_count": 3,
    "recent_events": [],
    "session_duration": 420,
    "vibe": "calm"
  }'

6. For production:
   - Add rate limiting (slowapi)
   - Add authentication
   - Store feedback in PostgreSQL/MongoDB
   - Add proper logging
   - Use environment variables for all secrets
   - Add input validation
   - Implement retry logic for Gemini API
   - Add monitoring/analytics
"""
