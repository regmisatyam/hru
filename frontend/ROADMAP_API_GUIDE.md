# Roadmap API - Complete Guide

## 🎯 Overview

The `/api/roadmap` endpoint generates comprehensive, AI-powered learning roadmaps for any topic using Gemini AI.

## 📡 Endpoint Details

**URL:** `POST http://localhost:8002/api/roadmap`  
**Content-Type:** `application/json`  
**Authentication:** None (API key handled by backend)

## 📥 Request Format

```json
{
  "topic": "string (required)"
}
```

### Example Requests

```bash
# Web Development
curl -X POST http://localhost:8002/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"topic": "React.js"}'

# Data Science
curl -X POST http://localhost:8002/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"topic": "Data Science with Python"}'

# AI/ML
curl -X POST http://localhost:8002/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"topic": "Neural Networks"}'

# Business
curl -X POST http://localhost:8002/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"topic": "Digital Marketing"}'
```

## 📤 Response Format

```typescript
{
  "topic": string,
  "stages": [
    {
      "title": string,        // Stage name (e.g., "Foundations", "Advanced")
      "subtopics": string[],  // 4-6 specific learning topics
      "projects": string[]    // 2-4 hands-on projects
    }
  ]
}
```

### Example Response

```json
{
  "topic": "React.js",
  "stages": [
    {
      "title": "🌱 Foundations",
      "subtopics": [
        "JavaScript ES6+ fundamentals",
        "JSX syntax and component basics",
        "Props and state management",
        "Event handling and forms",
        "Component lifecycle",
        "React Hooks (useState, useEffect)"
      ],
      "projects": [
        "Build a todo list app",
        "Create a weather dashboard",
        "Develop a simple blog"
      ]
    },
    {
      "title": "🚀 Intermediate Skills",
      "subtopics": [
        "React Router for navigation",
        "Context API for state management",
        "Custom hooks creation",
        "API integration with fetch/axios",
        "Error boundaries and error handling",
        "Performance optimization techniques"
      ],
      "projects": [
        "E-commerce product catalog",
        "Social media dashboard",
        "Real-time chat application"
      ]
    },
    {
      "title": "💎 Advanced Mastery",
      "subtopics": [
        "Redux or Zustand for complex state",
        "Server-side rendering (Next.js)",
        "Testing with Jest and React Testing Library",
        "TypeScript with React",
        "Advanced patterns (HOCs, render props)",
        "Code splitting and lazy loading"
      ],
      "projects": [
        "Full-stack MERN application",
        "Progressive Web App (PWA)",
        "Admin dashboard with analytics"
      ]
    },
    {
      "title": "🎓 Expert Level",
      "subtopics": [
        "Micro-frontends architecture",
        "React Native for mobile apps",
        "GraphQL integration",
        "Advanced performance profiling",
        "Contributing to React ecosystem",
        "Design systems and component libraries"
      ],
      "projects": [
        "Build and publish an npm package",
        "Create a reusable component library",
        "Develop a production SaaS application"
      ]
    }
  ]
}
```

## 🎨 Frontend Integration

### Roadmap.tsx Usage

```typescript
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || 'http://localhost:8002';

const generateRoadmap = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${GEMINI_API_URL}/api/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    setRoadmap(data);
  } catch (error) {
    console.error('Failed to generate roadmap:', error);
  } finally {
    setLoading(false);
  }
};
```

### Displaying Results

```tsx
{roadmap && roadmap.stages && (
  <div className="space-y-6">
    {roadmap.stages.map((stage, i) => (
      <div key={i} className="roadmap-stage">
        <h3>{stage.title}</h3>
        
        <div className="subtopics">
          <h4>Key Topics:</h4>
          <ul>
            {stage.subtopics.map((topic, j) => (
              <li key={j}>{topic}</li>
            ))}
          </ul>
        </div>
        
        <div className="projects">
          <h4>Projects:</h4>
          {stage.projects.map((project, k) => (
            <span key={k}>{project}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
)}
```

## ⚡ AI Prompt Strategy

The endpoint uses a carefully crafted prompt to ensure quality:

```
Requirements:
- Create 4-6 progressive learning stages (Beginner → Expert)
- Each stage has 4-6 specific subtopics
- Each stage suggests 2-4 hands-on projects
- Practical, actionable, industry-relevant
- Modern best practices
- Real-world applicable projects
```

## 🛡️ Error Handling

### Rate Limit Fallback

If Gemini API rate limit is reached, a generic but useful roadmap is returned:

