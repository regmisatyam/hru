import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Use gemini-1.5-flash for better rate limits (1500 requests/day free tier)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Types
interface DistractionEvent {
  timestamp: number;
  type: string;
  count: number;
  isFalsePositive?: boolean;
}

interface MicroNudgeRequest {
  distraction_count: number;
  recent_events: DistractionEvent[];
  session_duration: number;
  vibe: 'calm' | 'beast' | 'gamified';
}

interface StudyDebriefRequest {
  duration: number;
  vibe: 'calm' | 'beast' | 'gamified';
  distraction_history: DistractionEvent[];
  total_distractions: number;
  focus_score: number;
}

interface FeedbackRequest {
  session_id: number;
  corrected_events: DistractionEvent[];
  false_positive_count: number;
}

interface RoadmapRequest {
  topic: string;
}

interface RoadmapStage {
  title: string;
  subtopics: string[];
  projects: string[];
}

interface RoadmapResponse {
  topic: string;
  stages: RoadmapStage[];
}

// Utility function to parse JSON from Gemini response
const parseGeminiJSON = (text: string): any => {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse Gemini JSON:', error);
    throw error;
  }
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    geminiConfigured: !!GEMINI_API_KEY
  });
});

// Endpoint 1: Micro-Nudge Generation
app.post('/api/micro-nudge', async (req: Request<{}, {}, MicroNudgeRequest>, res: Response) => {
  try {
    const { distraction_count, recent_events, session_duration, vibe } = req.body;

    // Determine tone based on vibe
    const toneMap = {
      calm: 'gentle, mindful, and soothing',
      beast: 'energetic, motivational, and powerful',
      gamified: 'fun, achievement-oriented, and encouraging'
    };
    const tone = toneMap[vibe] || 'supportive and friendly';

    const prompt = `You are a ${tone} focus coach helping a student stay on task.

Context:
- The student has been distracted ${distraction_count} times in the last 2 minutes
- They've been studying for ${session_duration} seconds
- Their preferred style is: ${vibe}

Generate a brief micro-nudge (under 80 characters) suggesting ONE of these:
1. A breathing exercise (type: "breathing")
2. A posture correction (type: "posture")  
3. A quick stretch (type: "stretch")

Respond in JSON format:
{
  "type": "breathing|posture|stretch",
  "message": "your encouraging tip here"
}

Make it ${tone} and actionable. No pleasantries, just the tip.`;

    // Call Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const nudgeData = parseGeminiJSON(text);
    
    res.json({ nudge: nudgeData });
  } catch (error: any) {
    console.error('Error generating nudge:', error);
    
    // Check if it's a rate limit error
    const isRateLimit = error?.status === 429 || error?.message?.includes('quota');
    if (isRateLimit) {
      console.warn('⚠️  Gemini API rate limit reached. Using fallback nudges.');
    }
    
    // Fallback nudges
    const fallbackNudges = [
      { type: 'breathing', message: 'Take a deep breath. Inhale 4, hold 4, exhale 4.' },
      { type: 'posture', message: 'Sit up straight. Roll shoulders back and relax.' },
      { type: 'stretch', message: 'Stand and stretch for 30 seconds!' }
    ];
    
    const randomNudge = fallbackNudges[Math.floor(Math.random() * fallbackNudges.length)];
    res.json({ nudge: randomNudge });
  }
});

// Endpoint 2: Study Debrief Generation
app.post('/api/study-debrief', async (req: Request<{}, {}, StudyDebriefRequest>, res: Response) => {
  try {
    const { duration, vibe, distraction_history, total_distractions, focus_score } = req.body;

    // Create vibe-appropriate language
    const languageMap = {
      calm: 'gentle and mindful',
      beast: 'energetic and motivational',
      gamified: 'achievement-focused with gaming metaphors'
    };
    const languageStyle = languageMap[vibe] || 'supportive';

    const prompt = `You are a strengths-based learning coach. Analyze this study session and provide ENCOURAGING feedback.

Session Data:
- Duration: ${duration} minutes
- Focus Score: ${focus_score}%
- Total Distractions: ${total_distractions}
- Student's preferred style: ${vibe}

IMPORTANT RULES:
1. Start with what went WELL - highlight effort and dedication
2. Be encouraging, never critical or judgmental
3. Frame distractions as learning opportunities
4. Suggest exactly 2 actionable habits (not overwhelming)
5. Use ${languageStyle} language

Generate a JSON response with this exact structure:
{
  "summary": "A positive 2-sentence overview celebrating their effort and highlighting dedication",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "triggers": [
    {
      "type": "pattern name",
      "count": number,
      "suggestion": "gentle tip to address it"
    }
  ],
  "actionable_habits": ["habit 1", "habit 2"],
  "focus_streaks": [],
  "overall_score": ${focus_score}
}

Be specific, encouraging, and growth-oriented. Focus on progress over perfection.`;

    // Call Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const debriefData = parseGeminiJSON(text);
    
    res.json(debriefData);
  } catch (error: any) {
    console.error('Error generating debrief:', error);
    
    // Check if it's a rate limit error
    const isRateLimit = error?.status === 429 || error?.message?.includes('quota');
    if (isRateLimit) {
      console.warn('⚠️  Gemini API rate limit reached. Using fallback debrief.');
      console.warn('💡 Tip: Upgrade to paid tier or wait until tomorrow for quota reset.');
    }
    
    // Fallback response
    const { duration, focus_score } = req.body;
    res.json({
      summary: `Great effort on your ${duration}-minute session! You showed dedication by staying engaged even when distractions occurred.`,
      strengths: [
        'Maintained consistent presence throughout the session',
        `Achieved a focus score of ${focus_score}%`,
        'Demonstrated commitment to your learning goals'
      ],
      triggers: [],
      actionable_habits: [
        'Try the Pomodoro technique: 25 minutes focused work, 5 minutes break',
        'Create a distraction-free zone by silencing notifications before you start'
      ],
      focus_streaks: [],
      overall_score: focus_score
    });
  }
});

