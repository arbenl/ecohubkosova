#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { sync as globSync } from "glob";

const pattern = "src/**/*.{ts,tsx,js,jsx}";
const files = globSync(pattern, { absolute: true });

for (const file of files) {
    let code = fs.readFileSync(file, "utf8");
    if (code.includes('import Link from "next/link"')) {
        code = code.replace(
            /import\s+Link\s+from\s+["']next\/link["']/g,
            'import { Link } from "@/i18n/routing"'
        );
        fs.writeFileSync(file, code);
        console.log(`✅ Updated: ${path.relative(process.cwd(), file)}`);
    }
}