```json
{
  "topic": "Your Topic",
  "stages": [
    {
      "title": "🌱 Foundations",
      "subtopics": [
        "Core concepts and terminology",
        "Historical context and evolution",
        "Basic principles and theories",
        "Essential tools and technologies"
      ],
      "projects": [
        "Create a simple introductory project",
        "Build a concept demonstration"
      ]
    },
    {
      "title": "🚀 Intermediate Skills",
      "subtopics": [
        "Advanced techniques and methods",
        "Best practices and patterns",
        "Common challenges and solutions"
      ],
      "projects": [
        "Build a medium-complexity application",
        "Contribute to an open-source project"
      ]
    },
    {
      "title": "💎 Advanced Mastery",
      "subtopics": [
        "Performance optimization",
        "Scalability and architecture",
        "Security best practices"
      ],
      "projects": [
        "Design a production-ready system",
        "Create a portfolio project"
      ]
    },
    {
      "title": "🎓 Expert Level",
      "subtopics": [
        "Cutting-edge innovations",
        "Industry trends",
        "Leadership and mentoring"
      ],
      "projects": [
        "Publish tutorials or articles",
        "Develop an innovative framework"
      ]
    }
  ]
}
```

### Input Validation

```typescript
if (!topic || topic.trim().length === 0) {
  return res.status(400).json({
    error: 'Topic is required'
  });
}
```

## 📊 Performance

- **Average response time:** 3-5 seconds (AI generation)
- **Fallback response time:** <100ms (instant)
- **Token usage:** ~500-1000 tokens per roadmap
- **Rate limit impact:** Uses 1 request from daily quota

## 🎯 Use Cases

### Educational Platform
```javascript
// Generate personalized learning paths
const courses = ['Python', 'JavaScript', 'Data Science'];
const roadmaps = await Promise.all(
  courses.map(course => 
    fetch(`${API_URL}/api/roadmap`, {
      method: 'POST',
      body: JSON.stringify({ topic: course })
    })
  )
);
```

### Career Guidance
```javascript
// Create skill development plans
const generateCareerPath = async (role) => {
  const roadmap = await fetch(`${API_URL}/api/roadmap`, {
    method: 'POST',
    body: JSON.stringify({ topic: `${role} career path` })
  });
  return roadmap.json();
};
```

### Study Planning
```javascript
// Before starting focus session
const topic = localStorage.getItem('currentTopic');
const roadmap = await generateRoadmap(topic);
// Use roadmap.stages to guide session goals
```

## 🔧 Customization

### Modify AI Prompt

Edit `src/api/server.ts` to customize the roadmap structure:

```typescript
const prompt = `You are an expert learning path designer...

Requirements:
- Create 3-5 stages (customize number)
- Focus on [specific aspect]
- Include [additional requirements]
- Tone: [casual/formal/technical]
`;
```

### Add Difficulty Levels

```typescript
interface RoadmapRequest {
  topic: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // learning duration in weeks
}
```

### Cache Responses

```typescript
const roadmapCache = new Map();

app.post('/api/roadmap', async (req, res) => {
  const { topic } = req.body;
  
  // Check cache first
  if (roadmapCache.has(topic)) {
    return res.json(roadmapCache.get(topic));
  }
  
  // Generate and cache
  const roadmap = await generateRoadmap(topic);
  roadmapCache.set(topic, roadmap);
  res.json(roadmap);
});
```

## 📈 Analytics

Track roadmap generation:

```typescript
console.log(`📚 Roadmap generated for: ${topic}`);
console.log(`   Stages: ${roadmapData.stages.length}`);
console.log(`   Total subtopics: ${roadmapData.stages.reduce((sum, s) => sum + s.subtopics.length, 0)}`);
console.log(`   Total projects: ${roadmapData.stages.reduce((sum, s) => sum + s.projects.length, 0)}`);
```

## 🚀 Next Steps

1. **Test the endpoint:**
   ```bash
   curl -X POST http://localhost:8002/api/roadmap \
     -H "Content-Type: application/json" \
     -d '{"topic": "Your favorite topic"}'
   ```

2. **Integrate in frontend:**
   - Visit `/roadmap` route in your app
   - Enter a topic
   - Click "Generate Learning Roadmap"

3. **Customize as needed:**
   - Adjust number of stages
   - Modify prompt for different tones
   - Add caching for popular topics

## 💡 Tips

- **Be specific with topics:** "React Hooks" > "React"
- **Try variations:** "Web Development with TypeScript" vs just "TypeScript"
- **Combine topics:** "Full-stack Development with MERN"
- **Career-focused:** "Frontend Developer Career Path"
- **Skill-specific:** "Data Visualization with D3.js"

The more specific your topic, the more tailored your roadmap! 🎯
