#!/usr/bin/env tsx
/**
 * Remove Convex Fallbacks Script
 * 
 * This script removes all Convex fallback code from API routes,
 * keeping only Appwrite implementation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const API_ROUTES_DIR = path.join(process.cwd(), 'src/app/api');

async function removeConvexFallbacks() {
  // Find all API route files
  const files = await glob('**/*.ts', {
    cwd: API_ROUTES_DIR,
    ignore: ['**/*.d.ts', '**/node_modules/**'],
  });

  let totalFiles = 0;
  let modifiedFiles = 0;

  for (const file of files) {
    const filePath = path.join(API_ROUTES_DIR, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Remove Convex fallback patterns
    // Pattern 1: if (provider === 'appwrite') { ... } else { ... }
    content = content.replace(
      /const provider = getBackendProvider\(\);\s*let \w+;\s*if \(provider === 'appwrite'\) \{([^}]+)\} else \{[\s\S]*?Fallback to Convex[^}]*?\}/g,
      (match, appwriteCode) => {
        // Keep only Appwrite code, remove variable declaration and if
        const cleaned = appwriteCode
          .replace(/^\s*const\s+(\w+)\s*=\s*/, '')
          .trim();
        return cleaned;
      }
    );

    // Pattern 2: Simple else blocks with Convex imports
    content = content.replace(
      /\} else \{\s*\/\/ Fallback to Convex[^}]*?const \{ [^}]+ \} = await import\('@\/convex[^}]+?\}/gs,
      ''
    );

    // Pattern 3: provider checks
    content = content.replace(
      /const provider = getBackendProvider\(\);\s*if \(provider === 'appwrite'\) \{\s*/g,
      '// '
    );

    // Remove unused imports
    content = content.replace(
      /import.*getBackendProvider.*from.*backend.*\n/g,
      ''
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      modifiedFiles++;
      console.log(`✅ Modified: ${file}`);
    }

    totalFiles++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total files checked: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
}

removeConvexFallbacks().catch(console.error);

