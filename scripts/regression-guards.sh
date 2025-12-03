#!/bin/bash
set -e

# 1. Forbid manual locale prefixing
if grep -r "/\${locale}" src; then
  echo "Error: Manual locale prefixing found. Use locale-aware navigation instead."
  exit 1
fi

# 2. Forbid locale-dropping redirect/router usage in app code
# We search for imports from "next/navigation" and then check if redirect/useRouter/usePathname are used in the same file.
# This is a rough check.
if grep -r 'from "next/navigation"' src/app src/components src/lib | grep -E "redirect|useRouter|usePathname"; then
   echo "Error: Usage of next/navigation primitives found. Use @/i18n/routing instead."
   exit 1
fi

echo "Regression guards passed."
