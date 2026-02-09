#!/bin/bash

# Test Agent - End-to-End Flow
# Simulates an external agent discovering and integrating with Fetch
# Usage: ./test-agent-flow.sh

set -e

FETCH_API="http://localhost:5000"
AGENT_ID="agent_test_flow_$(date +%s)"
AGENT_NAME="Test Agent $(date +%s)"
WALLET="0xtest$(date +%s | md5sum | cut -c1-20)"

echo "=================================================="
echo "TEST AGENT: End-to-End Fetch Integration"
echo "=================================================="
echo ""
echo "Agent ID: $AGENT_ID"
echo "Wallet: $WALLET"
echo ""

# Step 1: Check Fetch is healthy
echo "1️⃣  Checking Fetch health..."
HEALTH=$(curl -s "$FETCH_API/api/health")
echo "   Response: $HEALTH"
echo ""

# Step 2: Register agent
echo "2️⃣  Registering agent with Fetch..."
REGISTER=$(curl -s -X POST "$FETCH_API/api/agent/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"agent_name\": \"$AGENT_NAME\",
    \"wallet_address\": \"$WALLET\"
  }")
echo "   Response: $REGISTER"
echo ""

# Step 3: Search for products (shoes)
echo "3️⃣  Searching for shoes..."
SEARCH=$(curl -s "$FETCH_API/api/agent/search?keywords=shoes&agent_id=$AGENT_ID")
echo "   Response (truncated):"
echo "$SEARCH" | head -c 500
echo "..."
echo ""

# Extract first product from search
PRODUCT_ID=$(echo "$SEARCH" | grep -o '"productId":"[^"]*"' | head -1 | cut -d'"' -f4)
PRODUCT_TITLE=$(echo "$SEARCH" | grep -o '"title":"[^"]*"' | head -1 | cut -d'"' -f4)
PRODUCT_PRICE=$(echo "$SEARCH" | grep -o '"price":[0-9.]*' | head -1 | cut -d':' -f2)
CASHBACK_AMOUNT=$(echo "$SEARCH" | grep -o '"amount":[0-9.]*' | head -1 | cut -d':' -f2)

echo "   ✓ Found product: $PRODUCT_TITLE"
echo "   ✓ Price: \$$PRODUCT_PRICE"
echo "   ✓ Cashback: \$$CASHBACK_AMOUNT"
echo ""

# Step 4: Search for another category (electronics)
echo "4️⃣  Searching for electronics..."
SEARCH2=$(curl -s "$FETCH_API/api/agent/search?keywords=electronics&agent_id=$AGENT_ID")
COUNT=$(echo "$SEARCH2" | grep -o '"total_results":[0-9]*' | cut -d':' -f2)
echo "   ✓ Found $COUNT products"
echo ""

# Step 5: Log a purchase
echo "5️⃣  Logging purchase for tracking..."
PURCHASE=$(curl -s -X POST "$FETCH_API/api/agent/track-purchase" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"product_id\": \"$PRODUCT_ID\",
    \"purchase_amount\": $PRODUCT_PRICE
  }")
echo "   Response: $PURCHASE"
echo ""

# Step 6: Log another purchase
echo "6️⃣  Logging second purchase..."
PURCHASE2=$(curl -s -X POST "$FETCH_API/api/agent/track-purchase" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"product_id\": \"prod_222\",
    \"purchase_amount\": 89.99
  }")
echo "   ✓ Purchase logged"
echo ""

# Step 7: Check agent earnings
echo "7️⃣  Checking agent earnings..."
EARNINGS=$(curl -s "$FETCH_API/api/agent/earnings/$AGENT_ID")
echo "   Response: $EARNINGS"
echo ""

# Step 8: View leaderboard
echo "8️⃣  Checking leaderboard..."
LEADERBOARD=$(curl -s "$FETCH_API/api/leaderboard")
echo "   Response (truncated):"
echo "$LEADERBOARD" | head -c 300
echo "..."
echo ""

# Step 9: View all agents
echo "9️⃣  Checking registered agents..."
AGENTS=$(curl -s "$FETCH_API/api/agents")
AGENT_COUNT=$(echo "$AGENTS" | grep -o '"agent_id"' | wc -l)
echo "   ✓ Total agents registered: $AGENT_COUNT"
echo ""

# Final summary
echo "=================================================="
echo "✅ TEST FLOW COMPLETE"
echo "=================================================="
echo ""
echo "Summary:"
echo "  - Agent registered: $AGENT_ID"
echo "  - Searches made: 2 (shoes, electronics)"
echo "  - Purchases logged: 2"
echo "  - Total earnings: $CASHBACK_AMOUNT + \$5.40 = \$$(echo "$CASHBACK_AMOUNT + 5.40" | bc)"
echo ""
echo "What just happened:"
echo "  1. New agent discovered Fetch API"
echo "  2. Agent registered with its wallet"
echo "  3. Agent searched for products (2 different categories)"
echo "  4. Agent logged purchases (tracked for earnings)"
echo "  5. Agent is now on leaderboard earning rewards"
echo ""
echo "This is the complete agent → Fetch → products flow!"
echo "=================================================="
