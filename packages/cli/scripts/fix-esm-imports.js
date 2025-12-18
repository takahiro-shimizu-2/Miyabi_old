#!/usr/bin/env node
/**
 * Post-build script to fix ESM imports by adding .js extensions
 * This fixes the "Cannot find module" error when running ESM with Node.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist');

function fixImportsInFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix relative imports without .js extension
  // Matches: from './something' or from '../something' or from './path/to/something'
  const importRegex = /(from\s+['"])(\.\.?\/[^'"]+)(?<!\.js)(['"])/g;

  content = content.replace(importRegex, (match, prefix, path, suffix) => {
    // Don't add .js if it's a directory import (index.js)
    // or if it already has an extension
    if (path.endsWith('.js') || path.endsWith('.json')) {
      return match;
    }
    modified = true;
    return `${prefix}${path}.js${suffix}`;
  });

  // Also fix dynamic imports
  const dynamicImportRegex = /(import\s*\(\s*['"])(\.\.?\/[^'"]+)(?<!\.js)(['"]\s*\))/g;

  content = content.replace(dynamicImportRegex, (match, prefix, path, suffix) => {
    if (path.endsWith('.js') || path.endsWith('.json')) {
      return match;
    }
    modified = true;
    return `${prefix}${path}.js${suffix}`;
  });

  if (modified) {
    writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

function processDirectory(dir) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.endsWith('.js')) {
      fixImportsInFile(fullPath);
    }
  }
}

console.log('Fixing ESM imports in dist directory...');
processDirectory(distDir);
console.log('Done!');
