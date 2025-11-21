#!/bin/bash

echo "=== Sentry Smoke Test Verification ==="
echo ""

echo "1. Testing Server Route (/api/sentry-test)..."
echo "   Sending GET request..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3000/api/sentry-test 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "500" ]; then
    echo "   ✓ Server route returned 500 (expected)"
else
    echo "   ✗ Server route returned $HTTP_CODE (expected 500)"
fi

echo ""
echo "2. Check server logs for:"
echo "   - '[Sentry Test] Server DSN present: true'"
echo "   - '[Sentry Test] Captured exception with event ID: ...'"
echo ""
echo "3. For client test:"
echo "   - Open http://localhost:3000/sentry-test in browser"
echo "   - Click 'Throw Client Error' button"
echo "   - Check browser console for event ID"
echo ""
echo "4. Verify in Sentry Dashboard:"
echo "   - Go to https://sentry.io/organizations/human-p5/issues/"
echo "   - Filter by: environment:development"
echo "   - Look for:"
echo "     * 'Sentry Server Smoke Test Error' (from API route)"
echo "     * 'Sentry Client Smoke Test Error' (from page)"
echo ""
echo "=== Environment Check ==="
if [ -n "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    echo "✓ NEXT_PUBLIC_SENTRY_DSN is set"
else
    echo "✗ NEXT_PUBLIC_SENTRY_DSN is NOT set (required for client)"
fi

if [ -n "$SENTRY_DSN" ]; then
    echo "✓ SENTRY_DSN is set"
else
    echo "✗ SENTRY_DSN is NOT set (required for server)"
fi
