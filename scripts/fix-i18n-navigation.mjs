#!/usr/bin/env node

/**
 * Script to fix locale/i18n navigation issues across the codebase
 * 
 * This script:
 * 1. Replaces `import Link from "next/link"` with `import { Link } from "@/i18n/routing"`
 * 2. Replaces `import { useRouter, usePathname } from "next/navigation"` with imports from "@/i18n/routing"
 * 3. Removes manual locale prefixing in href attributes
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const filesToFix = [
    // Components
    'src/components/sidebars/about-sidebar.tsx',
    'src/components/sidebars/legal-sidebar.tsx',
    'src/components/sidebars/knowledge-sidebar.tsx',
    'src/components/footer.tsx',
    'src/components/dashboard/latest-articles.tsx',
    'src/components/dashboard/key-partners.tsx',
    'src/components/dashboard/quick-actions-card.tsx',
    'src/components/header-client.tsx',
    'src/components/marketplace-v2/EmptyState.tsx',
    'src/components/marketplace-v2/ListingCardV2.tsx',
    'src/components/shared/empty-state-block.tsx',
    'src/components/layout/FooterV2.tsx',
    'src/components/landing/landing-auth-panel.tsx',
    'src/components/ui/filter-pill.tsx',
    'src/components/admin/admin-quick-action-card.tsx',

    // Pages - Auth
    'src/app/[locale]/(auth)/login/page.tsx',
    'src/app/[locale]/(auth)/success/page.tsx',
    'src/app/[locale]/(auth)/register/page.tsx',

    // Pages - Protected
    'src/app/[locale]/(protected)/my/page.tsx',
    'src/app/[locale]/(protected)/my/saved-listings/saved-listing-card.tsx',
    'src/app/[locale]/(protected)/my/saved-listings/saved-listings-client.tsx',
    'src/app/[locale]/(protected)/my/organization/my-organization-client.tsx',
    'src/app/[locale]/(protected)/my/organization/organization-profile.tsx',
    'src/app/[locale]/(protected)/dashboard/latest-articles.tsx',
    'src/app/[locale]/(protected)/dashboard/key-partners.tsx',
    'src/app/[locale]/(protected)/dashboard/quick-actions-card.tsx',
    'src/app/[locale]/(protected)/admin/page.tsx',
    'src/app/[locale]/(protected)/admin/articles/articles-client-page.tsx',

    // Pages - Site
    'src/app/[locale]/(site)/help/cta.tsx',
    'src/app/[locale]/(site)/help/page.tsx',
    'src/app/[locale]/(site)/sustainability/page.tsx',
    'src/app/[locale]/(site)/knowledge/qendra-e-dijes-client-page.tsx',
    'src/app/[locale]/(site)/knowledge/articles/[id]/page.tsx',
    'src/app/[locale]/(site)/partners/PartnersClient.tsx',
    'src/app/[locale]/(site)/partners/[id]/page.tsx',
    'src/app/[locale]/(site)/partners/cta.tsx',
    'src/app/[locale]/(site)/explore/page.tsx',
    'src/app/[locale]/(site)/explore/cta.tsx',
    'src/app/[locale]/(site)/how-it-works/page.tsx',
    'src/app/[locale]/(site)/about/cta.tsx',
    'src/app/[locale]/(site)/about-us/page.tsx',
    'src/app/[locale]/(site)/marketplace/[id]/page.tsx',
    'src/app/[locale]/(site)/marketplace/add/add-listing-client-page.tsx',
    'src/app/[locale]/(site)/organizations/page.tsx',
    'src/app/[locale]/(site)/organizations/organizations-client-page.tsx',
    'src/app/[locale]/(site)/home/page.tsx',
    'src/app/[locale]/(site)/eco-organizations/EcoOrganizationsClient.tsx',
];

function fixFile(filePath) {
    try {
        let content = readFileSync(filePath, 'utf-8');
        let modified = false;

        // Fix: Replace next/link import
        if (content.includes('import Link from "next/link"') || content.includes("import Link from 'next/link'")) {
            content = content.replace(/import Link from ['"]next\/link['"]/g, 'import { Link } from "@/i18n/routing"');
            modified = true;
            console.log(`✓ Fixed Link import in ${filePath}`);
        }

        // Fix: Replace useRouter from next/navigation
        if (content.match(/import \{[^}]*useRouter[^}]*\} from ['"]next\/navigation['"]/)) {
            // Check if it's importing both useRouter and useSearchParams
            const match = content.match(/import \{([^}]*)\} from ['"]next\/navigation['"]/);
            if (match) {
                const imports = match[1].split(',').map(s => s.trim());
                const routerImports = imports.filter(i => i.includes('useRouter') || i.includes('usePathname'));
                const otherImports = imports.filter(i => !i.includes('useRouter') && !i.includes('usePathname'));

                if (routerImports.length > 0 && otherImports.length > 0) {
                    // Split into two imports
                    content = content.replace(
                        /import \{[^}]*\} from ['"]next\/navigation['"]/,
                        `import { ${otherImports.join(', ')} } from "next/navigation"\nimport { ${routerImports.join(', ')} } from "@/i18n/routing"`
                    );
                } else if (routerImports.length > 0) {
                    // Replace entirely
                    content = content.replace(
                        /import \{[^}]*\} from ['"]next\/navigation['"]/,
                        `import { ${routerImports.join(', ')} } from "@/i18n/routing"`
                    );
                }
                modified = true;
                console.log(`✓ Fixed navigation imports in ${filePath}`);
            }
        }

        if (modified) {
            writeFileSync(filePath, content, 'utf-8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return false;
    }
}

console.log('Starting i18n navigation fixes...\n');

let fixedCount = 0;
for (const file of filesToFix) {
    if (fixFile(file)) {
        fixedCount++;
    }
}

console.log(`\n✓ Fixed ${fixedCount} files`);
console.log('\nNote: Manual locale prefixing (e.g., `/${locale}/...`) must be removed manually.');
console.log('Use locale-aware Link/useRouter from @/i18n/routing with unprefixed paths.');
