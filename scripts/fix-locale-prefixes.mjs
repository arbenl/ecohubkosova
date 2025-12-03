#!/usr/bin/env node

/**
 * Fix all manual /${locale} prefixes in navigation
 * Usage: node fix-locale-prefixes.mjs
 */

import fs from 'fs';
import path from 'path';

const fixes = [
    // Server-side redirects
    { pattern: /redirect\(`\/\$\{locale\}\/([^`]+)`\)/g, replacement: 'redirect(`/$1`)' },
    { pattern: /redirect\("\/\$\{locale\}\/([^"]+)"\)/g, replacement: 'redirect("/$1")' },
    { pattern: /redirect\('\/\$\{locale\}\/([^']+)'\)/g, replacement: "redirect('/$1')" },

    // Client-side router.push/replace
    { pattern: /router\.push\(`\/\$\{locale\}\/([^`]+)`\)/g, replacement: 'router.push(`/$1`)' },
    { pattern: /router\.push\("\/\$\{locale\}\/([^"]+)"\)/g, replacement: 'router.push("/$1")' },
    { pattern: /router\.replace\(`\/\$\{locale\}\/([^`]+)`\)/g, replacement: 'router.replace(`/$1`)' },

    // window.location
    { pattern: /window\.location\.replace\(`\/\$\{locale\}\/([^`]+)`\)/g, replacement: 'window.location.replace(`/$1`)' },
    { pattern: /window\.location\.href\s*=\s*`\/\$\{locale\}\/([^`]+)`/g, replacement: 'window.location.href = `/$1`' },
];

const filesToFix = [
    'src/app/[locale]/(protected)/my/saved-listings/page.tsx',
    'src/lib/auth/roles.ts',
    'src/app/[locale]/(protected)/dashboard/page.tsx',
    'src/app/[locale]/(protected)/my/profile/page.tsx',
    'src/app/[locale]/(site)/about/page.tsx',
    'src/app/[locale]/(protected)/my/organization/onboarding/page.tsx',
    'src/app/[locale]/(protected)/my/organization/page.tsx',
    'src/app/[locale]/(site)/marketplace-v2/actions.ts',
    'src/app/[locale]/(protected)/my/organization/actions.ts',
    'src/app/[locale]/(site)/about/mission/page.tsx',
    'src/app/[locale]/(protected)/my/organization/profile/page.tsx',
    'src/app/[locale]/(site)/marketplace-v2/add/page.tsx',
    'src/app/[locale]/(site)/knowledge/[id]/page.tsx',
    'src/app/[locale]/(protected)/admin/audits/page.tsx',
    'src/hooks/use-auth-form.ts',
    'src/app/[locale]/(protected)/my/profile/user-profile-edit-form.tsx',
    'src/app/[locale]/(protected)/my/organization/create-organization-form.tsx',
    'src/app/[locale]/(protected)/my/organization/profile/organization-profile-edit-form.tsx',
    'src/app/[locale]/(protected)/my/organization/claim-organization-form.tsx',
    'src/app/[locale]/(protected)/admin/profile/admin-profile-edit-form.tsx',
    'src/app/[locale]/(site)/marketplace/[id]/contact-listing-button.tsx',
    'src/components/marketplace/SaveButton.tsx',
    'src/app/[locale]/(site)/eco-organizations/EcoOrganizationsClient.tsx',
    'src/lib/auth/signout-handler.ts',
];

let totalChanges = 0;

for (const file of filesToFix) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        for (const { pattern, replacement } of fixes) {
            const matches = content.match(pattern);
            if (matches) {
                content = content.replace(pattern, replacement);
                changed = true;
                totalChanges += matches.length;
            }
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`✓ Fixed: ${file}`);
        }
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error(`✗ Error fixing ${file}:`, err.message);
        }
    }
}

console.log(`\n✓ Total fixes applied: ${totalChanges}`);
