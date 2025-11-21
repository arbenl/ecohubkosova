#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const messagesDir = join(process.cwd(), 'messages');
const enDir = join(messagesDir, 'en');
const sqDir = join(messagesDir, 'sq');

const enFiles = readdirSync(enDir).filter(f => f.endsWith('.json'));
const sqFiles = readdirSync(sqDir).filter(f => f.endsWith('.json'));

let hasErrors = false;

// Check file parity
const enSet = new Set(enFiles);
const sqSet = new Set(sqFiles);

enFiles.forEach(file => {
    if (!sqSet.has(file)) {
        console.error(`❌ Missing SQ file: ${file}`);
        hasErrors = true;
    }
});

sqFiles.forEach(file => {
    if (!enSet.has(file)) {
        console.error(`❌ Missing EN file: ${file}`);
        hasErrors = true;
    }
});

// Check key consistency
function getKeys(obj, prefix = '') {
    let keys = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            keys = keys.concat(getKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

enFiles.forEach(file => {
    if (!sqSet.has(file)) return;

    const enContent = JSON.parse(readFileSync(join(enDir, file), 'utf-8'));
    const sqContent = JSON.parse(readFileSync(join(sqDir, file), 'utf-8'));

    const enKeys = new Set(getKeys(enContent));
    const sqKeys = new Set(getKeys(sqContent));

    const missingInEn = [...sqKeys].filter(k => !enKeys.has(k));
    const missingInSq = [...enKeys].filter(k => !sqKeys.has(k));

    if (missingInEn.length > 0) {
        console.error(`\n❌ ${file}: Missing keys in EN:`);
        missingInEn.forEach(k => console.error(`  - ${k}`));
        hasErrors = true;
    }

    if (missingInSq.length > 0) {
        console.error(`\n❌ ${file}: Missing keys in SQ:`);
        missingInSq.forEach(k => console.error(`  - ${k}`));
        hasErrors = true;
    }
});

if (hasErrors) {
    console.error('\n❌ i18n consistency check failed');
    process.exit(1);
} else {
    console.log('✅ i18n consistency check passed');
}
