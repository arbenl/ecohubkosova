#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all test files with incorrect extensions
const testFiles = execSync('find /Users/arbenlila/development/ecohubkosova/src -name "*.test.test.tsx" -o -name "*.test.test.test.tsx" -o -name "*.test.test.test.test.tsx"', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${testFiles.length} test files to fix`);

testFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract component name from file path
    const fileName = path.basename(filePath);
    const componentName = fileName.replace(/\.test.*\.tsx$/, '');

    // Get the correct import path
    const dirPath = path.dirname(filePath);
    const componentFile = path.join(dirPath, `${componentName}.tsx`);
    const relativePath = `./${componentName}`;

    // Check if component file exists
    if (!fs.existsSync(componentFile)) {
      console.log(`Skipping ${filePath} - component file ${componentFile} not found`);
      return;
    }

    // Read component file to understand props
    const componentContent = fs.readFileSync(componentFile, 'utf8');
    const hasChildren = componentContent.includes('children: ReactNode') || componentContent.includes('children?: ReactNode');
    const hasTitle = componentContent.includes('title: string') || componentContent.includes('title?: string');
    const hasDescription = componentContent.includes('description: string') || componentContent.includes('description?: string');
    const hasLabel = componentContent.includes('label: string') || componentContent.includes('label?: string');
    const hasName = componentContent.includes('name: string') || componentContent.includes('name?: string');

    // Fix import statement
    let newContent = content
      .replace(/import\s*\{\s*[^}]+\}\s*from\s*["'][^"']*\.test["']/g, `import { ${componentName} } from "${relativePath}"`)
      .replace(/import\s*\{\s*[^}]+\.test[^}]*\}\s*from\s*["'][^"']*\.test["']/g, `import { ${componentName} } from "${relativePath}"`);

    // Fix component usage in JSX
    newContent = newContent
      .replace(new RegExp(`${componentName}\\.test`, 'g'), componentName)
      .replace(new RegExp(`${componentName}\\.test\\.test`, 'g'), componentName)
      .replace(new RegExp(`${componentName}\\.test\\.test\\.test`, 'g'), componentName);

    // Fix describe statement
    newContent = newContent.replace(/describe\(["'][^"]*\.test[^"]*component["']/g, `describe("${componentName} component"`);

    // Add required props based on component interface
    if (hasTitle && hasDescription && hasChildren) {
      newContent = newContent.replace(
        /render\(\s*<[^>]*>\s*\)/g,
        `render(\n      <${componentName} title="Test Title" description="Test Description">\n        <div>Test Content</div>\n      </${componentName}>\n    )`
      );
    } else if (hasLabel && hasName && hasChildren) {
      newContent = newContent.replace(
        /render\(\s*<[^>]*>\s*\)/g,
        `render(\n      <${componentName} label="Test Label" name="testField">\n        <input type="text" />\n      </${componentName}>\n    )`
      );
    } else if (hasChildren) {
      newContent = newContent.replace(
        /render\(\s*<[^>]*>\s*\)/g,
        `render(\n      <${componentName}>\n        <div>Test Content</div>\n      </${componentName}>\n    )`
      );
    }

    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${filePath}`);

  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
});

console.log('Done fixing test files');