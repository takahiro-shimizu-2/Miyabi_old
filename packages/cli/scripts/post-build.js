#!/usr/bin/env node
/**
 * Post-build script for cross-platform compatibility
 * Sets executable permission on Unix-like systems (no-op on Windows)
 */

import { chmodSync, existsSync } from 'fs';
import { platform } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distIndex = join(__dirname, '..', 'dist', 'index.js');

// Only set executable permission on Unix-like systems
if (platform() !== 'win32' && existsSync(distIndex)) {
  try {
    chmodSync(distIndex, 0o755);
    console.log('Made dist/index.js executable');
  } catch (error) {
    console.warn('Could not set executable permission:', error.message);
  }
} else if (platform() === 'win32') {
  console.log('Skipping chmod on Windows (not needed)');
}
