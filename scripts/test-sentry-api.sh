#!/bin/bash

echo "=== Sentry API Route Diagnostic ==="
echo ""

# Check if dev server is running
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✓ Dev server is running on port 3000"
else
    echo "✗ Dev server is NOT running on port 3000"
    echo "  Please start it with: pnpm dev"
    exit 1
fi

echo ""
echo "Testing /api/sentry-test route..."
echo ""

# Make request and capture response
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/sentry-test 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

echo ""
echo "=== Check Server Logs ==="
echo "Look for lines starting with '[Sentry Test API]' in your terminal where pnpm dev is running"
echo ""
echo "Expected logs:"
echo "  [Sentry Test API] Server DSN present: true"
echo "  [Sentry Test API] Captured exception with event ID: ..."
echo "  [Sentry Test API] Sentry client initialized: true"
