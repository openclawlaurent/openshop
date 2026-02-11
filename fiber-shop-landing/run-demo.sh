#!/bin/bash

echo "🚀 Starting Fetch Demo (Frontend + API)"
echo ""

# Kill any existing processes on ports 3000 or 5000
pkill -f "npm (start|run api)" 2>/dev/null

# Start API in background
echo "📡 Starting API server on http://localhost:5000"
npm run api &
API_PID=$!

# Wait for API to start
sleep 3

# Start Frontend in background
echo "🎨 Starting React frontend on http://localhost:3000"
npm start &
FRONTEND_PID=$!

# Wait for everything to be ready
sleep 5

echo ""
echo "=========================================="
echo "✅ Fetch Demo is Running!"
echo "=========================================="
echo ""
echo "📡 API Server:      http://localhost:5000"
echo "🎨 Frontend Demo:   http://localhost:3000"
echo "🎯 Interactive Demo: http://localhost:3000/demo"
echo ""
echo "Steps to test:"
echo "  1. Open http://localhost:3000/demo in your browser"
echo "  2. Click '✅ Register Agent'"
echo "  3. Enter search keywords (e.g., 'shoes', 'nike')"
echo "  4. Click '🔍 Search Products'"
echo "  5. See results with cashback amounts!"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Keep both running
wait $API_PID $FRONTEND_PID
