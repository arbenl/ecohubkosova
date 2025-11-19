const fs = require('fs');
const path = require('path');

// Function to get component name from file
function getComponentName(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Look for export default function ComponentName
    const defaultExportMatch = content.match(/export default function (\w+)/);
    if (defaultExportMatch) {
      return defaultExportMatch[1];
    }
    // Look for const ComponentName = or function ComponentName
    const namedMatch = content.match(/(?:const|function)\s+(\w+)\s*[=(]/);
    if (namedMatch) {
      return namedMatch[1];
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Function to fix imports in a test file
function fixTestFile(testFilePath) {
  const content = fs.readFileSync(testFilePath, 'utf8');
  let newContent = content;

  // Fix import { function } from "component" patterns
  const functionImportRegex = /import \{ function \} from "([^"]+)"/g;
  newContent = newContent.replace(functionImportRegex, (match, importPath) => {
    const sourceFilePath = path.resolve(path.dirname(testFilePath), importPath + '.tsx');
    const componentName = getComponentName(sourceFilePath);
    if (componentName) {
      return `import { ${componentName} } from "./${importPath}"`;
    }
    return match; // Keep original if can't determine component name
  });

  // Fix import { actions } from "actions" patterns
  const actionsImportRegex = /import \{ actions \} from "actions"/g;
  newContent = newContent.replace(actionsImportRegex, 'import { actions } from "./actions"');

  // Fix other common import patterns
  const otherImportRegex = /import \{ (\w+) \} from "(\w+)"/g;
  newContent = newContent.replace(otherImportRegex, (match, importName, importPath) => {
    if (importName === 'dynamic') {
      return `import { ${importName} } from "./${importPath}"`;
    }
    if (importName === 'route') {
      return `import { ${importName} } from "./${importPath}"`;
    }
    return match;
  });

  // Write back if changed
  if (newContent !== content) {
    fs.writeFileSync(testFilePath, newContent);
    console.log(`Fixed: ${testFilePath}`);
  }
}

// Find all test files
function findTestFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findTestFiles(fullPath));
    } else if (item.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const testFiles = findTestFiles(srcDir);

console.log(`Found ${testFiles.length} test files`);

for (const testFile of testFiles) {
  fixTestFile(testFile);
}

console.log('Import fixes completed');