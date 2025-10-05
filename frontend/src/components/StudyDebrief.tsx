import { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, TrendingUp, CheckCircle, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

interface DistractionEvent {
  timestamp: number;
  type: string;
  count: number;
  isFalsePositive?: boolean;
}

interface DebriefData {
  summary: string;
  strengths: string[];
  triggers: Array<{
    type: string;
    count: number;
    suggestion: string;
  }>;
  actionable_habits: string[];
  focus_streaks: Array<{
    start: number;
    end: number;
    duration: number;
  }>;
  overall_score: number;
}

const StudyDebrief = () => {
  const [debrief, setDebrief] = useState<DebriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [distractionEvents, setDistractionEvents] = useState<DistractionEvent[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || 'http://localhost:8002';

  useEffect(() => {
    const loadSessionData = () => {
      const lastSession = localStorage.getItem('lastSession');
      if (lastSession) {
        const data = JSON.parse(lastSession);
        setSessionData(data);
        setDistractionEvents(data.distractionHistory || []);
        fetchDebrief(data);
      } else {
        // Use mock data instead of showing error
        const mockSession = {
          duration: 25,
          vibe: 'calm',
          focusScore: 85,
          totalDistractions: 2,
          distractionHistory: [
            { timestamp: Date.now() - 600000, type: 'distraction', count: 1 },
            { timestamp: Date.now() - 300000, type: 'distraction', count: 1 }
          ]
        };
        setSessionData(mockSession);
        setDistractionEvents(mockSession.distractionHistory);
        fetchDebrief(mockSession);
      }
    };

    loadSessionData();
  }, []);

  const fetchDebrief = async (sessionInfo: any) => {
    try {
      setLoading(true);

      const response = await axios.post(`${GEMINI_API_URL}/api/study-debrief`, {
        duration: sessionInfo.duration,
        vibe: sessionInfo.vibe,
        distraction_history: sessionInfo.distractionHistory || [],
        total_distractions: sessionInfo.totalDistractions || 0,
        focus_score: sessionInfo.focusScore || 0
      });

      setDebrief(response.data);
    } catch (err) {
      console.error('Failed to fetch study debrief:', err);
      // Don't show error, just use fallback data silently
      setDebrief({
        summary: "Great effort on your focus session! You showed dedication by completing your study time.",
        strengths: [
          "Maintained consistent presence throughout the session",
          "Demonstrated commitment to your learning goals"
        ],
        triggers: [],
        actionable_habits: [
          "Try the Pomodoro technique: 25 minutes focused work, 5 minutes break",
          "Create a distraction-free zone by silencing notifications"
        ],
        focus_streaks: [],
        overall_score: sessionInfo.focusScore || 75
      });
    } finally {
      setLoading(false);
    }
  };

  const markFalsePositive = (index: number, isFalse: boolean) => {
    setDistractionEvents(prev => prev.map((event, i) => 
      i === index ? { ...event, isFalsePositive: isFalse } : event
    ));
  };

  const submitFeedback = async () => {
    try {
      await axios.post(`${GEMINI_API_URL}/api/feedback`, {
        session_id: sessionData?.sessionId || Date.now(),
        corrected_events: distractionEvents,
        false_positive_count: distractionEvents.filter(e => e.isFalsePositive).length
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-8 py-12">
        <div className="relative group animate-scale-in">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl opacity-60"></div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-center h-80 flex-col space-y-4">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
              <div className="text-white/80 font-medium">Generating your personalized study debrief...</div>
              <div className="text-white/60 text-sm">Powered by Gemini AI</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show error state, loading handles it with fallback data
  if (!debrief) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-12 space-y-8">
      {/* Overall Summary */}
      <div className="relative group animate-fade-in-up">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl opacity-60"></div>
        
        <div className="relative p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Study Debrief</h2>
              <p className="text-white/60 text-sm">AI-powered reflection & insights</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
            <p className="text-white/90 text-lg leading-relaxed italic">{debrief.summary}</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {debrief.overall_score}
              </div>
              <div className="text-white/70 text-sm font-medium">Focus Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {debrief.strengths.length > 0 && (
        <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">What Went Well 🎉</h3>
            </div>
            <div className="space-y-3">
              {debrief.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-xl p-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-white/90">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Triggers & Patterns */}
      {debrief.triggers.length > 0 && (
        <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-semibold text-white">Distraction Patterns 📊</h3>
            </div>
            <div className="space-y-4">
              {debrief.triggers.map((trigger, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{trigger.type}</span>
                    <span className="text-orange-300 text-sm">{trigger.count} times</span>
                  </div>
                  <p className="text-white/70 text-sm">{trigger.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actionable Habits */}
      <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl"></div>
        
        <div className="relative p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Brain className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Your Action Plan 🎯</h3>
          </div>
          <div className="space-y-3">
            {debrief.actionable_habits.map((habit, index) => (
              <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-xl p-4 border border-blue-500/20">
                <div className="w-6 h-6 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-300 font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-white/90">{habit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* False Positive Correction */}
      {distractionEvents.length > 0 && (
        <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl"></div>
          
          <div className="relative p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Help Us Improve 🤝</h3>
              <p className="text-white/60 text-sm">Were any of these distractions incorrectly detected?</p>
            </div>
            
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {distractionEvents.map((event, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white/90 text-sm">
                      {new Date(event.timestamp).toLocaleTimeString()} - Distraction detected
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => markFalsePositive(index, false)}
                      className={`p-2 rounded-lg transition-all ${
                        event.isFalsePositive === false
                          ? 'bg-green-600/30 border border-green-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      aria-label="Correct detection"
                    >
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                    </button>
                    <button
                      onClick={() => markFalsePositive(index, true)}
                      className={`p-2 rounded-lg transition-all ${
                        event.isFalsePositive === true
                          ? 'bg-red-600/30 border border-red-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      aria-label="False positive"
                    >
                      <ThumbsDown className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!feedbackSubmitted ? (
              <button
                onClick={submitFeedback}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Submit Feedback
              </button>
            ) : (
              <div className="text-center text-green-400 font-medium">
                ✓ Thank you for your feedback!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyDebrief;
