#!/bin/bash

# Script to create a test user in Supabase for E2E testing
# This uses the Supabase service role key to bypass auth requirements

set -e

# Load environment variables
if [ -f .env.test ]; then
    export $(grep -v '^#' .env.test | xargs)
else
    echo "❌ .env.test not found. Please create it first."
    exit 1
fi

# Check required variables
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL"
    exit 1
fi

TEST_EMAIL="${TEST_USER_EMAIL:-e2e-test@ecohubkosova.test}"
TEST_PASSWORD="${TEST_USER_PASSWORD:-TestPass123!@E2E}"

echo "🔐 Creating test user in Supabase..."
echo "   Email: $TEST_EMAIL"
echo "   Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

# Use curl to create user via Supabase Auth Admin API
RESPONSE=$(curl -s -X POST \
  "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "email_confirm": true,
    "user_metadata": {
      "test_user": true
    }
  }')

# Check if user was created successfully
if echo "$RESPONSE" | grep -q "\"id\""; then
    USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "✅ Test user created successfully!"
    echo "   User ID: $USER_ID"
    echo ""
    echo "You can now run the E2E tests with:"
    echo "  pnpm exec playwright test e2e/auth.e2e.spec.ts"
else
    # Check if user already exists
    if echo "$RESPONSE" | grep -q "already exists"; then
        echo "⚠️  Test user already exists (this is fine)"
        echo "   Email: $TEST_EMAIL"
        echo ""
        echo "Proceeding with existing test user."
    else
        echo "❌ Failed to create test user"
        echo "   Response: $RESPONSE"
        exit 1
    fi
fi
