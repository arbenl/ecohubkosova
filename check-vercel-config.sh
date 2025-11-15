#!/bin/bash
# Vercel Environment Variables Checker
# Run this to verify your Vercel configuration is correct

set -e

echo "🔍 Vercel & Supabase Configuration Checker"
echo "==========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Check local environment variables
echo "📋 Local Environment Variables (.env.local):"
echo "-------------------------------------------"

if [ -f .env.local ]; then
    # Check for required variables
    vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "SUPABASE_DB_URL")
    
    for var in "${vars[@]}"; do
        if grep -q "^$var=" .env.local; then
            value=$(grep "^$var=" .env.local | cut -d'=' -f2- | cut -c1-50)
            echo "✅ $var"
            echo "   Value: $value..."
        else
            echo "❌ $var - MISSING"
        fi
    done
else
    echo "❌ .env.local not found"
fi

echo ""
echo "🌐 Vercel Environment:"
echo "---------------------"

# Try to get project info
if vercel whoami > /dev/null 2>&1; then
    echo "✅ Logged in to Vercel"
    
    # Try to list environment variables
    echo ""
    echo "Environment Variables in Vercel:"
    vercel env list 2>/dev/null || echo "⚠️  Could not retrieve env variables (might need to be in project directory)"
else
    echo "❌ Not logged in to Vercel"
    echo "   Run: vercel login"
fi

echo ""
echo "✅ Configuration check complete!"
echo ""
echo "Next steps:"
echo "1. Verify all 4 variables are set in Vercel dashboard"
echo "2. Ensure they're set for Production and Preview environments"
echo "3. Redeploy: git push origin next_upgrade"
echo "4. Monitor: vercel logs --tail"
