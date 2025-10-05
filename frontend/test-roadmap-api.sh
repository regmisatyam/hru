#!/bin/bash

# Test script for Roadmap API endpoint

echo "🧪 Testing Roadmap API Endpoint"
echo "================================"
echo ""

# Check if server is running
echo "1️⃣  Checking if Gemini backend is running..."
HEALTH_CHECK=$(curl -s http://localhost:8002/health 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Server is not running on port 8002"
    echo "💡 Run: npm run dev:all"
    exit 1
fi

echo "✅ Server is running!"
echo ""

# Test roadmap generation
echo "2️⃣  Generating roadmap for 'React.js'..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8002/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"topic": "React.js"}')

echo "$RESPONSE" | jq '.' 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Roadmap generated successfully!"
    echo ""
    
    # Extract stats
    TOPIC=$(echo "$RESPONSE" | jq -r '.topic')
    STAGES=$(echo "$RESPONSE" | jq '.stages | length')
    
    echo "📊 Roadmap Stats:"
    echo "   Topic: $TOPIC"
    echo "   Stages: $STAGES"
    echo ""
else
    echo ""
    echo "⚠️  Response received but not in JSON format"
    echo "This might be a rate limit or error message"
    echo ""
    echo "Raw response:"
    echo "$RESPONSE"
fi

# Test with another topic
echo "3️⃣  Testing with 'Python Programming'..."
echo ""

curl -s -X POST http://localhost:8002/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"topic": "Python Programming"}' | jq '.topic, (.stages | length)' 2>/dev/null

echo ""
echo "✅ All tests completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:5173/roadmap in your browser"
echo "   2. Enter any topic to generate a learning roadmap"
echo "   3. View the AI-generated learning path"