// Endpoint 3: Learning Roadmap Generation
app.post('/api/roadmap', async (req: Request<{}, {}, RoadmapRequest>, res: Response) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        error: 'Topic is required'
      });
    }

    const prompt = `You are an expert learning path designer. Create a comprehensive, structured learning roadmap for mastering "${topic}".

Generate a JSON response with this EXACT structure:
{
  "topic": "${topic}",
  "stages": [
    {
      "title": "Stage name (e.g., Foundations, Intermediate, Advanced)",
      "subtopics": ["subtopic 1", "subtopic 2", "subtopic 3", "subtopic 4"],
      "projects": ["project 1", "project 2", "project 3"]
    }
  ]
}

Requirements:
- Create 4-6 progressive learning stages (Beginner → Intermediate → Advanced → Expert)
- Each stage should have 4-6 specific subtopics to learn
- Each stage should suggest 2-4 hands-on projects to build
- Make it practical, actionable, and industry-relevant
- Subtopics should be concrete skills/concepts, not vague
- Projects should be real-world applicable

Focus on modern best practices and current industry standards for ${topic}.`;

    // Call Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const roadmapData = parseGeminiJSON(text) as RoadmapResponse;
    
    // Validate the response has required structure
    if (!roadmapData.stages || !Array.isArray(roadmapData.stages)) {
      throw new Error('Invalid roadmap structure from AI');
    }
    
    res.json(roadmapData);
  } catch (error: any) {
    console.error('Error generating roadmap:', error);
    
    // Check if it's a rate limit error
    const isRateLimit = error?.status === 429 || error?.message?.includes('quota');
    if (isRateLimit) {
      console.warn('⚠️  Gemini API rate limit reached. Using fallback roadmap.');
    }
    
    // Fallback roadmap
    const { topic } = req.body;
    res.json({
      topic: topic || 'Your Topic',
      stages: [
        {
          title: '🌱 Foundations',
          subtopics: [
            'Core concepts and terminology',
            'Historical context and evolution',
            'Basic principles and theories',
            'Essential tools and technologies'
          ],
          projects: [
            'Create a simple introductory project',
            'Build a concept demonstration',
            'Research and document key concepts'
          ]
        },
        {
          title: '🚀 Intermediate Skills',
          subtopics: [
            'Advanced techniques and methods',
            'Best practices and patterns',
            'Common challenges and solutions',
            'Integration with other technologies'
          ],
          projects: [
            'Build a medium-complexity application',
            'Implement industry-standard features',
            'Contribute to an open-source project'
          ]
        },
        {
          title: '💎 Advanced Mastery',
          subtopics: [
            'Performance optimization',
            'Scalability and architecture',
            'Security best practices',
            'Testing and quality assurance'
          ],
          projects: [
            'Design and build a production-ready system',
            'Optimize an existing complex application',
            'Create a comprehensive portfolio project'
          ]
        },
        {
          title: '🎓 Expert Level',
          subtopics: [
            'Cutting-edge innovations',
            'Industry trends and future direction',
            'Leadership and mentoring',
            'Research and experimentation'
          ],
          projects: [
            'Publish technical articles or tutorials',
            'Speak at conferences or meetups',
            'Develop an innovative solution or framework'
          ]
        }
      ]
    });
  }
});

// Endpoint 4: Feedback Collection
app.post('/api/feedback', async (req: Request<{}, {}, FeedbackRequest>, res: Response) => {
  try {
    const { session_id, corrected_events, false_positive_count } = req.body;

    // Log feedback for improvement
    console.log(`📝 Feedback received for session ${session_id}`);
    console.log(`   False positives: ${false_positive_count}/${corrected_events.length}`);
    
    // TODO: In production, save to database
    // await db.saveFeedback({ session_id, corrected_events, false_positive_count });
    
    res.json({
      success: true,
      message: 'Thank you for your feedback! This helps us improve detection accuracy.'
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save feedback'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Gemini API configured: ${!!GEMINI_API_KEY ? '✅' : '❌'}`);
  if (!GEMINI_API_KEY) {
    console.log(`   ⚠️  Set GEMINI_API_KEY in .env file`);
  }
});

export default app;
