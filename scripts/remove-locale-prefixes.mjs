#!/usr/bin/env node

/**
 * Script to remove manual locale prefixing from href attributes
 * Replaces href={`/${locale}/...`} with href="/..."
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/**/*.{ts,tsx}', { cwd: process.cwd() });

let totalReplacements = 0;
const modifiedFiles = [];

for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    const originalContent = content;

    // Replace href={`/${locale}/...`} with href="/..."
    content = content.replace(/href=\{`\/\$\{locale\}\/(.*?)`\}/g, 'href="/$1"');

    // Replace href={`/${params.locale}/...`} with href="/..."
    content = content.replace(/href=\{`\/\$\{params\.locale\}\/(.*?)`\}/g, 'href="/$1"');

    if (content !== originalContent) {
        writeFileSync(file, content, 'utf-8');
        const replacements = (originalContent.match(/href=\{`\/\$\{(params\.)?locale\}\//g) || []).length;
        totalReplacements += replacements;
        modifiedFiles.push({ file, replacements });
        console.log(`✓ ${file} (${replacements} replacements)`);
    }
}

console.log(`\n✅ Total: ${totalReplacements} replacements in ${modifiedFiles.length} files`);
