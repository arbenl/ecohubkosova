#!/bin/bash
# App Structure Reorganization - Step by Step

# This script reorganizes the Next.js app structure from flat to grouped routes
# Run this from the project root: bash reorganize-structure.sh

set -e

echo "🚀 Starting App Structure Reorganization"
echo "========================================"
echo ""

APPS_DIR="src/app"

# Step 1: Create route group directories
echo "Step 1: Creating route group directories..."
mkdir -p "$APPS_DIR/(public)/{about,explore,legal}"
mkdir -p "$APPS_DIR/(auth)"
mkdir -p "$APPS_DIR/(private)/admin"
echo "✅ Route group directories created"
echo ""

# Step 2: Create layout files
echo "Step 2: Creating layout files..."

# Public layout
cat > "$APPS_DIR/(public)/layout.tsx" << 'EOF'
import { BaseLayout } from "@/components/base-layout"
import type { ReactNode } from "react"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>
}
EOF
echo "✅ Created (public)/layout.tsx"

# Auth layout
cat > "$APPS_DIR/(auth)/layout.tsx" << 'EOF'
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {children}
    </div>
  )
}
EOF
echo "✅ Created (auth)/layout.tsx"

# Private layout
cat > "$APPS_DIR/(private)/layout.tsx" << 'EOF'
import { BaseLayout } from "@/components/base-layout"
import type { ReactNode } from "react"

export default function PrivateLayout({ children }: { children: ReactNode }) {
  // Middleware in middleware.ts handles protection
  return <BaseLayout>{children}</BaseLayout>
}
EOF
echo "✅ Created (private)/layout.tsx"
echo ""

# Step 3: Migration instructions
echo "Step 3: Migration Instructions"
echo "=============================="
echo ""
echo "Now manually move/copy files:"
echo ""
echo "PUBLIC PAGES:"
echo "  cp src/app/landing/page.tsx src/app/(public)/home/"
echo "  cp src/app/rreth-nesh/page.tsx src/app/(public)/about/"
echo "  cp src/app/misioni/page.tsx src/app/(public)/about/mission/"
echo "  cp src/app/koalicioni/page.tsx src/app/(public)/about/coalition/"
echo "  cp src/app/eksploro/page.tsx src/app/(public)/explore/"
echo "  cp src/app/drejtoria/page.tsx src/app/(public)/explore/opportunities/"
echo "  cp src/app/tregu/page.tsx src/app/(public)/explore/marketplace/"
echo "  cp src/app/qendra-e-dijes/page.tsx src/app/(public)/explore/knowledge/"
echo "  cp src/app/partnere/page.tsx src/app/(public)/partners/"
echo "  cp src/app/kontakti/page.tsx src/app/(public)/contact/"
echo "  cp src/app/ndihme/page.tsx src/app/(public)/help/"
echo "  cp src/app/faq/page.tsx src/app/(public)/"
echo "  cp src/app/kushtet-e-perdorimit/page.tsx src/app/(public)/legal/terms/"
echo ""
echo "AUTH PAGES:"
echo "  cp src/app/auth/kycu/page.tsx src/app/(auth)/login/"
echo "  cp src/app/auth/regjistrohu/page.tsx src/app/(auth)/register/"
echo "  cp src/app/auth/sukses/page.tsx src/app/(auth)/success/"
echo "  cp src/app/auth/callback/page.tsx src/app/(auth)/callback/"
echo ""
echo "PRIVATE PAGES:"
echo "  cp src/app/profili/page.tsx src/app/(private)/profile/"
echo ""
echo "Step 4: After copying files, update imports in copied files"
echo ""
echo "Step 5: Update all links in components and pages:"
echo "  - /landing → /home"
echo "  - /rreth-nesh → /about"
echo "  - /misioni → /about/mission"
echo "  - /koalicioni → /about/coalition"
echo "  - /eksploro → /explore"
echo "  - /drejtoria → /explore/opportunities"
echo "  - /tregu → /explore/marketplace"
echo "  - /qendra-e-dijes → /explore/knowledge"
echo "  - /partnere → /partners"
echo "  - /kontakti → /contact"
echo "  - /ndihme → /help"
echo "  - /faq → /faq"
echo "  - /kushtet-e-perdorimit → /legal/terms"
echo "  - /auth/kycu → /login"
echo "  - /auth/regjistrohu → /register"
echo "  - /auth/sukses → /success"
echo "  - /profili → /profile"
echo ""
echo "Step 6: Update middleware.ts redirects"
echo ""
echo "Step 7: Test all routes in dev environment"
echo ""
echo "Step 8: Delete old directories when ready:"
echo "  rm -rf src/app/landing"
echo "  rm -rf src/app/auth"
echo "  rm -rf src/app/rreth-nesh"
echo "  ... etc"
echo ""
echo "✅ Structure reorganization ready!"
echo ""
echo "📝 Reference: STRUCTURE_REORGANIZATION.md"
