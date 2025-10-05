# Gemini API Rate Limits & Solutions

## ⚠️ Rate Limit Error Encountered

You're seeing this error because you've hit the **Gemini API free tier daily quota**.

### Error Details:
```
429 Too Many Requests
Quota exceeded: generativelanguage.googleapis.com/generate_content_free_tier_requests
Limit: 250 requests per day
Model: gemini-2.5-flash
```

## 🔧 Fixes Applied

### 1. Switched to Better Model
Changed from `gemini-2.5-flash` to `gemini-1.5-flash`:

| Model | Free Tier Limit | Speed | Quality |
|-------|----------------|-------|---------|
| ~~gemini-2.5-flash~~ | 250/day | Fastest | Newest |
| **gemini-1.5-flash** ✅ | **1,500/day** | Fast | Excellent |

**Result:** 6x more daily requests!

### 2. Enhanced Error Handling
Added smart fallback responses when rate limit is hit:
- Micro-nudges: Uses pre-written coaching tips
- Study debrief: Generates helpful summary without AI
- Logs clear warnings in console

### 3. Better Error Detection
Now detects rate limit errors (429) and provides helpful guidance.

## 📊 Gemini API Free Tier Quotas

### Current Limits (Free Tier)
| Model | Requests/Day | Requests/Minute | Tokens/Minute |
|-------|--------------|-----------------|---------------|
| gemini-1.5-flash | **1,500** | 15 | 1,000,000 |
| gemini-1.5-pro | 50 | 2 | 32,000 |
| gemini-2.0-flash-exp | 1,500 | 10 | 4,000,000 |

Source: [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

## 🚀 Solutions

### Option 1: Wait for Quota Reset (Free)
- Quotas reset **daily at midnight Pacific Time**
- You've used 250 requests today
- Tomorrow you'll get 1,500 requests with new model

### Option 2: Upgrade to Paid Tier (Recommended for Production)
**Pay-as-you-go pricing:**
- gemini-1.5-flash: $0.075 per 1M input tokens
- gemini-1.5-pro: $1.25 per 1M input tokens
- Much higher rate limits (10,000+ requests/day)

[Upgrade here](https://ai.google.dev/pricing)

### Option 3: Use Multiple API Keys (Workaround)
Create additional Google accounts and rotate API keys:
```env
GEMINI_API_KEY=AIzaSy...key1
GEMINI_API_KEY_BACKUP=AIzaSy...key2
```

### Option 4: Implement Request Caching (Developer)
Cache AI responses for common scenarios:
```typescript
// Example: Cache nudges by distraction count
const cache = new Map();
if (cache.has(distraction_count)) {
  return cache.get(distraction_count);
}
```

## 🛡️ Current Behavior

### When Rate Limit Hit:
✅ **App still works!** Fallback responses are used:

**Micro-Nudges:**
- "Take a deep breath. Inhale 4, hold 4, exhale 4."
- "Sit up straight. Roll shoulders back and relax."
- "Stand and stretch for 30 seconds!"

**Study Debrief:**
- Summary of session duration and focus score
- Generic strengths and actionable habits
- No AI-generated personalization

**Console Logs:**
```
⚠️  Gemini API rate limit reached. Using fallback debrief.
💡 Tip: Upgrade to paid tier or wait until tomorrow for quota reset.
```

## 📈 Monitoring Your Usage

### Check Current Usage:
```bash
# Test if API is working
curl -X POST http://localhost:8002/api/micro-nudge \
  -H "Content-Type: application/json" \
  -d '{"distraction_count":1,"vibe":"calm","session_duration":100,"recent_events":[]}'

# If you get a real AI response → Under quota ✅
# If you get fallback response → Rate limited ⚠️
```

### Google AI Studio Dashboard:
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with account that owns the API key
3. Check "Quota" or "Usage" section

## 💡 Best Practices Going Forward

### 1. **Minimize API Calls**
```typescript
// Bad: Call on every distraction
if (distraction) callGemini();

// Good: Call after pattern detected
if (distractionCount >= 3) callGemini();
```

### 2. **Cache Responses**
Store common AI responses to avoid repeated calls

### 3. **Use Batch Requests**
Combine multiple questions into one API call

### 4. **Implement Exponential Backoff**
Retry failed requests with increasing delays

### 5. **Monitor Usage**
Log API calls to track daily consumption

## 🔄 What Changed in Code

### server.ts
```typescript
// Before:
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// After:
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// 1,500 requests/day instead of 250!
```

### Error Handling
```typescript
catch (error: any) {
  // Now checks for rate limits
  const isRateLimit = error?.status === 429 || error?.message?.includes('quota');
  if (isRateLimit) {
    console.warn('⚠️  Gemini API rate limit reached. Using fallback.');
  }
  // Returns fallback response
}
```

## ✅ Action Items

1. **Immediate (Today):**
   - ✅ Use fallback responses (already implemented)
   - ✅ Wait for quota reset (midnight PT)

2. **Short-term (This Week):**
   - Consider upgrading to paid tier if heavy usage expected
   - Implement response caching for common scenarios
   - Monitor daily API usage

3. **Long-term (Production):**
   - Set up billing alerts in Google Cloud
   - Implement request throttling
   - Consider alternative AI providers as backup

## 🆘 Need Help?

- **Rate Limit Docs:** https://ai.google.dev/gemini-api/docs/rate-limits
- **Pricing Info:** https://ai.google.dev/pricing  
- **Upgrade Billing:** https://console.cloud.google.com/billing

Your app will continue working with fallback responses until quota resets! 🎉
